/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { DevToolBackground, DevToolContentScript, DevToolPanel } from '../utils/constants';
import { connections } from './index';
import { packagePayload } from '../utils/transferUtils';

// 监听来自 content script 的消息，并将消息发送给对应的 dev tools page
const eventsPerTab = {};
const storesPerTab = {};
const observedComponents = {};
const eventPersistencePerTab = {};
let idGenerator = 1;

// 当 tab 重新加载，需要对该 tab 所监听的 stores 进行重置
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === 'loading') {
    if (!eventPersistencePerTab[tabId]) {
      eventsPerTab[tabId] = [];
    }
    storesPerTab[tabId] = [];
  }
});

function sendTo(connectionId, message) {
  if (connections[connectionId]) {
    connections[connectionId].postMessage(message);
  }
}

function requestObservedComponents(tabId) {
  setTimeout(() => {
    chrome.tabs.sendMessage(
      tabId,
      packagePayload(
        {
          type: 'inulax request observed components',
          data: {}
        },
        'dev tool background'
      )
    );
  }, 1);
}

function executeAction(tabId, storeId, action, params) {
  chrome.tabs.sendMessage(
    tabId,
    packagePayload(
      {
        type: 'inulax execute action',
        data: {
          action,
          storeId,
          params,
        }
      },
      'dev tool background'
    )
  );
}

function queueAction(tabId, storeId, action, params) {
  chrome.tabs.sendMessage(
    tabId,
    packagePayload(
      {
        type: 'inulax queue action',
        data: {
          action,
          storeId,
          params,
        }
      },
      'sev tool background'
    )
  );
}

function getObservedComponents(storeId, tabId) {
  if (!observedComponents[tabId]) {
    observedComponents[tabId] = {};
  }
  if (!observedComponents[tabId][storeId]) {
    return [];
  }
  return observedComponents[tabId][storeId];
}

// 来自 content script 的消息
chrome.runtime.onMessage.addListener(function (message, sender) {
  if (message.payload.type.startsWith('inulax')) {
    console.log('inulaXHandler message from content script', {
      payload: { ...message.payload },
    });

    if (message.from === DevToolContentScript && sender.tab?.id) {
      if (message.payload.type === 'inulax observed components') {
        observedComponents[sender.tab.id] = message.payload.data;

        sendTo(sender.tab.id, {
          type: 'INULA_DEV_TOOLS',
          payload: {
            type: 'inulax observed components',
            data: message.payload.data,
          },
          from: DevToolBackground,
        });
        return;
      }
      requestObservedComponents(sender.tab.id);

      // content script -> inulaXHandler
      if (!eventsPerTab[sender.tab.id]) {
        eventsPerTab[sender.tab.id] = [];
      }
      eventsPerTab[sender.tab.id].push({
        id: idGenerator++,
        timestamp: Date.now(),
        message: message.payload,
      });

      sendTo(sender.tab.id, {
        type: 'INULA_DEV_TOOLS',
        payload: {
          type: 'inulax events',
          events: eventsPerTab[sender.tab.id],
        },
        from: DevToolBackground,
      });

      // 如果当前 tab 没有 store data，则初始化
      if (!storesPerTab[sender.tab.id]) {
        storesPerTab[sender.tab.id] = [];
      }

      let found = false;
      storesPerTab[sender.tab.id]?.some((store, index) => {
        if (store.id === message.payload.data.store.id) {
          found = true;
          storesPerTab[sender.tab!.id!][index] = message.payload.data.store;
          requestObservedComponents(sender.tab?.id);
          return true;
        }
        return false;
      });

      if (!found) {
        const tabId = sender.tab.id;
        if (!storesPerTab[tabId]) {
          storesPerTab[tabId] = [];
        }
        storesPerTab[tabId].push(message.payload.data.store);
        sendTo(tabId, {
          type: 'INULA_DEV_TOOLS',
          payload: {
            type: 'inulax stores',
            stores: storesPerTab[tabId]?.map(store => {
              // 连接被监测的组件
              requestObservedComponents(tabId);
              const observedComponents = getObservedComponents(store, tabId);
              return { ...store, observedComponents };
            }) || [],
            newStore: message.payload.data.store.id,
          },
          from: DevToolBackground,
        });
        return;
      }

      sendTo(sender.tab.id, {
        type: 'INULA_DEV_TOOLS',
        payload: {
          type: 'inulax stores',
          stores: storesPerTab[sender.tab.id]?.map(store => {
            // 连接被监测的组件
            const observedComponents = getObservedComponents(store, sender.tab?.id);
            return { ...store, observedComponents };
          }) || [],
          updated: message.payload.data.store.id,
        },
        from: DevToolBackground,
      });

      requestObservedComponents(message.payload.tabId);
    }

    if (message.from === DevToolPanel) {
      // panel -> inulaXHandler
      if (message.payload.type === 'inulax run action') {
        executeAction(
          message.payload.tabId,
          message.payload.storeId,
          message.payload.action,
          message.payload.args
        );
        return;
      }

      if (message.payload.type === 'inulax change state') {
        chrome.tabs.sendMessage(
          message.payload.tabId,
          packagePayload(message.payload, 'dev tool background')
        );
        return;
      }

      if (message.payload.type === 'inulax queue action') {
        queueAction(
          message.payload.tabId,
          message.payload.storeId,
          message.payload.action,
          message.payload.args
        );
        return;
      }

      if (message.payload.type === 'inulax resetEvents') {
        eventsPerTab[message.payload.tabId] = [];
        sendTo(message.payload.tabId, {
          type: 'INULA_DEV_TOOLS',
          payload: {
            type: 'inulax events',
            events: eventsPerTab[message.payload.tabId],
          },
          from: DevToolBackground,
        });
        return;
      }

      if (message.payload.type === 'inula setPersistent'){
        const { tabId, persistent } = message.payload;
        eventPersistencePerTab[tabId] = persistent;
        return;
      }

      if (message.payload.type === 'inulax getPersistence') {
        sendTo(message.payload.tabId, {
          type: 'INULA_DEV_TOOLS',
          payload: {
            type: 'inulax persistence',
            persistent: !!eventPersistencePerTab[message.payload.tabId],
          },
          from: DevToolBackground,
        });
        return;
      }

      if (message.payload.type === 'inulax getEvents') {
        if (!eventsPerTab[message.payload.tabId]) {
          eventsPerTab[message.payload.tabId] = [];
        }
        sendTo(message.payload.tabId, {
          type: 'INULA_DEV_TOOLS',
          payload: {
            type: 'inulax events',
            events: eventsPerTab[message.payload.tabId],
          },
          from: DevToolBackground,
        });
        return;
      }

      if (message.payload.type === 'inulax getStores') {
        sendTo(message.payload.tabId, {
          type: 'INULA_DEV_TOOLS',
          payload: {
            type: 'inulax stores',
            stores: storesPerTab[message.payload.tabId]?.map(store => {
              requestObservedComponents(message.payload.tabId);
              const observedComponents = getObservedComponents(
                store.id,
                message.payload.tabId
              );
              return { ...store, observedComponents };
            }) || [],
          },
          from: DevToolBackground,
        });
        return;
      }
    }
  }
});
