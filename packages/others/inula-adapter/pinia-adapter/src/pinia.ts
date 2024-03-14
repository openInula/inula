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
import { createStore } from '@cloudsop/horizon';
import { ref } from './ref';

const storeMap = new Map();

export function defineStore(id, cbOrDef) {
  if (!cbOrDef && typeof id === 'object') {
    cbOrDef = id;
    id = cbOrDef.id;
  }

  if (typeof cbOrDef === 'object') {
    return defineOptionsStore(id, cbOrDef);
  }

  return () => {
    const data = cbOrDef();

    if (storeMap.has(cbOrDef)) {
      return storeMap.get(cbOrDef)();
    }

    const entries = Object.entries(data);

    const state = Object.fromEntries(entries.filter(([key, val]) => val.isRef).map(([key, val]) => [key, val.value]));
    const computed = Object.fromEntries(
      entries.filter(([key, val]) => val.isComputed).map(([key, val]) => [key, val.raw])
    );
    const actions = Object.fromEntries(entries.filter(([key, val]) => !val.isRef && !val.isComputed));

    const useStore = createStore({
      id,
      state,
      computed,
      actions: enhanceActions(actions),
    });

    Object.entries(data)
      .filter(([key, val]) => val.isRef)
      .forEach(([key, val]) =>
        val.watch(newVal => {
          useStore().$s[key] = newVal;
        })
      );

    storeMap.set(cbOrDef, useStore);

    return useStore();
  };
}

function enhanceActions(actions) {
  return Object.fromEntries(
    Object.entries(actions).map(([key, value]) => {
      return [
        key,
        function (store, ...args) {
          return value.bind(this)(...args);
        },
      ];
    })
  );
}

function defineOptionsStore(id, { state, actions, getters }) {
  if (typeof state === 'function') {
    state = state();
  }
  let useStore = null;

  return () => {
    if (!useStore) {
      useStore = createStore({
        id,
        state,
        actions: enhanceActions(actions),
        computed: getters,
      });
    }

    return useStore();
  };
}

export function mapStores(...stores) {
  const result = {};

  stores.forEach(store => {
    const expandedStore = store();
    result[`${expandedStore.id}Store`] = () => expandedStore;
  });

  return result;
}

export function storeToRefs(store) {
  return Object.fromEntries(
    Object.entries(store.$s).map(([key, value]) => {
      return [key, ref(value)];
    })
  );
}

export function createPinia() {
  const result = {
    install: app => {}, // do something?
    use: plugin => result,
    state: {}, //
  };
  return result;
}
