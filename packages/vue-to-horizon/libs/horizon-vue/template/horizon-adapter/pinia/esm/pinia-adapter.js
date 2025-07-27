import { vueReactive, createStore } from '@cloudsop/horizon';

function _extends() {
  _extends = Object.assign
    ? Object.assign.bind()
    : function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
  return _extends.apply(this, arguments);
}

var ref = vueReactive.ref,
  isRef = vueReactive.isRef,
  toRef = vueReactive.toRef,
  isReactive = vueReactive.isReactive,
  isReadonly = vueReactive.isReadonly;
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
  return Object.fromEntries(
    Object.entries(actions).map(function (_ref) {
      var key = _ref[0],
        value = _ref[1];
      return [
        key,
        function (state) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          return value.bind(this).apply(void 0, args);
        },
      ];
    })
  );
}
function defineOptionsStore(id, definition) {
  var state = definition.state ? definition.state() : {};
  var computed = definition.getters || {};
  var actions = enhanceActions(definition.actions) || {};
  return function () {
    if (storeMap.has(id)) {
      return storeMap.get(id)();
    }
    var useStore = createStore({
      id: id,
      state: state,
      actions: actions,
      computed: computed,
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
      if ((isRef(prop) && !isReadonly(prop)) || isReactive(prop)) {
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
    var useStore = createStore({
      id: id,
      state: state,
      computed: getters,
      actions: enhanceActions(actions),
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
    result[expandedStore.id + 'Store'] = function () {
      return expandedStore;
    };
  });
  return result;
}
function storeToRefs(store) {
  var stateRefs = Object.fromEntries(
    Object.entries(store.$s || {}).map(function (_ref2) {
      var key = _ref2[0],
        value = _ref2[1];
      return [key, ref(value)];
    })
  );
  var getterRefs = Object.fromEntries(
    Object.entries(store.$config.computed || {}).map(function (_ref3) {
      var key = _ref3[0],
        value = _ref3[1];
      var computeFn = value.bind(store, store.$s);
      return [key, toRef(computeFn)];
    })
  );
  return _extends({}, stateRefs, getterRefs);
}
function createPinia() {
  console.warn(
    'The pinia-adapter in Horizon does not support the createPinia interface. Please modify your code accordingly.'
  );
  var result = {
    install: function (app) {},
    use: function (plugin) {
      return result;
    },
    state: {},
  };
  return result;
}

export { createPinia, defineStore, mapStores, storeToRefs };
//# sourceMappingURL=pinia-adapter.js.map
