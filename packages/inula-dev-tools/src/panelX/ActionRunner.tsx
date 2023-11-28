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

import Inula, { useState } from 'openinula';
import { Modal } from './Modal';
import { highlight, sendMessage } from './utils';

function executeAction(storeId: string, name: string, args: any[]) {
  sendMessage({
    type: 'inulax run action',
    tabId: chrome.devtools.inspectedWindow.tabId,
    storeId,
    action: name,
    args,
  });
}

function queryAction(storeId: string, name: string, args: any[]) {
  sendMessage({
    type: 'inulax queue action',
    tabId: chrome.devtools.inspectedWindow.tabId,
    storeId,
    action: name,
    args,
  });
}

export function ActionRunner({ foo, storeId, actionName }) {
  const [data, setState] = useState({
    modal: false,
    gatheredAttrs: [],
    query: false,
  });
  const modalIsOpen = data.modal;
  const gatheredAttrs = data.gatheredAttrs;
  function setData(val) {
    const newData = {
      modal: data.modal,
      gatheredAttrs: data.gatheredAttrs,
    };

    Object.entries(val).forEach(([key, value]) => (newData[key] = value));

    setState(newData as any);
  }

  const plainFunction = foo.replace(/\{.*}/gms, '');
  const attributes = plainFunction
    .replace(/^.*\(/g, '')
    .replace(/\).*$/, '')
    .split(/, ?/)
    .filter((item, index) => index > 0);

  return (
    <>
      <span
        title={'Run action'}
        onClick={() => {
          if (attributes.length > 0) {
            setData({ modal: false, gatheredAttrs: [], query: false });
          } else {
            executeAction(storeId, actionName, gatheredAttrs);
          }
        }}
      >
        <b
          style={{
            cursor: 'pointer',
          }}
        >
          ☼
          <span
            title={'Add to action queue'}
            onClick={e => {
              e.preventDefault();
              if (attributes.len > 0) {
                setData({ modal: true, gatheredAttrs: [], query: true });
              } else {
                queryAction(storeId, actionName, gatheredAttrs);
              }
            }}
          >
            ⌛︎{' '}
          </span>
        </b>
        <span>
          <i>{plainFunction}</i>
          {' {...}'}
        </span>
      </span>
      {modalIsOpen ? (
        <Modal
          closeModal={() => {
            setData({ modal: false });
          }}
          then={data => {
            if (gatheredAttrs.length === attributes.length - 1) {
              setData({ modal: false });
              executeAction(storeId, actionName, gatheredAttrs.concat(data));
            } else {
              setData({
                gatheredAttrs: gatheredAttrs.concat([data]),
              });
            }
          }}
        >
          <h3>{data.query ? 'Query action:' : 'Run action:'}</h3>
          <p>{highlight(plainFunction, attributes[gatheredAttrs.length])}</p>
        </Modal>
      ) : null}
    </>
  );
}
