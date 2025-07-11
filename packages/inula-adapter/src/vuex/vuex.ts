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

import { createStore as createStoreX, StoreObj, vueReactive } from 'openinula';
import { VuexStore, VuexStoreOptions } from './types';
import { AnyFunction } from '../vuex/types';

const { watch, useComputed, computed } = vueReactive;

export const MUTATION_PREFIX = 'm_';
export const GETTER_PREFIX = 'g_';

const storeMap = new Map<string, any>();

// 用于保存storeX对象的getStoreX方法，主要是为了调用registerDestroyFunction
let getStoreXCache: null | (() => StoreObj) = null;

type GettersMap<T extends StoreObj = StoreObj> = {
  [K in keyof T['$c']]: ReturnType<T['$c'][K]>;
};

export function createStore<
  State extends Record<string, unknown> = Record<string, unknown>,
  Mutations extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  Actions extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  Getters extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  RootState extends Record<string, unknown> = Record<string, unknown>,
  RootGetters extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  Modules extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>,
>(
  options: VuexStoreOptions<State, Mutations, Actions, Getters, RootState, RootGetters, Modules>
): VuexStore<State, Getters, Modules> {
  const modules = options.modules || {};

  const _modules: Record<string, { storeX: StoreObj; namespaced: boolean }> = {};

  const _getters: GettersMap = {};

  const vuexStore: VuexStore = {
    state: new Proxy(
      {},
      {
        get: (_, key) => {
          if (key in _modules) {
            const storeX = _modules[key as string].storeX;
            return storeX;
          } else {
            return rootStoreX[key as string];
          }
        },
      }
    ),
    getters: new Proxy(
      {},
      {
        get: (_, key) => {
          if (typeof key === 'string') {
            // 如果key包含/，说明是访问模块的getters，进行split
            if (key.includes('/')) {
              const [moduleName, getterKey] = key.split('/');
              const storeX = _modules[moduleName].storeX;
              return storeX[`${GETTER_PREFIX}${getterKey}`];
            } else {
              return _getters[`${GETTER_PREFIX}${key}`];
            }
          }
        },
      }
    ),
    commit: (_type, _payload, _options, moduleName) => {
      const { type, payload, options } = prepareTypeParams(_type, _payload, _options);
      // 如果options.root为true，调用根store的action
      if (options?.root) {
        return rootStoreX[`${MUTATION_PREFIX}${type}`](payload);
      }

      // 包含/，说明是访问模块的mutation
      if (type.includes('/')) {
        const [moduleName, key] = type.split('/');
        return _modules[moduleName].storeX[`${MUTATION_PREFIX}${key}`](payload);
      }

      if (moduleName != undefined) {
        // dispatch到指定的module
        return _modules[moduleName].storeX[`${MUTATION_PREFIX}${type}`](payload);
      }

      // 调用所有非namespaced的modules的mutation
      Object.values(_modules).forEach(module => {
        if (!module.namespaced) {
          const mutation = module.storeX[`${MUTATION_PREFIX}${type}`];
          if (typeof mutation === 'function') {
            mutation(payload);
          }
        }
      });

      // 调用storeX对象上的方法
      if (rootStoreX[`${MUTATION_PREFIX}${type}`]) {
        rootStoreX[`${MUTATION_PREFIX}${type}`](payload);
      }
    },
    dispatch: (_type, _payload, _options, moduleName) => {
      const { type, payload, options } = prepareTypeParams(_type, _payload, _options);
      // 如果options.root为true，调用根store的action
      if (options?.root) {
        return rootStoreX[type](payload);
      }

      // 包含/，说明是访问模块的action
      if (type.includes('/')) {
        const [moduleName, key] = type.split('/');
        return _modules[moduleName].storeX[key](payload);
      }

      if (moduleName != undefined) {
        // dispatch到指定的module
        return _modules[moduleName].storeX[type](payload);
      }

      // 把每个action的返回值合并起来，支持then链式调用
      const results: any[] = [];

      // 调用所有非namespaced的modules的action
      Object.values(_modules).forEach(module => {
        if (!module.namespaced) {
          const action = module.storeX[type];
          if (typeof action === 'function') {
            results.push(action(payload));
          }
        }
      });

      // 调用storeX对象上的方法
      if (typeof rootStoreX[type] === 'function') {
        results.push(rootStoreX[type](payload));
      }

      // 返回一个Promise，内容是results，支持then链式调用
      return Promise.all(results);
    },
    subscribe(fn) {
      return rootStoreX.$subscribe(fn);
    },
    subscribeAction(fn) {
      return rootStoreX.$subscribe(fn);
    },
    watch(fn, cb) {
      watch(() => fn(vuexStore.state, vuexStore.getters), cb);
    },
    // 动态注册模块
    registerModule(key, module) {
      _modules[key] = { storeX: _createStoreX(key, module, vuexStore, rootStoreX), namespaced: !!module.namespaced };
      collectGetters(_modules[key].storeX, _getters);
    },
    // 动态注销模块
    unregisterModule(moduleName) {
      deleteGetters(_modules[moduleName].storeX, _getters);
      delete _modules[moduleName];
    },
    hasModule(moduleName) {
      return moduleName in _modules;
    },
    getModule(moduleName) {
      return _modules[moduleName]?.storeX;
    },
    install(app, key) {
      registerStore(this, key || storeKey);
    },
  };

  const rootStoreX = _createStoreX(undefined, options as VuexStoreOptions, vuexStore);
  collectGetters(rootStoreX, _getters);

  // 递归创建子模块
  for (const [moduleName, moduleOptions] of Object.entries(modules)) {
    _modules[moduleName] = {
      storeX: _createStoreX(moduleName, moduleOptions as VuexStoreOptions, vuexStore, rootStoreX),
      namespaced: !!(moduleOptions as VuexStoreOptions).namespaced,
    };
    collectGetters(_modules[moduleName].storeX, _getters);
  }

  return vuexStore as VuexStore<State, Getters, Modules>;
}

export function prepareTypeParams(
  type: string | (Record<string, unknown> & { type: string }),
  payload?: any,
  options?: Record<string, unknown>
) {
  if (typeof type === 'object' && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  return { type, payload, options } as {
    type: string;
    payload: any;
    options: Record<string, unknown>;
  };
}

function _createStoreX(
  moduleName: string | undefined,
  options: VuexStoreOptions,
  store: VuexStore,
  rootStoreX?: any
): StoreObj {
  const { mutations = {}, actions = {}, getters = {} } = options;
  const state = typeof options.state === 'function' ? options.state() : options.state;

  const getStoreX: () => StoreObj = createStoreX({
    id: moduleName,
    state: state,
    actions: {
      // 给mutations的key增加一个前缀，避免和actions的key冲突
      ...Object.fromEntries(
        Object.entries(mutations).map(([key, mutation]) => {
          return [`${MUTATION_PREFIX}${key}`, mutation];
        })
      ),
      // 重新定义action的方法，绑定this，修改第一参数
      ...Object.fromEntries(
        Object.entries(actions).map(([key, action]) => [
          key,
          function (this: StoreObj, state: Record<string, unknown>, payload) {
            rootStoreX = rootStoreX || storeX;
            const argFirst = {
              ...store,
              // 覆盖commit方法，多传一个参数moduleName
              commit: (
                type: string | (Record<string, unknown> & { type: string }),
                payload?: any,
                options?: Record<string, unknown>
              ) => {
                store.commit(type, payload, options, moduleName);
              },
              // 覆盖dispatch方法，多传一个参数moduleName
              dispatch: (
                type: string | (Record<string, unknown> & { type: string }),
                payload?: any,
                options?: Record<string, unknown>
              ) => {
                return store.dispatch(type, payload, options, moduleName);
              },
              state: storeX.$state,
              rootState: store.state,
              getter: store.getters,
              rootGetters: moduleGettersProxy(rootStoreX),
            };

            return action.call(storeX, argFirst, payload);
          },
        ])
      ),
    },
    computed: {
      ...Object.fromEntries(
        Object.entries(getters).map(([key, getter]) => {
          return [
            // 给getters的key增加一个前缀，避免和actions, mutations的key冲突
            `${GETTER_PREFIX}${key}`,
            // 重新定义getter的方法，绑定this，修改参数: state, getters, rootState, rootGetters
            function (state: Record<string, unknown>) {
              rootStoreX = rootStoreX || storeX;
              return getter.call(
                storeX,
                storeX.$state,
                store.getters,
                rootStoreX.$state,
                moduleGettersProxy(rootStoreX)
              );
            },
          ];
        })
      ),
    },
  });

  const storeX = getStoreX();
  if (getStoreXCache === null) {
    getStoreXCache = getStoreX;
  }

  return storeX;
}

function collectGetters(storeX: StoreObj, gettersMap: GettersMap): void {
  Object.keys(storeX.$config.computed).forEach(type => {
    Object.defineProperty(gettersMap, type, {
      get: () => {
        return storeX.$c[type];
      },
      configurable: true,
    });
  });
}

function deleteGetters(storeX: StoreObj, gettersMap: GettersMap): void {
  Object.keys(storeX.$config.computed).forEach(type => {
    // 删除Object.defineProperty定义的属性
    Object.defineProperty(gettersMap, type, {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    delete gettersMap[type];
  });
}

export function moduleGettersProxy(storeX: StoreObj) {
  return new Proxy(
    {},
    {
      get: (_, key) => {
        return storeX[`${GETTER_PREFIX}${key as string}`];
      },
    }
  );
}

export const storeKey = 'DEFAULT_VUEX_STORE';

export function useStore(key = storeKey) {
  getStoreXCache!();
  return storeMap.get(key);
}

export function registerStore(store: VuexStore, key = storeKey) {
  storeMap.set(key, store);
}
