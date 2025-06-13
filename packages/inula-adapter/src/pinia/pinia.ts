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
import { createStore, StoreObj, vueReactive } from '@cloudsop/horizon';
import {
  FilterAction,
  FilterComputed,
  FilterState,
  StoreDefinition,
  StoreSetup,
  Store,
  AnyFunction,
  ActionType,
  StoreToRefsReturn,
} from './types';

const { ref, isRef, toRef, isReactive, isReadonly } = vueReactive;

const storeMap = new Map<string, any>();

export function defineStore<
  Id extends string,
  S extends Record<string, unknown>,
  A extends Record<string, AnyFunction>,
  C extends Record<string, AnyFunction>,
>(definition: StoreDefinition<Id, S, A, C>): (pinia?: any) => Store<S, A, C>;

export function defineStore<
  Id extends string,
  S extends Record<string, unknown>,
  A extends Record<string, AnyFunction>,
  C extends Record<string, AnyFunction>,
>(id: Id, definition: Omit<StoreDefinition<Id, S, A, C>, 'id'>): (pinia?: any) => Store<S, A, C>;

export function defineStore<Id extends string, SS extends Record<any, unknown>>(
  id: Id,
  setup: StoreSetup<SS>
): (pinia?: any) => Store<FilterState<SS>, FilterAction<SS>, FilterComputed<SS>>;

export function defineStore(idOrDef: any, setupOrDef?: any) {
  let id: string;
  let definition: StoreDefinition | StoreSetup;
  let isSetup = false;

  if (typeof idOrDef === 'string') {
    isSetup = typeof setupOrDef === 'function';
    id = idOrDef;
    definition = setupOrDef;
  } else {
    id = idOrDef.id;
    definition = idOrDef;
  }

  if (isSetup) {
    return defineSetupStore(id, definition as StoreSetup);
  } else {
    return defineOptionsStore(id, definition as StoreDefinition);
  }
}

/**
 * createStore实现中会给actions增加第一个参数store，pinia不需要，所以需要去掉
 * @param actions
 */
function enhanceActions(
  actions?: ActionType<Record<string, AnyFunction>, Record<string, unknown>, Record<string, AnyFunction>>
) {
  if (!actions) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(actions).map(([key, value]) => {
      return [
        key,
        function (this: StoreObj, state: Record<string, unknown>, ...args: any[]) {
          return value.bind(this)(...args);
        },
      ];
    })
  );
}

function defineOptionsStore(id: string, definition: StoreDefinition) {
  const state = definition.state ? definition.state() : {};
  const computed = definition.getters || {};
  const actions = enhanceActions(definition.actions) || {};

  return () => {
    if (storeMap.has(id)) {
      return storeMap.get(id)!();
    }

    const useStore = createStore({
      id,
      state,
      actions,
      computed,
    });

    storeMap.set(id, useStore);

    return useStore();
  };
}

function defineSetupStore<SS extends Record<string, unknown>>(id: string, storeSetup: StoreSetup<SS>) {
  return () => {
    const data = storeSetup();
    if (!data) {
      return {};
    }

    if (storeMap.has(id)) {
      return storeMap.get(id)!();
    }

    const state: Record<string, unknown> = {};
    const actions: Record<string, AnyFunction> = {};
    const getters: Record<string, AnyFunction> = {};
    for (const key in data) {
      const prop = data[key];

      if ((isRef(prop) && !isReadonly(prop)) || isReactive(prop)) {
        // state
        state[key] = prop;
      } else if (typeof prop === 'function') {
        // action
        actions[key] = prop as AnyFunction;
      } else if (isRef(prop) && isReadonly(prop)) {
        // getters
        getters[key] = (prop as any).getter as AnyFunction;
      }
    }

    const useStore = createStore({
      id,
      state,
      computed: getters,
      actions: enhanceActions(actions),
    });

    storeMap.set(id, useStore);

    return useStore();
  };
}

export function mapStores<
  S extends Record<string, unknown>,
  A extends Record<string, AnyFunction>,
  C extends Record<string, AnyFunction>,
>(...stores: (() => Store<S, A, C>)[]): { [key: string]: () => Store<S, A, C> } {
  const result: { [key: string]: () => Store<S, A, C> } = {};

  stores.forEach((store: () => Store<S, A, C>) => {
    const expandedStore = store();
    result[`${expandedStore.id}Store`] = () => expandedStore;
  });

  return result;
}

export function storeToRefs<
  S extends Record<string, unknown>,
  A extends Record<string, AnyFunction>,
  C extends Record<string, AnyFunction>,
>(store: Store<S, A, C>): StoreToRefsReturn<S, C> {
  const stateRefs = Object.fromEntries(
    Object.entries(store.$s || {}).map(([key, value]) => {
      return [key, ref(value)];
    })
  );

  const getterRefs = Object.fromEntries(
    Object.entries(store.$config.computed || {}).map(([key, value]) => {
      const computeFn = (value as () => any).bind(store, store.$s);
      return [key, toRef(computeFn)];
    })
  );

  return { ...stateRefs, ...getterRefs } as StoreToRefsReturn<S, C>;
}

export function createPinia() {
  console.warn(
    `The pinia-adapter in Horizon does not support the createPinia interface. Please modify your code accordingly.`
  );

  const result = {
    install: (app: any) => {},
    use: (plugin: any) => result,
    state: {},
  };

  return result;
}
