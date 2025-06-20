/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { moduleGettersProxy, useStore } from './vuex';
import { vueReactive, useRef, ComputedImpl } from 'openinula';

const { computed } = vueReactive;

export const useMapState = (moduleName, states) => {
  const store = useStore();
  const objRef = useRef<null | { [key: string]: ComputedImpl }>(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      states = moduleName;
      moduleName = '';
    }

    objRef.current = {};

    toArray(states).forEach(({ key, val }) => {
      let state = store.state;
      let getters = store.getters;
      if (moduleName) {
        const storeX = store.getModule(moduleName);
        if (!storeX) {
          return;
        }
        state = storeX.$state;
        getters = moduleGettersProxy(storeX);
      }

      if (typeof val === 'function') {
        objRef.current![key] = computed(function () {
          return val(state, getters);
        });
      } else {
        objRef.current![key] = computed(function () {
          return state[val];
        });
      }
    });
  }

  return objRef.current;
};

export const useMapGetters = (moduleName, getters) => {
  const store = useStore();
  const objRef = useRef<null | { [key: string]: ComputedImpl }>(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      getters = moduleName;
      moduleName = '';
    }

    objRef.current = {};

    toArray(getters).forEach(({ key, val }) => {
      if (moduleName) {
        val = `${moduleName}/${val}`;
      }

      objRef.current![key] = computed(function () {
        return store.getters[val];
      });
    });
  }

  return objRef.current;
};

export const useMapMutations = (moduleName, mutations) => {
  const store = useStore();
  const objRef = useRef<null | { [key: string]: () => any }>(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      mutations = moduleName;
      moduleName = '';
    }

    objRef.current = {};

    toArray(mutations).forEach(({ key, val }) => {
      let commit = store.commit;

      if (moduleName) {
        commit = (...args) => {
          store.commit(args[0], args[1], args[2], moduleName);
        };
      }

      if (typeof val === 'function') {
        objRef.current![key] = function (...args) {
          return val.apply(this, [commit].concat(args));
        };
      } else {
        objRef.current![key] = function (...args) {
          return commit.apply(store, [val].concat(args));
        };
      }
    });
  }

  return objRef.current;
};

export const useMapActions = (moduleName, actions) => {
  const store = useStore();
  const objRef = useRef<null | { [key: string]: () => any }>(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      actions = moduleName;
      moduleName = '';
    }

    objRef.current = {};

    toArray(actions).forEach(({ key, val }) => {
      let dispatch = store.dispatch;

      if (moduleName) {
        dispatch = (...args) => {
          store.dispatch(args[0], args[1], args[2], moduleName);
        };
      }

      if (typeof val === 'function') {
        objRef.current![key] = function (...args) {
          return val.apply(this, [dispatch].concat(args));
        };
      } else {
        objRef.current![key] = function (...args) {
          return dispatch.apply(store, [val].concat(args));
        };
      }
    });
  }

  return objRef.current;
};

function toArray(map) {
  if (!(Array.isArray(map) || (map !== null && typeof map === 'object'))) {
    return [];
  }
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }));
}
