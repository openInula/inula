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

import { useEffect, useState, useRef } from 'openinula';
import { DevToolPanel } from '../utils/constants';
import {
  initBackgroundConnection,
  addBackgroundMessageListener,
  removeBackgroundMessageListener,
} from '../panelConnection';
import { Table } from './Table';
import { Tree } from './Tree';
import { fullTextSearch, omit } from './utils';
import styles from './PanelX.less';
import { Checkbox } from '../utils/Checkbox';
import { DiffTree } from './DiffTree';

const eventTypes = {
  INITIALIZED: 'inulax store initialized',
  STATE_CHANGE: 'inulax state change',
  SUBSCRIBED: 'inulax subscribed',
  UNSUBSCRIBED: 'inulax unsubscribed',
  ACTION: 'inulax action',
  ACTION_QUEUED: 'inulax action queued',
  QUEUE_PENDING: 'inulax queue pending',
  QUEUE_FINISHED: 'inulax queue finished',
};

const otherTypes = {
  GET_EVENTS: 'inulax getEvents',
  GET_PERSISTENCE: 'inulax getPersistence',
  EVENTS: 'inulax events',
  FLUSH_EVENTS: 'inulax flush events',
  SET_PERSISTENT: 'inulax setPersistent',
  RESET_EVENTS: 'inulax resetEvents',
};

function extractDataByType(message, search) {
  if (message.type === eventTypes.ACTION) {
    return (
      <div
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <Tree
          data={{
            Action: `${message.data.action.action}${message.data.fromQueue ? ' (queued)' : ''}`,
          }}
          expand={true}
          indent={-4}
          forcedExpand={true}
          search={search}
          omitAttrs={['_inulaObserver']}
        />
      </div>
    );
  }

  if (message.type === eventTypes.STATE_CHANGE) {
    return (
      <div
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <b>{`${message.data.change.vNodes.length} nodes changed:`}</b>
        <Tree
          data={message.data.change.vNodes.map(vNode => {
            return (
              <span>
                <i>{vNode.type}</i>()
              </span>
            );
          })}
        />
      </div>
    );
  }

  return <span className={styles.grey}>N/A</span>;
}

export default function EventLog({ setNextStore, setEventFilter, eventFilter }) {
  const [log, setLog] = useState([]);
  const [initlized, setInitlized] = useState(false);
  const [persistent, setPersistent] = useState(false);
  const filterField = useRef(null);

  const addFilter = (key, value) => {
    const filters = { ...eventFilter };
    filters[key] = value;

    setEventFilter(filters);
  };

  const removeFilter = key => {
    const filters = { ...eventFilter };
    delete filters[key];

    setEventFilter(filters);
  };

  if (!initlized) {
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'INULA_DEV_TOOLS',
        payload: {
          type: otherTypes.GET_EVENTS,
          tabId: chrome.devtools.inspectedWindow.tabId,
        },
        from: DevToolPanel,
      });

      chrome.runtime.sendMessage({
        type: 'INULA_DEV_TOOLS',
        payload: {
          type: otherTypes.GET_PERSISTENCE,
          tabId: chrome.devtools.inspectedWindow.tabId,
        },
        from: DevToolPanel,
      });
    }, 100);
  }

  useEffect(() => {
    const lisener = message => {
      if (message.payload.type.startsWith('inulax')) {
        if (message.payload.type === otherTypes.EVENTS) {
          setLog(message.payload.events);
          setInitlized(true);
        } else if (message.payload.type === otherTypes.SET_PERSISTENT) {
          setPersistent(message.payload.persistent);
        } else if (message.payload.type === otherTypes.FLUSH_EVENTS) {
          chrome.runtime.sendMessage({
            type: 'INULA_DEV_TOOLS',
            payload: {
              type: otherTypes.GET_EVENTS,
              tabId: chrome.devtools.inspectedWindow.tabId,
            },
            from: DevToolPanel,
          });
        }
      }
    };
    initBackgroundConnection('panel');
    addBackgroundMessageListener(lisener);
    return () => {
      removeBackgroundMessageListener(lisener);
    };
  });

  const filters = Object.entries(eventFilter);
  const usedTypes = { all: 0 };

  const processedData = log
    .filter(event => {
      if (!Object.values(eventTypes).includes(event.message.type)) {
        return false;
      }
      usedTypes.all++;
      if (!usedTypes[event.message.type]) {
        usedTypes[event.message.type] = 1;
      } else {
        usedTypes[event.message.type]++;
      }

      if (!filters.length) {
        return true;
      }

      return !filters.some(([key, value]) => {
        if (key === 'fulltext') {
          const result = fullTextSearch(event, value);
          return !result;
        }
        const keys = key.split('.');
        let search = event;
        keys.forEach(attr => {
          search = search[attr];
        });
        return value !== search;
      });
    })
    .map(event => {
      const date = new Date(event.timestamp);

      return {
        id: event.id,
        timestamp: event.timestamp,
        type: event.message.type,
        time: `${date.toLocaleTimeString()} - ${date.toLocaleDateString()}`,
        state:
          event.message.type === eventTypes.STATE_CHANGE ? (
            <DiffTree
              mutation={event.message.data.change.mutation}
              expand={true}
              forcedExpand={true}
              indent={0}
              search={eventFilter['fulltext']}
              omitAttrs={['_inulaObserver']}
              doNotDisplayIcon={true}
            />
          ) : (
            <Tree
              data={event.message.data.store.$s}
              expand={true}
              search={eventFilter['fulltext']}
              forcedExpand={true}
              indent={-4}
              omitAttrs={['_inulaObserver']}
            />
          ),
        storeClick: (
          <span
            className={styles.link}
            onClick={e => {
              e.preventDefault();
              setNextStore(event.message.data.store.id);
            }}
          >
            {event.message.data.store.id}
          </span>
        ),
        additionalData: extractDataByType(event.message, eventFilter['fulltext']),
        storeId: event.message.data.store.id,
        event,
      };
    });

  return (
    <div>
      <div style={{ marginTop: '0px', margin: '5px' }}>
        <input
          ref={filterField}
          type={'text'}
          placeholder={'Filter:'}
          className={`${styles.compositeInput} ${styles.left}`}
          onKeyUp={() => {
            if (!filterField.current.value) {
              removeFilter('fulltext');
            }
            addFilter('fulltext', filterField.current.value);
          }}
        />
        <button
          className={`${styles.bold} ${styles.compositeInput} ${styles.right}`}
          onClick={() => {
            filterField.current.value = '';
            removeFilter('fulltext');
          }}
        >
          X
        </button>
        <span className={styles.grey}>{' | '}</span>
        <span
          style={{
            cursor: 'pointer',
          }}
          onClick={e => {
            e.stopPropagation();

            chrome.runtime.sendMessage({
              type: 'INULA_DEV_TOOLS',
              payload: {
                type: otherTypes.SET_PERSISTENT,
                tabId: chrome.devtools.inspectedWindow.tabId,
                persistent: !persistent,
              },
              from: DevToolPanel,
            });

            setPersistent(!persistent);
          }}
        >
          <Checkbox value={persistent}></Checkbox> Persistent events
        </span>
        {' | '}
        <button
          onClick={() => {
            // 重置 events
            chrome.runtime.sendMessage({
              type: 'INULA_DEV_TOOLS',
              payload: {
                type: otherTypes.RESET_EVENTS,
                tabId: chrome.devtools.inspectedWindow.tabId,
              },
              from: DevToolPanel,
            });
          }}
        >
          Reset
        </button>
        {eventFilter['message.data.store.id'] ? (
          <span>
            {' | '}
            <b
              style={{
                cursor: 'pointer',
              }}
              onClick={() => {
                setNextStore(eventFilter['message.data.store.id']);
              }}
            >{` Displaying: [${eventFilter['message.data.store.id']}] `}</b>
            <button
              onClick={() => {
                removeFilter('message.data.store.id');
              }}
            >
              X
            </button>
          </span>
        ) : null}
      </div>
      <div style={{ marginTop: '0px', margin: '5px' }}>
        <button
          className={`${styles.filterButton} ${log.length ? '' : styles.grey} ${
            eventFilter['message.type'] ? '' : styles.active
          }`}
          onClick={() => {
            removeFilter('message.type');
          }}
        >
          All({usedTypes.all})
        </button>
        {Object.values(eventTypes).map(eventType => {
          return (
            <button
              className={`${styles.filterButton} ${usedTypes[eventType] ? '' : styles.grey} ${
                eventFilter['message.type'] === eventType ? styles.active : ''
              }`}
              onClick={() => {
                addFilter('message.type', eventType);
              }}
            >
              {`${eventType.replace('inulax ', '')}(${usedTypes[eventType] || 0})`}
            </button>
          );
        })}
      </div>
      <Table
        data={processedData}
        dataKey={'id'}
        displayKeys={[
          ['type', 'Event type:'],
          ['storeClick', 'Store:'],
          ['time', 'Time:'],
          ['state', 'State:'],
          ['additionalData', 'Additional data:'],
        ]}
        displayDataProcessor={data => {
          const message = data.event.message;
          return {
            type: data.type,
            store: {
              actions: Object.fromEntries(
                Object.entries(message.data.store.$config.actions).map(([id, action]) => {
                  return [id, (action as string).replace(/\{.*}/gms, '{...}').replace('function ', '')];
                })
              ),
              computed: Object.fromEntries(
                Object.keys(message.data.store.$c).map(key => [key, message.data.store.expanded[key]])
              ),
              state: message.data.store.$s,
              id: message.data.store.id,
            },
            // data: omit(data, 'storeClick', 'additionalData'),
          };
        }}
        search={eventFilter.fulltext ? eventFilter.fulltext : ''}
      />
    </div>
  );
}
