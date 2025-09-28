(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@cloudsop/horizon')) :
  typeof define === 'function' && define.amd ? define(['exports', '@cloudsop/horizon'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueAdapter = {}, global.horizon));
})(this, (function (exports, horizon) { 'use strict';

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  var ref = horizon.vueReactive.ref;
    horizon.vueReactive.reactive;
    var isRef = horizon.vueReactive.isRef;
    horizon.vueReactive.toRef;
    var isReactive = horizon.vueReactive.isReactive,
    isReadonly = horizon.vueReactive.isReadonly,
    computed = horizon.vueReactive.computed;
  var storeMap = new Map();
  function defineStore(idOrDef, setupOrDef) {
    var id;
    var definition;
    var isSetup = false;
    if (typeof idOrDef === 'string') {
      isSetup = typeof setupOrDef === 'function';
      id = idOrDef;
      definition = setupOrDef;
    } else {
      id = idOrDef.id;
      definition = idOrDef;
    }
    if (isSetup) {
      return defineSetupStore(id, definition);
    } else {
      return defineOptionsStore(id, definition);
    }
  }

  /**
   * createStore实现中会给actions增加第一个参数store，pinia不需要，所以需要去掉
   * @param actions
   */
  function enhanceActions(actions) {
    if (!actions) {
      return {};
    }
    return Object.fromEntries(Object.entries(actions).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];
      return [key, function (state) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        return value.bind(this).apply(void 0, args);
      }];
    }));
  }
  function defineOptionsStore(id, definition) {
    var state = definition.state ? definition.state() : {};
    var computedGetters = definition.getters || {};
    var actions = enhanceActions(definition.actions) || {};
    return function () {
      if (storeMap.has(id)) {
        return storeMap.get(id)();
      }
      var useStore = horizon.createStore({
        id: id,
        state: state,
        actions: actions,
        computed: computedGetters
      });
      storeMap.set(id, useStore);
      return useStore();
    };
  }
  function defineSetupStore(id, storeSetup) {
    return function () {
      var data = storeSetup();
      if (!data) {
        return {};
      }
      if (storeMap.has(id)) {
        return storeMap.get(id)();
      }
      var state = {};
      var actions = {};
      var getters = {};
      for (var key in data) {
        var prop = data[key];
        if (isRef(prop) && !isReadonly(prop) || isReactive(prop)) {
          // state
          state[key] = prop;
        } else if (typeof prop === 'function') {
          // action
          actions[key] = prop;
        } else if (isRef(prop) && isReadonly(prop)) {
          // getters
          getters[key] = prop.getter;
        }
      }
      var useStore = horizon.createStore({
        id: id,
        state: state,
        computed: getters,
        actions: enhanceActions(actions)
      });
      storeMap.set(id, useStore);
      return useStore();
    };
  }
  function mapStores() {
    var result = {};
    for (var _len2 = arguments.length, stores = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      stores[_key2] = arguments[_key2];
    }
    stores.forEach(function (store) {
      var expandedStore = store();
      result["".concat(expandedStore.id, "Store")] = function () {
        return expandedStore;
      };
    });
    return result;
  }
  function storeToRefs(store) {
    var stateRefs = {};
    var _loop = function _loop(key) {
      Object.defineProperty(stateRefs, key, {
        get: function get() {
          return ref(store.$s[key]);
        },
        set: function set(newVal) {
          store.$s[key] = newVal;
        },
        enumerable: true
      });
    };
    for (var key in store.$s) {
      _loop(key);
    }
    Object.entries(store.$config.computed || {}).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        key = _ref4[0],
        getterFn = _ref4[1];
      return stateRefs[key] = computed(function () {
        // 处理带 state 参数的 getter
        if (getterFn.length > 0) {
          return getterFn(store.$s);
        }
        // 处理无参 getter
        return getterFn.call(store);
      });
    });
    return stateRefs;
  }

  /**
   * Maps state properties from a store to an object of computed properties.
   * This helper is similar to Pinia's `mapState`.
   *
   * @param storeUseFn - The store's use-function (e.g., `useCounterStore`).
   * @param keys - An array of state keys (strings) or an object mapping new names to state keys.
   * @returns An object where keys are the state names (or aliases) and values are `vueReactive.computed` results.
   */
  function mapState(storeUseFn, keys) {
    var store = storeUseFn();
    var mapped = {};
    if (Array.isArray(keys)) {
      // If keys is an array of strings
      keys.forEach(function (key) {
        if (key in store.$s) {
          mapped[key] = computed(function () {
            return store.$s[key];
          });
        } else {
          console.warn("[mapState] State property '".concat(String(key), "' not found in store '").concat(store.id, "'."));
        }
      });
    } else {
      var _loop2 = function _loop2() {
        var originalKey = keys[alias];
        if (originalKey in store.$s) {
          mapped[alias] = computed(function () {
            return store.$s[originalKey];
          });
        } else if (typeof originalKey === 'function') {
          // 函数必须包装成 computed，才能响应式更新
          mapped[alias] = computed(function () {
            return originalKey(store.$s);
          });
        } else {
          console.warn("[mapState] State property '".concat(String(originalKey), "' (aliased as '").concat(alias, "') not found in store '").concat(store.id, "'."));
        }
      };
      // If keys is an object mapping aliases to original keys
      for (var alias in keys) {
        _loop2();
      }
    }
    return mapped;
  }

  /**
   * Maps action properties from a store to an object of functions.
   * This helper is similar to Pinia's `mapActions`.
   *
   * @param storeUseFn - The store's use-function (e.g., `useCounterStore`).
   * @param keys - An array of action keys (strings) or an object mapping new names to action keys.
   * @returns An object where keys are the action names (or aliases) and values are functions that
   * execute the corresponding action on the store instance.
   */
  function mapActions(storeUseFn, keys) {
    var store = storeUseFn();
    var mapped = {};
    if (Array.isArray(keys)) {
      // If keys is an array of strings
      keys.forEach(function (key) {
        if (key in store.$config.actions) {
          // Bind the action to the store instance
          mapped[key] = function () {
            var _store$$config$action;
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }
            (_store$$config$action = store.$config.actions[key]).call.apply(_store$$config$action, [store, store.$state].concat(args));
          };
        } else {
          console.warn("[mapActions] Action '".concat(String(key), "' not found in store '").concat(store.id, "'."));
        }
      });
    } else {
      var _loop3 = function _loop3() {
        var originalKey = keys[alias];
        if (originalKey in store.$config.actions) {
          // Bind the action to the store instance
          mapped[alias] = function () {
            var _store$$config$action2;
            for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
            }
            (_store$$config$action2 = store.$config.actions[originalKey]).call.apply(_store$$config$action2, [store, store.$state].concat(args));
          };
        } else {
          console.warn("[mapActions] Action '".concat(String(originalKey), "' (aliased as '").concat(alias, "') not found in store '").concat(store.id, "'."));
        }
      };
      // If keys is an object mapping aliases to original keys
      for (var alias in keys) {
        _loop3();
      }
    }
    return mapped;
  }
  function mapGetters(storeUseFn, keys) {
    var store = storeUseFn();
    var mapped = {};
    if (Array.isArray(keys)) {
      keys.forEach(function (key) {
        var getterKey = key;
        if (store.$config.computed && getterKey in store.$config.computed) {
          mapped[getterKey] = computed(function () {
            return store[getterKey];
          });
        } else {
          console.warn("[mapGetters] Getter '".concat(String(key), "' not found in store '").concat(store.id, "'."));
        }
      });
    } else {
      var _loop4 = function _loop4() {
        var originalKey = keys[alias];
        if (store.$config.computed && originalKey in store.$config.computed) {
          mapped[alias] = computed(function () {
            return store[originalKey];
          });
        } else {
          console.warn("[mapGetters] Getter '".concat(String(originalKey), "' (aliased as '").concat(alias, "') not found in store '").concat(store.id, "'."));
        }
      };
      for (var alias in keys) {
        _loop4();
      }
    }
    return mapped;
  }
  function mapWritableState(storeUseFn, keys) {
    var store = storeUseFn();
    var mapped = {};
    var createWritableRef = function createWritableRef(stateKey) {
      return {
        get value() {
          return store.$s[stateKey];
        },
        set value(newVal) {
          store.$s[stateKey] = newVal;
        }
      };
    };
    if (Array.isArray(keys)) {
      keys.forEach(function (key) {
        if (key in store.$s) {
          mapped[key] = createWritableRef(key);
        } else {
          console.warn("[mapWritableState] State property '".concat(String(key), "' not found in store '").concat(store.id, "'."));
        }
      });
    } else {
      for (var alias in keys) {
        var originalKey = keys[alias];
        if (originalKey in store.$s) {
          mapped[alias] = createWritableRef(originalKey);
        } else {
          console.warn("[mapWritableState] State property '".concat(String(originalKey), "' (aliased as '").concat(alias, "') not found in store '").concat(store.id, "'."));
        }
      }
    }
    return mapped;
  }
  function createPinia() {
    console.warn("The pinia-adapter in Horizon does not support the createPinia interface. Please modify your code accordingly.");
    var result = {
      install: function install(app) {},
      use: function use(plugin) {
        return result;
      },
      state: {}
    };
    return result;
  }

  exports.createPinia = createPinia;
  exports.defineStore = defineStore;
  exports.mapActions = mapActions;
  exports.mapGetters = mapGetters;
  exports.mapState = mapState;
  exports.mapStores = mapStores;
  exports.mapWritableState = mapWritableState;
  exports.storeToRefs = storeToRefs;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=pinia-adapter.js.map
