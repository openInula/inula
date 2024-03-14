/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

export function ref(initialValue) {
  let [b, r] = window.horizon.useState(false);

  let state = window.horizon.useRef(initialValue);
  let listeners = new Set();

  return new Proxy(
    { value: initialValue },
    {
      get: (target, name) => {
        if (name === 'value' || name === 'current') {
          return state.current;
        }
        if (name === Symbol.toPrimitive) {
          return () => state.current;
        }
        if (name === 'isRef') return true;
        if (name === 'watch')
          return cb => {
            listeners.add(cb);
          };
        if (name === 'raw') return initialValue;
      },
      set: (target, name, value) => {
        if (name === 'value') {
          if (state.current === value) return true;
          state.current = value;
          r(!b);
          Array.from(listeners.values()).forEach(listener => {
            listener(value);
          });
          return true;
        } else if (name === 'current') {
          if (state.current === value) return true;
          state.current = value;
          return true;
        }
      },
    }
  );
}
