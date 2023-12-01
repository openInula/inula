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
import {Tree} from './Tree';
import styles from './PanelX.less';

type displayKeysType = [string, string][];

export function Table({
  data,
  dataKey = 'id',
  displayKeys,
  activate,
  displayDataProcessor,
  search = '',
}: {
  data;
  dataKey: string;
  displayKeys: displayKeysType;
  activate?: {
    [key: string]: any;
  };
  displayDataProcessor: (data: { [key: string]: any }) => {
    [key: string]: any;
  };
  search: string;
}) {
  const [keyToDisplay, setKeyToDisplay] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  let displayRow = null;

  if (!manualOverride && activate) {
    data.forEach(item => {
      if (displayRow) {
        return;
      }
      let notMatch = false;
      Object.entries(activate).forEach(([key, value]) => {
        if (notMatch) {
          return;
        }
        if (item[key] !== value) {
          notMatch = true;
        }
      });
      if (notMatch) {
        return;
      }
      displayRow = item;
    });
  } else if (manualOverride && keyToDisplay) {
    data.forEach(item => {
      if (displayRow) {
        return;
      }
      if (item[dataKey] === keyToDisplay) {
        displayRow = item;
      }
    });
  }

  if (displayRow) {
    const [attr, title] = displayKeys[0];
    return (
      <div className={styles.wrapper}>
        <div className={`${styles.table} ${styles.half}`}>
          <div className={styles.row}>
            <div className={`${styles.cell} ${styles.header}`}>{title}</div>
          </div>
          <div className={styles.scrollable}>
            <span></span>
            {data.map(row => (
              <div
                className={`${styles.row} ${
                  keyToDisplay === row[dataKey] ? styles.active : ''
                }`}
                onClick={() => {
                  setManualOverride(true);
                  setKeyToDisplay(
                    keyToDisplay === row[dataKey] ? null : row[dataKey]
                  );
                }}
              >
                <div className={styles.cell}>{row?.[attr] || ''}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.table} ${styles.half} ${styles.displayData}`}>
          <div className={styles.row}>
            <div className={styles.cell}>
              <b>Data:</b>
              <button
                className={styles.floatingButton}
                onClick={() => {
                  setKeyToDisplay(null);
                }}
              >
                X
              </button>
            </div>
          </div>
          <div className={styles.scrollable}>
            <span></span>
            <div className={styles.row}>
              <div className={styles.cell}>
                <Tree
                  data={
                  displayDataProcessor
                    ? displayDataProcessor(displayRow)
                    : displayRow
                  }
                  indent={displayRow[displayKeys[0][0]]}
                  expand={true}
                  search={search}
                  forcedExpand={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.wrapper}>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.header}`}>
            {displayKeys.map(([key, title]) => (
              <div className={styles.cell}>{title}</div>
              ))}
          </div>
          {data.map(item => (
            <div
              onClick={() => {
                setManualOverride(true);
                setKeyToDisplay(item[dataKey]);
              }}
              className={styles.row}
            >
              {displayKeys.map(([key, title]) => (
                <div className={styles.cell}>{item[key]}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
