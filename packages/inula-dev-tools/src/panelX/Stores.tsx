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

import { useState, useEffect } from 'openinula';
import {
  initBackgroundConnection,
  addBackgroundMessageListener,
  removeBackgroundMessageListener,
  postMessageToBackground,
} from '../panelConnection';
import { Table } from './Table';
import { omit, sendMessage } from './utils';
import styles from './PanelX.less';
import { Highlight, RemoveHighlight } from '../utils/constants';
import { ActionRunner } from './ActionRunner';
import { Tree } from './Tree';

export default function Stores({ nextStoreId, showFilteredEvents }) {
  const [stores, setStores] = useState([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized) {
    setTimeout(() => {
      sendMessage({
        type: 'inulax getStores',
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    }, 100);
  }

  useEffect(() => {
    const listener = message => {
      if (message.payload.type.startsWith('inulax')) {
        // 过滤 inula 消息
        if (message.payload.type === 'inulax stores') {
          // Stores 更新
          setStores(message.payload.stores);
          setInitialized(true);
        } else if (message.payload.type === 'inulax flush stores') {
          // Flush store
          sendMessage({
            type: 'inulax getStores',
            tabId: chrome.devtools.inspectedWindow.tabId,
          });
        } else if (message.payload.type === 'inulax observed components') {
          // observed components 更新
          setStores(
            stores.map(store => {
              store.observedComponents = message.payload.data[store.id] || [];
              return store;
            })
          );
        }
      }
    };
    initBackgroundConnection('panel');
    addBackgroundMessageListener(listener);
    return () => {
      removeBackgroundMessageListener(listener);
    };
  });
}
