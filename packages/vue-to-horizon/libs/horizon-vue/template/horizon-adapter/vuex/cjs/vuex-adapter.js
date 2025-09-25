'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var horizon = require('@cloudsop/horizon');

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : String(i);
}

function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

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

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var _watch = horizon.vueReactive.watch;
  horizon.vueReactive.useComputed;
  horizon.vueReactive.computed;
var MUTATION_PREFIX = 'm_';
var GETTER_PREFIX = 'g_';
var storeMap = new Map();

// 用于保存storeX对象的getStoreX方法，主要是为了调用registerDestroyFunction
var getStoreXCache = null;
function createStore(options) {
  var modules = options.modules || {};
  var _modules = {};
  var _getters = {};
  var vuexStore = {
    state: new Proxy({}, {
      get: function get(_, key) {
        if (key in _modules) {
          var storeX = _modules[key].storeX;
          return storeX;
        } else {
          return rootStoreX[key];
        }
      }
    }),
    getters: new Proxy({}, {
      get: function get(_, key) {
        if (typeof key === 'string') {
          // 如果key包含/，说明是访问模块的getters，进行split
          if (key.includes('/')) {
            var _key$split = key.split('/'),
              _key$split2 = _slicedToArray(_key$split, 2),
              moduleName = _key$split2[0],
              getterKey = _key$split2[1];
            var storeX = _modules[moduleName].storeX;
            return storeX["".concat(GETTER_PREFIX).concat(getterKey)];
          } else {
            return _getters["".concat(GETTER_PREFIX).concat(key)];
          }
        }
      }
    }),
    commit: function commit(_type, _payload, _options, moduleName) {
      var _prepareTypeParams = prepareTypeParams(_type, _payload, _options),
        type = _prepareTypeParams.type,
        payload = _prepareTypeParams.payload,
        options = _prepareTypeParams.options;
      // 如果options.root为true，调用根store的action
      if (options !== null && options !== void 0 && options.root) {
        return rootStoreX["".concat(MUTATION_PREFIX).concat(type)](payload);
      }

      // 包含/，说明是访问模块的mutation
      if (type.includes('/')) {
        var _type$split = type.split('/'),
          _type$split2 = _slicedToArray(_type$split, 2),
          _moduleName = _type$split2[0],
          key = _type$split2[1];
        return _modules[_moduleName].storeX["".concat(MUTATION_PREFIX).concat(key)](payload);
      }
      if (moduleName != undefined) {
        // dispatch到指定的module
        return _modules[moduleName].storeX["".concat(MUTATION_PREFIX).concat(type)](payload);
      }

      // 调用所有非namespaced的modules的mutation
      Object.values(_modules).forEach(function (module) {
        if (!module.namespaced) {
          var mutation = module.storeX["".concat(MUTATION_PREFIX).concat(type)];
          if (typeof mutation === 'function') {
            mutation(payload);
          }
        }
      });

      // 调用storeX对象上的方法
      if (rootStoreX["".concat(MUTATION_PREFIX).concat(type)]) {
        rootStoreX["".concat(MUTATION_PREFIX).concat(type)](payload);
      }
    },
    dispatch: function dispatch(_type, _payload, _options, moduleName) {
      var _prepareTypeParams2 = prepareTypeParams(_type, _payload, _options),
        type = _prepareTypeParams2.type,
        payload = _prepareTypeParams2.payload,
        options = _prepareTypeParams2.options;
      // 如果options.root为true，调用根store的action
      if (options !== null && options !== void 0 && options.root) {
        return rootStoreX[type](payload);
      }

      // 包含/，说明是访问模块的action
      if (type.includes('/')) {
        var _type$split3 = type.split('/'),
          _type$split4 = _slicedToArray(_type$split3, 2),
          _moduleName2 = _type$split4[0],
          key = _type$split4[1];
        return _modules[_moduleName2].storeX[key](payload);
      }
      if (moduleName != undefined) {
        // dispatch到指定的module
        return _modules[moduleName].storeX[type](payload);
      }

      // 把每个action的返回值合并起来，支持then链式调用
      var results = [];

      // 调用所有非namespaced的modules的action
      Object.values(_modules).forEach(function (module) {
        if (!module.namespaced) {
          var action = module.storeX[type];
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
    subscribe: function subscribe(fn) {
      return rootStoreX.$subscribe(fn);
    },
    subscribeAction: function subscribeAction(fn) {
      return rootStoreX.$subscribe(fn);
    },
    watch: function watch(fn, cb) {
      _watch(function () {
        return fn(vuexStore.state, vuexStore.getters);
      }, cb);
    },
    // 动态注册模块
    registerModule: function registerModule(key, module) {
      _modules[key] = {
        storeX: _createStoreX(key, module, vuexStore, rootStoreX),
        namespaced: !!module.namespaced
      };
      collectGetters(_modules[key].storeX, _getters);
    },
    // 动态注销模块
    unregisterModule: function unregisterModule(moduleName) {
      deleteGetters(_modules[moduleName].storeX, _getters);
      delete _modules[moduleName];
    },
    hasModule: function hasModule(moduleName) {
      return moduleName in _modules;
    },
    getModule: function getModule(moduleName) {
      var _modules$moduleName;
      return (_modules$moduleName = _modules[moduleName]) === null || _modules$moduleName === void 0 ? void 0 : _modules$moduleName.storeX;
    },
    install: function install(app, key) {
      registerStore(this, key || storeKey);
    }
  };
  var rootStoreX = _createStoreX(undefined, options, vuexStore);
  collectGetters(rootStoreX, _getters);

  // 递归创建子模块
  for (var _i = 0, _Object$entries = Object.entries(modules); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      moduleName = _Object$entries$_i[0],
      moduleOptions = _Object$entries$_i[1];
    _modules[moduleName] = {
      storeX: _createStoreX(moduleName, moduleOptions, vuexStore, rootStoreX),
      namespaced: !!moduleOptions.namespaced
    };
    collectGetters(_modules[moduleName].storeX, _getters);
  }
  return vuexStore;
}
function prepareTypeParams(type, payload, options) {
  if (_typeof(type) === 'object' && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }
  return {
    type: type,
    payload: payload,
    options: options
  };
}
function _createStoreX(moduleName, options, store, rootStoreX) {
  var _options$mutations = options.mutations,
    mutations = _options$mutations === void 0 ? {} : _options$mutations,
    _options$actions = options.actions,
    actions = _options$actions === void 0 ? {} : _options$actions,
    _options$getters = options.getters,
    getters = _options$getters === void 0 ? {} : _options$getters;
  var state = typeof options.state === 'function' ? options.state() : options.state;
  var getStoreX = horizon.createStore({
    id: moduleName,
    state: state,
    actions: _objectSpread(_objectSpread({}, Object.fromEntries(Object.entries(mutations).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        mutation = _ref2[1];
      return ["".concat(MUTATION_PREFIX).concat(key), mutation];
    }))), Object.fromEntries(Object.entries(actions).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        key = _ref4[0],
        action = _ref4[1];
      return [key, function (state, payload) {
        rootStoreX = rootStoreX || storeX;
        var argFirst = _objectSpread(_objectSpread({}, store), {}, {
          // 覆盖commit方法，多传一个参数moduleName
          commit: function commit(type, payload, options) {
            store.commit(type, payload, options, moduleName);
          },
          // 覆盖dispatch方法，多传一个参数moduleName
          dispatch: function dispatch(type, payload, options) {
            return store.dispatch(type, payload, options, moduleName);
          },
          state: storeX.$state,
          rootState: store.state,
          getter: store.getters,
          rootGetters: moduleGettersProxy(rootStoreX)
        });
        return action.call(storeX, argFirst, payload);
      }];
    }))),
    computed: _objectSpread({}, Object.fromEntries(Object.entries(getters).map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        key = _ref6[0],
        getter = _ref6[1];
      return [// 给getters的key增加一个前缀，避免和actions, mutations的key冲突
      "".concat(GETTER_PREFIX).concat(key),
      // 重新定义getter的方法，绑定this，修改参数: state, getters, rootState, rootGetters
      function (state) {
        rootStoreX = rootStoreX || storeX;
        return getter.call(storeX, storeX.$state, store.getters, rootStoreX.$state, moduleGettersProxy(rootStoreX));
      }];
    })))
  });
  var storeX = getStoreX();
  if (getStoreXCache === null) {
    getStoreXCache = getStoreX;
  }
  return storeX;
}
function collectGetters(storeX, gettersMap) {
  Object.keys(storeX.$config.computed).forEach(function (type) {
    Object.defineProperty(gettersMap, type, {
      get: function get() {
        return storeX.$c[type];
      },
      configurable: true
    });
  });
}
function deleteGetters(storeX, gettersMap) {
  Object.keys(storeX.$config.computed).forEach(function (type) {
    // 删除Object.defineProperty定义的属性
    Object.defineProperty(gettersMap, type, {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true
    });
    delete gettersMap[type];
  });
}
function moduleGettersProxy(storeX) {
  return new Proxy({}, {
    get: function get(_, key) {
      return storeX["".concat(GETTER_PREFIX).concat(key)];
    }
  });
}
var storeKey = 'DEFAULT_VUEX_STORE';
function useStore() {
  var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : storeKey;
  getStoreXCache();
  return storeMap.get(key);
}
function registerStore(store) {
  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : storeKey;
  storeMap.set(key, store);
}

var computed = horizon.vueReactive.computed;
var useMapState = function useMapState(moduleName, states) {
  var store = useStore();
  var objRef = horizon.useRef(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      states = moduleName;
      moduleName = '';
    }
    objRef.current = {};
    toArray(states).forEach(function (_ref) {
      var key = _ref.key,
        val = _ref.val;
      var state = store.state;
      var getters = store.getters;
      if (moduleName) {
        var storeX = store.getModule(moduleName);
        if (!storeX) {
          return;
        }
        state = storeX.$state;
        getters = moduleGettersProxy(storeX);
      }
      if (typeof val === 'function') {
        objRef.current[key] = computed(function () {
          return val(state, getters);
        });
      } else {
        objRef.current[key] = computed(function () {
          return state[val];
        });
      }
    });
  }
  return objRef.current;
};
var useMapGetters = function useMapGetters(moduleName, getters) {
  var store = useStore();
  var objRef = horizon.useRef(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      getters = moduleName;
      moduleName = '';
    }
    objRef.current = {};
    toArray(getters).forEach(function (_ref2) {
      var key = _ref2.key,
        val = _ref2.val;
      if (moduleName) {
        val = "".concat(moduleName, "/").concat(val);
      }
      objRef.current[key] = computed(function () {
        return store.getters[val];
      });
    });
  }
  return objRef.current;
};
var useMapMutations = function useMapMutations(moduleName, mutations) {
  var store = useStore();
  var objRef = horizon.useRef(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      mutations = moduleName;
      moduleName = '';
    }
    objRef.current = {};
    toArray(mutations).forEach(function (_ref3) {
      var key = _ref3.key,
        val = _ref3.val;
      var commit = store.commit;
      if (moduleName) {
        commit = function commit() {
          store.commit(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1], arguments.length <= 2 ? undefined : arguments[2], moduleName);
        };
      }
      if (typeof val === 'function') {
        objRef.current[key] = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return val.apply(this, [commit].concat(args));
        };
      } else {
        objRef.current[key] = function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          return commit.apply(store, [val].concat(args));
        };
      }
    });
  }
  return objRef.current;
};
var useMapActions = function useMapActions(moduleName, actions) {
  var store = useStore();
  var objRef = horizon.useRef(null);
  if (objRef.current === null) {
    if (typeof moduleName !== 'string') {
      actions = moduleName;
      moduleName = '';
    }
    objRef.current = {};
    toArray(actions).forEach(function (_ref4) {
      var key = _ref4.key,
        val = _ref4.val;
      var dispatch = store.dispatch;
      if (moduleName) {
        dispatch = function dispatch() {
          store.dispatch(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1], arguments.length <= 2 ? undefined : arguments[2], moduleName);
        };
      }
      if (typeof val === 'function') {
        objRef.current[key] = function () {
          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }
          return val.apply(this, [dispatch].concat(args));
        };
      } else {
        objRef.current[key] = function () {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }
          return dispatch.apply(store, [val].concat(args));
        };
      }
    });
  }
  return objRef.current;
};
function toArray(map) {
  if (!(Array.isArray(map) || map !== null && _typeof(map) === 'object')) {
    return [];
  }
  return Array.isArray(map) ? map.map(function (key) {
    return {
      key: key,
      val: key
    };
  }) : Object.keys(map).map(function (key) {
    return {
      key: key,
      val: map[key]
    };
  });
}

exports.GETTER_PREFIX = GETTER_PREFIX;
exports.MUTATION_PREFIX = MUTATION_PREFIX;
exports.createStore = createStore;
exports.moduleGettersProxy = moduleGettersProxy;
exports.prepareTypeParams = prepareTypeParams;
exports.registerStore = registerStore;
exports.storeKey = storeKey;
exports.useMapActions = useMapActions;
exports.useMapGetters = useMapGetters;
exports.useMapMutations = useMapMutations;
exports.useMapState = useMapState;
exports.useStore = useStore;
//# sourceMappingURL=vuex-adapter.js.map
