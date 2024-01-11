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

import Inula, { useRef, useState } from 'openinula';

export function Modal({
  closeModal,
  then,
  children,
}: {
  closeModal: () => void;
  then: (value: any) => void;
  children?: any[];
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  setTimeout(() => {
    inputRef.current.focus();
    inputRef.current.value = '';
  }, 10);

  const tryGatherData = () => {
    let data;
    try {
      data = eval(inputRef.current.value);
    } catch (err) {
      setError(err);
      return;
    }

    if (then) {
      then(data);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0 , 0.3)',
      }}
    >
      <div
        style={{
          top: 'calc(50vh - 50px)',
          left: 'calc(50vw - 125px)',
          width: '250px',
          backgroundColor: 'white',
          border: '1px solid black',
          position: 'fixed',
          textAlign: 'center',
        }}
      >
        <p>{children}</p>
        <p>
          <input
            ref={inputRef}
            type={'text'}
            onKeyPress={({ key }) => {
              if (key === 'Enter') {
                tryGatherData();
              }
            }}
          />
        </p>
        {error ? <p>Variable parsing error</p> : null}
        <p>
          <button
            onClick={() => {
              tryGatherData();
            }}
          >
            OK
          </button>
          <button
            onClick={() => {
              closeModal();
            }}
          >
            Cancel
          </button>
        </p>
      </div>
    </div>
  );
}
