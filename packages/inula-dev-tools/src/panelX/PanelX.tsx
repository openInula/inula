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

import { useState } from 'openinula';
import EventLog from './EventLog';
import Stores from './Stores';
import styles from './PanelX.less';

export default function PanelX() {
  const [active, setActive] = useState('stores');
  const [nextStoreId, setNextStoreId] = useState(null);
  const [eventFilter, setEventFilter] = useState({});

  function showFilterEvents(filter) {
    setActive('events');
    setEventFilter(filter);
  }

  const tabs = [
    {
      id: 'stores',
      title: 'Stores',
      getComponent: () => <Stores nextStoreId={nextStoreId} showFilteredEvents={showFilterEvents} />,
    },
    {
      id: 'events',
      title: 'Events',
      getComponents: () => (
        <EventLog
          setNextStore={id => {
            setNextStoreId(id);
            setActive('stores');
          }}
          setEventFilter={setEventFilter}
          eventFilter={eventFilter}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        {tabs.map(tab =>
          tab.id === active ? (
            <button className={`${styles.tab} ${styles.active}`} disabled={true}>
              {tab.title}
            </button>
          ) : (
            <button
              className={styles.tab}
              onClick={() => {
                setActive(tab.id);
              }}
            >
              {tab.title}
            </button>
          )
        )}
      </div>
      {tabs.find(item => item.id === active).getComponent()}
    </div>
  );
}
