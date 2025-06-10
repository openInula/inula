(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@cloudsop/horizon'), require('@cloudsop/horizon/jsx-runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', '@cloudsop/horizon', '@cloudsop/horizon/jsx-runtime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueAdapter = {}, global.Horizon, global.jsxRuntime));
})(this, (function (exports, Horizon, jsxRuntime) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Horizon__default = /*#__PURE__*/_interopDefaultLegacy(Horizon);

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
  // 用于存储组件是否已挂载的状态
  var useIsMounted = function () {
    var isMounted = Horizon.useRef(false);
    Horizon.useEffect(function () {
      isMounted.current = true;
      return function () {
        isMounted.current = false;
      };
    }, []);
    return isMounted.current;
  };
  var onBeforeMount = function (fn) {
    var isMounted = useIsMounted();
    if (!isMounted) {
      fn === null || fn === void 0 ? void 0 : fn();
    }
  };
  function onMounted(fn) {
    Horizon.useEffect(function () {
      fn === null || fn === void 0 ? void 0 : fn();
    }, []);
  }
  function onBeforeUpdate(fn) {
    Horizon.useEffect(function () {
      fn === null || fn === void 0 ? void 0 : fn();
    });
  }
  function onUpdated(fn) {
    Horizon.useEffect(function () {
      fn === null || fn === void 0 ? void 0 : fn();
    });
  }
  var onBeforeUnmount = function (fn) {
    Horizon.useLayoutEffect(function () {
      return function () {
        fn === null || fn === void 0 ? void 0 : fn();
      };
    }, []);
  };
  function onUnmounted(fn) {
    Horizon.useEffect(function () {
      return function () {
        fn === null || fn === void 0 ? void 0 : fn();
      };
    }, []);
  }

  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
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

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
    return target;
  }

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

  var vShowOriginalDisplay = Symbol('_v_show_original_display');
  var vShow = {
    beforeMount: function (el, _ref) {
      var value = _ref.value;
      el[vShowOriginalDisplay] = el.style.display === 'none' ? '' : el.style.display;
      setDisplay(el, value);
    },
    updated: function (el, _ref2) {
      var value = _ref2.value,
        oldValue = _ref2.oldValue;
      if (!value === !oldValue) return;
      setDisplay(el, value);
    },
    beforeUnmount: function (el, _ref3) {
      var value = _ref3.value;
      setDisplay(el, value);
    }
  };
  function setDisplay(el, value) {
    el.style.display = value ? el[vShowOriginalDisplay] : 'none';
  }

  var _excluded$3 = ["componentName"];
  var useInstance$3 = Horizon.vueReactive.useInstance;
  function createAppContext() {
    return {
      app: null,
      config: {
        globalProperties: {}
      },
      components: {},
      directives: {},
      provides: Object.create(null)
    };
  }
  function AppWrapper(props) {
    var AppContext = props.appContext;
    return jsxRuntime.jsx(AppContext.Provider, {
      value: props.value,
      children: props.root
    });
  }
  var DEFAULT_APP_KEY = 'DEFAULT_APP_KEY';
  var appMap = new Map();
  var AppContext = Horizon.createContext(null);
  function createApp(rootComponent) {
    var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_APP_KEY;
    var context = createAppContext();
    var installedPlugins = new WeakSet();
    var isMounted = false;
    if (typeof rootComponent === 'function') {
      rootComponent = Horizon__default["default"].createElement(rootComponent, {});
    }
    var app = context.app = {
      _container: null,
      _context: context,
      rootComponent: rootComponent,
      version: '1.0.0',
      get config() {
        return context.config;
      },
      set config(v) {},
      use: function (plugin) {
        for (var _len = arguments.length, options = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          options[_key - 1] = arguments[_key];
        }
        if (installedPlugins.has(plugin)) ; else if (plugin && typeof plugin.install === 'function') {
          installedPlugins.add(plugin);
          plugin.install.apply(plugin, [app].concat(options));
        } else if (typeof plugin === 'function') {
          installedPlugins.add(plugin);
          plugin.apply(void 0, [app].concat(options));
        }
        return app;
      },
      mixin: function (mixin) {
        // 不支持
        console.log('Horizon中暂时不支持mixin，请用Hook方式进行改造代码。');
        return app;
      },
      component: function (name, component) {
        var ccName = kebabToCamelCase(name);
        if (!component) {
          return context.components[ccName];
        }
        context.components[ccName] = component;
        return app;
      },
      directive: function (name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount: function (rootContainer) {
        if (!isMounted) {
          if (typeof rootContainer === 'string') {
            rootContainer = document.querySelector(rootContainer);
          }
          Horizon.render(jsxRuntime.jsx(AppWrapper, {
            root: app.rootComponent,
            appContext: AppContext,
            value: app
          }), rootContainer);
          isMounted = true;
          app._container = rootContainer;
        }
      },
      unmount: function () {
        if (isMounted) {
          Horizon.unmountComponentAtNode(app._container);
          delete app._container;
        }
      },
      provide: function (key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext: function (fn) {
        // 不支持
        console.log('Horizon中暂时不支持runWithContext，请手动修改相关的代码。');
        return fn();
      }
    };

    // 默认提供v-show指令
    app.directive('show', vShow);
    appMap.set(id, app);
    return app;
  }
  function useGlobalProperties(name) {
    var app = Horizon.useContext(AppContext);
    if (name) {
      return app.config.globalProperties[name];
    } else {
      return app.config.globalProperties;
    }
  }
  function useProvide(name) {
    var app = Horizon.useContext(AppContext);
    return app._context.provides[name];
  }
  function registerComponent(name, component) {
    var app = appMap.get(DEFAULT_APP_KEY);
    app.component(name, component);
  }
  function kebabToCamelCase(str) {
    return str.split('-').map(function (sub) {
      return sub.charAt(0).toUpperCase() + sub.substr(1);
    }).join('');
  }
  function GlobalComponent(_ref) {
    var componentName = _ref.componentName,
      otherProps = _objectWithoutPropertiesLoose(_ref, _excluded$3);
    var app = Horizon.useContext(AppContext);
    componentName = kebabToCamelCase(componentName);
    var Comp = app._context.components[componentName];
    if (!Comp) {
      throw new Error("Component " + componentName + " not found, please register it first.");
    }
    return jsxRuntime.jsx(Comp, _extends({}, otherProps));
  }
  function registerDirective(name, directive) {
    var app = appMap.get(DEFAULT_APP_KEY);
    app.directive(name, directive);
  }
  function useDirectives() {
    var app = Horizon.useContext(AppContext);
    return app._context.directives;
  }
  function defineAsyncComponent(loader) {
    var LazyComponent = Horizon.lazy(loader);
    return function (props) {
      return jsxRuntime.jsx(Horizon.Suspense, {
        fallback: null,
        children: jsxRuntime.jsx(LazyComponent, _extends({}, props))
      });
    };
  }
  function emit(props, eventName) {
    var fn = props[eventName];
    if (typeof fn !== 'function' && typeof eventName === 'string' && !eventName.startsWith('on')) {
      var capitalizedEventName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
      var onEventName = "on" + capitalizedEventName;
      fn = props[onEventName];
    }
    if (typeof fn === 'function') {
      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }
      fn.apply(void 0, args);
    } else {
      console.warn("Attempted to emit event '" + String(eventName) + "' but no handler was defined.");
    }
  }
  function getCurrentInstance() {
    var instance = useInstance$3();
    var app = Horizon.useContext(AppContext);
    return {
      vnode: {
        get el() {
          return instance['$el'];
        }
      },
      proxy: instance,
      appContext: {
        app: app
      }
    };
  }

  var _excluded$2 = ["children", "componentName", "directives", "registerDirectives"];
  var useInstance$2 = Horizon.vueReactive.useInstance;

  /**
   * Vue写法：<div v-click-outside:foo.bar="closePopup" v-focus class="popup">
   * Horizon写法：
   * <DirectiveComponent
   *   componentName={'div'}
   *   directives={[
   *     {
   *       name: 'click-outside',
   *       arg: 'foo',
   *       modifiers: { bar: true },
   *       value: closePopup,
   *     },
   *     {
   *       name: 'focus',
   *     },
   *   ]}
   *   class="popup"
   * >
   *   <div>child</div>
   * </DirectiveComponent>
   *
   * @param props 组件属性
   */

  function DirectiveComponent(props) {
    var children = props.children,
      componentName = props.componentName,
      directives = props.directives,
      registerDirectives = props.registerDirectives,
      rest = _objectWithoutPropertiesLoose(props, _excluded$2);
    var appDirectives = useDirectives();
    var instance = useInstance$2();
    Horizon.useLayoutEffect(function () {
      applyDirectives('beforeMount', directives);
      applyDirectives('mounted', directives);
      applyDirectives('bind', directives);
      return function () {
        applyDirectives('beforeUnmount', directives);
        applyDirectives('unmounted', directives);
        applyDirectives('unbind', directives);
      };
    }, []);
    Horizon.useEffect(function () {
      applyDirectives('updated', directives);
      applyDirectives('update', directives);
      applyDirectives('componentUpdated', directives);
    });
    var prevDirectiveValues = Horizon.useMemo(function () {
      return {};
    }, []);
    var applyDirectives = Horizon.useCallback(function (hook, directives) {
      directives.forEach(function (directive) {
        var name = directive.name,
          value = directive.value,
          arg = directive.arg,
          modifiers = directive.modifiers;
        var oldValue = prevDirectiveValues[name];
        prevDirectiveValues[name] = value;
        var directiveObj = {};
        if (registerDirectives && registerDirectives[name]) {
          directiveObj = registerDirectives[name];
        } else {
          directiveObj = appDirectives[name];
        }
        if (directiveObj && directiveObj[hook]) {
          directiveObj[hook](instance['$el'], {
            value: value,
            oldValue: oldValue,
            arg: arg,
            modifiers: modifiers
          });
        }
      });
    }, []);
    return Horizon.createElement(componentName, _extends({}, rest), children);
  }

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
  var If = function (_ref) {
    var children = _ref.children,
      condition = _ref.condition;
    return condition ? jsxRuntime.jsx(jsxRuntime.Fragment, {
      children: children
    }) : null;
  };
  var ElseIf = If;
  var Else = function (_ref2) {
    var children = _ref2.children;
    return jsxRuntime.jsx(jsxRuntime.Fragment, {
      children: children
    });
  };
  var ConditionalRenderer = function (_ref3) {
    var children = _ref3.children;
    var childrenArray = Horizon.Children.toArray(children);
    var renderedChild = childrenArray.find(function (child) {
      if (Horizon.isValidElement(child)) {
        if (child.type === If || child.type === ElseIf) {
          return child.props.condition;
        }
        if (child.type === Else) {
          return true;
        }
      }
      return false;
    });
    return renderedChild ? jsxRuntime.jsx(jsxRuntime.Fragment, {
      children: renderedChild
    }) : null;
  };

  var _excluded$1 = ["is", "components"];
  /**
   * 对标Vue的动态组件，如：<component :is="Math.random() > 0.5 ? Foo : Bar" />
   * @param is
   * @param components
   * @param componentProps
   * @constructor
   */
  function DynamicComponent(_ref) {
    var is = _ref.is,
      components = _ref.components,
      componentProps = _objectWithoutPropertiesLoose(_ref, _excluded$1);
    if (is === '') {
      return null;
    }
    var Component = null;
    if (typeof is === 'string') {
      var pascalCaseName = toPascalCase(is);
      // Look in local components first
      Component = components && components[pascalCaseName];

      // If not found, look in global components
      if (!Component) {
        var app = getCurrentInstance().appContext.app;
        Component = app._context.components[pascalCaseName];
      }
    } else if (typeof is === 'function') {
      // If 'is' is already a component, use it directly
      Component = is;
    }
    if (!Component) {
      Component = is;
    }
    return jsxRuntime.jsx(Component, _extends({}, componentProps));
  }

  // 把vue风格的组件命名转换为react风格的组件命名，如：my-component => MyComponent
  function toPascalCase(name) {
    // If the string doesn't contain hyphens, just capitalize the first letter
    if (!name.includes('-')) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // For hyphenated strings, capitalize each word
    return name.split('-').map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join('');
  }

  var useInstance$1 = Horizon.vueReactive.useInstance;
  /**
   * Custom Hook to simulate Vue's fallthrough attributes functionality
   * @param props Component props
   * @param excludeList Parameters declared as props do not fallthrough
   * @returns fallthrough attributes
   */
  function useAttrs(props) {
    var excludeList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var attrs = _extends({}, props);
    excludeList.forEach(function (key) {
      return delete attrs[key];
    });
    var instance = useInstance$1();
    instance.$attrs = attrs;
    return attrs;
  }
  /**
   * Custom Hook to simulate Vue's useSlots functionality in React
   * @param props Component props
   * @returns An object containing all slots, including the default slot
   */
  function useSlots(props) {
    var slots = {};

    // Extract template slots from props
    Object.entries(props).forEach(function (_ref) {
      var key = _ref[0],
        value = _ref[1];
      if (key.startsWith('template_')) {
        var slotName = key.replace('template_', '');
        slots[slotName] = value;
      }
    });

    // Add default slot if children are provided
    if (props.children) {
      slots.default = props.children;
    }
    return slots;
  }
  function defineExpose(exposed) {
    var instance = useInstance$1();
    if (instance) {
      // 检查 exposed 是否是一个对象
      if (typeof exposed === 'object' && exposed !== null) {
        // 遍历 exposed 对象的所有属性
        Object.keys(exposed).forEach(function (key) {
          // 将每个属性赋值给 instance
          instance[key] = exposed[key];
        });
      } else {
        console.warn('defineExpose: Argument should be an object');
      }
    } else {
      console.warn('defineExpose: No instance found. Make sure this is called inside a component setup function.');
    }
  }
  // 新的 defineEmits 函数实现
  function defineEmits(emits, props) {
    return function (eventName) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      emit.apply(void 0, [props, eventName].concat(args));
    };
  }

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

  /**
   * 将函数和属性设置到指定实例上
   * @param {Object} instance - 目标实例对象
   * @param {Array|Object} items - 要设置的函数或 [key, value] 键值对数组，或者包含方法的对象
   * @returns {Object} 返回修改后的实例（支持链式调用）
   */
  function setToInstance(instance, items) {
    // 如果是对象类型，直接遍历对象的键值对
    if (items && typeof items === 'object' && !Array.isArray(items)) {
      Object.entries(items).forEach(function (_ref) {
        var key = _ref[0],
          value = _ref[1];
        if (key) {
          instance[key] = value;
        } else {
          console.warn('跳过没有键名的项:', value);
        }
      });
      return instance;
    }

    // 处理数组类型的输入
    if (Array.isArray(items)) {
      items.forEach(function (item) {
        // 处理数组类型的 [key, value] 键值对
        if (Array.isArray(item)) {
          var key = item[0],
            value = item[1];
          if (key) {
            instance[key] = value;
          } else {
            console.warn('跳过没有键名的数组项:', item);
          }
          return;
        }

        // 处理函数类型
        if (typeof item === 'function') {
          var methodName = item.name;
          if (methodName) {
            instance[methodName] = item;
          } else {
            console.warn('跳过未命名的函数');
          }
          return;
        }

        // 处理无效的输入类型
        console.warn('跳过无效的项:', item);
      });
    } else {
      console.warn('无效的 items 类型:', items);
    }

    // 返回实例以支持链式调用
    return instance;
  }
  function styles() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    // 主处理逻辑：处理所有参数并合并结果
    return args.reduce(function (acc, arg) {
      return _extends({}, acc, processArg(arg));
    }, {});
  }

  // 辅助函数：将破折号式命名转换为驼峰式命名
  var toCamelCase = function (str) {
    return str.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  };

  // 辅助函数：处理单个样式字符串
  var processStyleString = function (styleString) {
    var result = {};
    styleString.split(';').forEach(function (item) {
      var _item$split$map = item.split(':').map(function (part) {
          return part.trim();
        }),
        key = _item$split$map[0],
        value = _item$split$map[1];
      if (key && value) {
        result[toCamelCase(key)] = value;
      }
    });
    return result;
  };

  // 辅助函数：处理样式对象
  var processStyleObject = function (styleObject) {
    var result = {};
    for (var key in styleObject) {
      var camelKey = toCamelCase(key);
      var value = styleObject[key];
      // 处理数字值
      if (typeof value === 'number' && !isNaN(value)) {
        // 某些属性不需要单位，如 zIndex, opacity 等
        if (!['zIndex', 'opacity', 'fontWeight'].includes(camelKey)) {
          value = value + "px";
        }
      }
      result[camelKey] = value;
    }
    return result;
  };

  // 处理单个参数
  var processArg = function (arg) {
    if (typeof arg === 'string') {
      return processStyleString(arg);
    } else if (Array.isArray(arg)) {
      return arg.reduce(function (acc, item) {
        return _extends({}, acc, processArg(item));
      }, {});
    } else if (typeof arg === 'object' && arg !== null) {
      return processStyleObject(arg);
    } else {
      return {}; // 处理无效输入
    }
  };

  var useInstance = Horizon.vueReactive.useInstance;

  /**
   * 判断是否应该跳过为元素设置属性
   * 通过遍历虚拟节点树来确定是否需要跳过属性设置
   * @param vNode - 虚拟节点
   * @returns 如果应该跳过则返回 true，否则返回 false
   */
  function shouldSkipSetAttrToEl(vNode) {
    var node = vNode;
    while (node.child) {
      if (node.child.next) {
        return true;
      }
      if (node.child.tag === 'DomComponent') {
        break;
      }
      node = node.child;
    }
    return false;
  }
  function useScoped() {
    var instance = useInstance();
    var preClass = Horizon.useRef(instance.$props.className);

    // 处理 className
    Horizon.useEffect(function () {
      if (shouldSkipSetAttrToEl(instance.$vnode)) {
        return;
      }
      var el = instance.$el;
      var currentClassName = instance.$props.className || '';

      // 确保元素有初始的 className
      if (!el.className) {
        el.className = '';
      }

      // 如果存在之前的类名，则替换
      if (preClass.current && el.className.includes(preClass.current)) {
        el.className = el.className.replace(preClass.current, currentClassName).trim();
      } else if (currentClassName) {
        // 如果有新的类名要添加，且没有找到之前的类名，则追加
        el.className = el.className ? (el.className + " " + currentClassName).trim() : currentClassName;
      }

      // 更新引用的类名
      preClass.current = currentClassName;
    }, [instance.$props.className]);

    // 处理 style
    Horizon.useEffect(function () {
      if (shouldSkipSetAttrToEl(instance.$vnode)) {
        return;
      }
      var el = instance.$el;
      if (instance.$props.style) {
        var styleToApply = styles(el.style.cssText, instance.$props.style);
        Object.entries(styleToApply).forEach(function (_ref) {
          var key = _ref[0],
            value = _ref[1];
          if (!key) return;
          el.style[key.trim()] = typeof value === 'string' ? value.trim() : value;
        });
      }
    }, [instance.$props.style]);

    // 处理 data-v-hash
    Horizon.useEffect(function () {
      if (shouldSkipSetAttrToEl(instance.$vnode)) {
        return;
      }
      var el = instance.$el;
      var hashKeyLength = 15;
      var key = Object.keys(instance.$props).find(function (key) {
        return key.startsWith('data-v-') && key.length === hashKeyLength;
      });
      if (key) {
        el.setAttribute(key, instance.$props[key]);
      }
    }, []);
  }

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
  var shallowReactive = Horizon.vueReactive.shallowReactive;
  /**
   * 自定义 Hook，用于处理响应式属性
   * @param rawProps 原始属性对象或 null
   * @param options 可选的配置对象，用于设置默认值
   * @returns 响应式处理后的属性对象
   */
  function useReactiveProps(rawProps) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // 使用 useRef 来存储响应式对象，确保在重渲染时保持引用
    var objRef = Horizon.useRef(null);
    if (objRef.current === null) {
      // 首次渲染时初始化属性
      objRef.current = initProps(rawProps, options);
    } else {
      // 后续更新时更新属性
      updateProps(objRef.current, rawProps, options);
    }
    useScoped();
    return objRef.current;
  }

  /**
   * 初始化属性对象
   * @param rawProps 原始属性对象或 null
   * @param options 配置对象，包含默认值
   * @returns 响应式处理后的属性对象
   */
  function initProps(rawProps, options) {
    var props = {};

    // 设置完整的属性
    setFullProps(rawProps, props, options);
    return shallowReactive(props);
  }

  /**
   * 设置完整的属性
   * @param rawProps 原始属性对象或 null
   * @param props 目标属性对象
   * @param options 属性配置对象，包含默认值等信息
   */
  function setFullProps(rawProps, props, options) {
    if (rawProps) {
      for (var _key in rawProps) {
        var value = rawProps[_key];
        props[_key] = resolvePropValue(options, _key, value);
      }
    }

    // 设置默认值
    for (var _key2 in options) {
      if (Object.prototype.hasOwnProperty.call(options, _key2) && (!Object.prototype.hasOwnProperty.call(props, _key2) || props[_key2] === undefined)) {
        props[_key2] = resolvePropValue(options, _key2, props[_key2]);
      }
    }
  }

  /**
   * 更新属性对象
   * @param props 待更新的属性对象
   * @param rawProps 包含新值的原始属性对象或 null
   * @param options 属性配置对象，包含默认值等信息
   */
  function updateProps(props, rawProps, options) {
    for (var _key3 in rawProps) {
      var value = rawProps[_key3];
      props[_key3] = resolvePropValue(options, _key3, value);
    }
  }

  /**
   * 解析属性值，考虑默认值
   * @param options 配置对象，包含默认值
   * @param key 属性键
   * @param value 当前属性值
   * @returns 解析后的属性值
   */
  function resolvePropValue(options, key, value) {
    var opt = options[key];
    if (opt != null) {
      // 设置默认值
      if (opt.default != null && value === undefined) {
        var defaultValue = opt.default;
        if (typeof defaultValue === 'function' && !(opt.type && opt.type === Function)) {
          value = defaultValue();
        } else {
          value = defaultValue;
        }
      }
    }
    return value;
  }

  var _excluded = ["value", "onChange"];
  /**
   * SemiControlledInput 组件
   *
   * 这是一个半受控的输入框组件，结合了受控和非受控组件的特性。
   * 它允许直接操作 DOM 来设置输入值，同时也响应 props 的变化。
   *
   * @param {Object} props - 组件属性
   * @param {Object} props.valueObj - 包含输入值的对象，格式为 { value: string }，为了保证SemiControlledInput每次都刷新
   * @param {function} props.onChange - 输入值变化时的回调函数
   * @param {Object} props.[...otherProps] - 其他传递给 input 元素的属性
   *
   * @returns {JSX.Element} 返回一个 input 元素
   *
   * @example
   * <SemiControlledInput
   *   valueObj={{ value: 'initialValue' }}
   *   onChange={(e) => console.log('New value:', e.target.value)}
   *   placeholder="Enter text"
   * />
   */
  var SemiControlledInput = function (_ref) {
    var _ref$value = _ref.value,
      value = _ref$value === void 0 ? {
        value: ''
      } : _ref$value,
      onChange = _ref.onChange,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);
    // 使用内部状态管理输入值，初始值为传入的 valueObj.value
    var _useState = Horizon.useState(value.value),
      internalValue = _useState[0],
      setInternalValue = _useState[1];

    // 创建一个引用，用于直接访问 input 元素
    var inputRef = Horizon.useRef(null);

    // 当传入的 valueObj 变化时，同步更新内部状态
    Horizon.useEffect(function () {
      if (value.value !== internalValue) {
        setInternalValue(value.value);
      }
    }, [value]);

    // 处理输入框值的直接修改（如通过 JavaScript 设置 value 属性）
    Horizon.useEffect(function () {
      var input = inputRef.current;
      if (!input) return;
      var handlePropertyChange = function () {
        var newValue = input.value;
        if (newValue !== internalValue) {
          setInternalValue(newValue);
          if (onChange) {
            // 触发 onChange 事件，模拟原生 input 事件
            onChange({
              target: {
                value: newValue
              }
            });
          }
        }
      };

      // 获取 input 元素 'value' 属性的原始描述符
      var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (!descriptor) return;
      var originalSetter = descriptor.set;

      // 重写 'value' 属性的 setter，以捕获直接对 value 的赋值操作
      Object.defineProperty(input, 'value', {
        get: descriptor.get,
        set: function (val) {
          originalSetter === null || originalSetter === void 0 ? void 0 : originalSetter.call(this, val);
          handlePropertyChange();
        },
        configurable: true
      });

      // 清理函数：组件卸载时恢复原始的 'value' 属性描述符
      return function () {
        Object.defineProperty(input, 'value', descriptor);
      };
    }, [onChange, internalValue]);

    // 处理输入框的 onChange 事件
    var handleChange = function (e) {
      var newValue = e.target.value;
      setInternalValue(newValue);
      if (onChange) {
        onChange(e);
      }
    };

    // 渲染 input 元素
    return jsxRuntime.jsx("input", _extends({
      ref: inputRef // 绑定 ref 到 input 元素
      ,
      value: internalValue // 使用内部状态作为输入框的值
      ,
      onChange: handleChange // 绑定 onChange 事件处理函数
    }, props));
  };

  // Allows holding multiple variables and accessing them implicitly
  var contextMap = new Map();

  // Stores context variable for current branch
  function provide(name, value) {
    // If variable already exists, it stores its local value
    if (contextMap.has(name)) {
      var ctx = contextMap.get(name);
      ctx.value = value;
      // If variable does not exist yet, it creates new context in map
    } else {
      contextMap.set(name, Horizon.createContext(value));
    }
  }
  function inject(name, defaultValue) {
    // If variable exists, local value is returned
    if (contextMap.has(name)) {
      var ctx = contextMap.get(name);
      return ctx.value;
    }
    // If there is no fallback value, error is thrown
    if (!defaultValue) {
      throw Error('Injected value is not provided. Make sure to provide it before use or add default value');
    }
    return defaultValue;
  }

  function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var n = 0, F = function () {}; return { s: F, n: function () { return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }; }, e: function (r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function () { t = t.call(r); }, n: function () { var r = t.next(); return a = r.done, r; }, e: function (r) { u = !0, o = r; }, f: function () { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
  function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
  function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) { n[e] = r[e]; } return n; }
  function onActivated(listener) {
    var listeners = inject('onActivatedListeners');
    var key = inject('keep-alive-key');
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key).add(listener);
    return function () {
      var listeners = inject('onActivatedListeners');
      var key = inject('keep-alive-key');
      listeners.get(key).delete(listener);
    };
  }
  function onDeactivated(listener) {
    var listeners = inject('onDeactivatedListeners');
    var key = inject('keep-alive-key');
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key).add(listener);
    return function () {
      var listeners = inject('onDeactivatedListeners');
      var key = inject('keep-alive-key');
      listeners.get(key).delete(listener);
    };
  }
  function checkInclude(name, whitelist, blacklist) {
    if (blacklist) {
      if (!Array.isArray(blacklist)) {
        blacklist = [blacklist];
      }
      for (var i = 0; i < blacklist.length; i++) {
        if (typeof blacklist[i] === 'string') {
          var keys = blacklist[i].split(/,\s*/g);
          for (var j = 0; j < keys.length; j++) {
            if (name === keys[j]) return false;
          }
        } else if (blacklist[i] instanceof RegExp) {
          if (blacklist[i].exec(name)) return false;
        }
      }
    }
    if (whitelist) {
      if (!Array.isArray(whitelist)) {
        whitelist = [whitelist];
      }
      for (var _i = 0; _i < whitelist.length; _i++) {
        if (typeof whitelist[_i] === 'string') {
          var _keys = whitelist[_i].split(/,\s*/g);
          for (var _j = 0; _j < _keys.length; _j++) {
            if (name === _keys[_j]) return true;
          }
        } else if (whitelist[_i] instanceof RegExp) {
          if (whitelist[_i].exec(name)) return true;
        }
      }
      return false;
    }
    return true;
  }
  var KeepAlivePro = function (_ref) {
    var _searchComponent$prop;
    var children = _ref.children,
      _ref$max = _ref.max,
      max = _ref$max === void 0 ? Infinity : _ref$max,
      include = _ref.include,
      exclude = _ref.exclude;
    var componentData;
    var componentCache = Horizon.useRef(new Map());
    var searchComponent = Array.isArray(children) ? children[0] : children;
    var componentName = searchComponent.props.ref || ((_searchComponent$prop = searchComponent.props.is) === null || _searchComponent$prop === void 0 ? void 0 : _searchComponent$prop.name);
    var onActivatedListeners = Horizon.useRef(new Map());
    var onDeactivatedListeners = Horizon.useRef(new Map());
    provide('onActivatedListeners', onActivatedListeners.current);
    provide('onDeactivatedListeners', onDeactivatedListeners.current);
    Horizon.useEffect(function () {
      // deactivate active components
      return function () {
        Array.from(componentCache.current.entries()).forEach(function (_ref2) {
          var name = _ref2[0];
            _ref2[1];
          provide('keep-alive-key', name);
          if (componentName === name) {
            var listeners = inject('onDeactivatedListeners').get(name);
            if (!listeners) return;
            Array.from(listeners).forEach(function (listener) {
              listener();
            });
          }
        });
      };
    });
    var shouldInclude = checkInclude(componentName, include, exclude);
    if (shouldInclude) {
      if (componentCache.current.has(componentName)) {
        componentData = componentCache.current.get(componentName);
        componentData.component;
        componentData.timestamp = Date.now();
      } else {
        if (componentCache.current.size >= max) {
          var minKey = '';
          var minTimestamp = Infinity;
          var _iterator = _createForOfIteratorHelper(componentCache.current),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var _step$value = _step.value,
                key = _step$value[0],
                value = _step$value[1];
              if (value.timestamp < minTimestamp) {
                minTimestamp = value.timestamp;
                minKey = key;
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          if (minKey !== null) {
            componentCache.current.delete(minKey);
          }
        }
        componentCache.current.set(componentName, {
          timestamp: Date.now(),
          component: searchComponent
        });
        componentCache.current.get(componentName);
      }
    }
    return jsxRuntime.jsxs(jsxRuntime.Fragment, {
      children: [Array.from(componentCache.current.entries()).map(function (_ref3) {
        var name = _ref3[0],
          data = _ref3[1];
        provide('keep-alive-key', name);
        if (componentName === name) {
          setTimeout(function () {
            var listeners = inject('onActivatedListeners').get(name);
            if (!listeners) return;
            Array.from(listeners).forEach(function (listener) {
              listener();
            });
          }, 1);
        }
        return jsxRuntime.jsx("div", {
          style: componentName === name ? {} : {
            display: 'none'
          },
          children: data.component
        });
      }), shouldInclude ? [] : jsxRuntime.jsx("div", {
        children: searchComponent
      })]
    });
  };

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

  var NodeKeeperLifeCycleContext = Horizon.createContext(null);

  var KEEP_ALIVE_LIFECYCLE = /*#__PURE__*/function (KEEP_ALIVE_LIFECYCLE) {
    KEEP_ALIVE_LIFECYCLE["ACTIVATE"] = "componentDidActivate";
    KEEP_ALIVE_LIFECYCLE["UNACTIVATE"] = "componentWillUnactivate";
    return KEEP_ALIVE_LIFECYCLE;
  }({});
  var useActivation = function (lifeCycleName, func) {
    var keeperCtx = Horizon.useContext(NodeKeeperLifeCycleContext);

    // 未处于 KeepAlive 中
    if (!keeperCtx) {
      return;
    }
    var preCallback = Horizon.useRef(func);
    Horizon.useEffect(function () {
      var preIndex = keeperCtx[lifeCycleName].indexOf(preCallback.current);
      if (preIndex >= 0) {
        keeperCtx[lifeCycleName].splice(preIndex, 1, func);
      } else {
        keeperCtx[lifeCycleName].push(func);
      }
      preCallback.current = func;
    }, [func]);
  };
  var useActivatePro = useActivation.bind(null, KEEP_ALIVE_LIFECYCLE.ACTIVATE);
  var useUnActivatePro = useActivation.bind(null, KEEP_ALIVE_LIFECYCLE.UNACTIVATE);

  var Keeper = function (_ref) {
    var _useRef;
    var children = _ref.children,
      active = _ref.active;
    var wrapper = Horizon.useRef(null);
    var childrenNode = Horizon.useRef([]);
    var nodeKeeperLifeCycleValue = Horizon.useRef((_useRef = {}, _defineProperty(_useRef, KEEP_ALIVE_LIFECYCLE.ACTIVATE, []), _defineProperty(_useRef, KEEP_ALIVE_LIFECYCLE.UNACTIVATE, []), _useRef));
    Horizon.useEffect(function () {
      return function () {
        childrenNode.current.forEach(function (child) {
          child.remove();
        });
        nodeKeeperLifeCycleValue.current[KEEP_ALIVE_LIFECYCLE.UNACTIVATE].forEach(function (callback) {
          callback();
        });
      };
    }, []);
    Horizon.useEffect(function () {
      if (active) {
        var _wrapper$current;
        childrenNode.current = Array.from(((_wrapper$current = wrapper.current) === null || _wrapper$current === void 0 ? void 0 : _wrapper$current.children) || []);
        childrenNode.current.forEach(function (child) {
          var _wrapper$current2, _wrapper$current2$par;
          (_wrapper$current2 = wrapper.current) === null || _wrapper$current2 === void 0 ? void 0 : (_wrapper$current2$par = _wrapper$current2.parentElement) === null || _wrapper$current2$par === void 0 ? void 0 : _wrapper$current2$par.insertBefore(child, wrapper.current);
        });
        nodeKeeperLifeCycleValue.current[KEEP_ALIVE_LIFECYCLE.ACTIVATE].forEach(function (callback) {
          callback();
        });
      } else {
        childrenNode.current.forEach(function (child) {
          var _wrapper$current3;
          (_wrapper$current3 = wrapper.current) === null || _wrapper$current3 === void 0 ? void 0 : _wrapper$current3.appendChild(child);
        });
        nodeKeeperLifeCycleValue.current[KEEP_ALIVE_LIFECYCLE.UNACTIVATE].forEach(function (callback) {
          callback();
        });
      }
    }, [active]);
    return jsxRuntime.jsx(NodeKeeperLifeCycleContext.Provider, {
      value: nodeKeeperLifeCycleValue.current,
      children: jsxRuntime.jsx("div", {
        style: {
          display: 'none'
        },
        ref: wrapper,
        children: children
      })
    });
  };

  // 更新缓存的children节点key数组
  // 当缓存的实例超过max时，移除最久没有使用的组件缓存, 并把最新的key插到尾部
  function updateCachedChildrenKeys(allKeys, lastestKey, max) {
    var index = allKeys.indexOf(lastestKey);
    var needDeletedKey = '';
    if (index >= 0) {
      // 如果已经缓存过了，则刷新位置
      allKeys.splice(index, 1);
    } else if (allKeys.length >= max) {
      // 如果没有缓存过，且已经达到最大缓存数量，则先把老的删了
      needDeletedKey = allKeys.shift();
    }
    allKeys.push(lastestKey);
    return needDeletedKey;
  }
  function isKeyMatched(key, limit) {
    if (Array.isArray(limit)) {
      return limit.find(function (limitItem) {
        return isKeyMatched(key, limitItem);
      });
    }
    if (typeof limit === 'string') {
      return limit.split(',').includes(key);
    }
    // instanceof 检查的是对象在当前执行环境下的原型链上是否存在该构造函数。
    // 如果在不同的执行环境（例如不同的 iframe 或 window）中创建了正则表达式对象，instanceof 可能不会返回 true
    if (Object.prototype.toString.call(limit) === '[object RegExp]') {
      return limit.test(key);
    }
    return false;
  }

  // 获取组件的key
  function getComponentKey(children) {
    var _children$type;
    var _children$props = children.props,
      ref = _children$props.ref,
      is = _children$props.is;
    if (ref) return ref;

    // 处理is属性
    if (is) {
      // 如果is是函数,获取函数名
      if (typeof is === 'function') {
        return is.name || is.displayName;
      }
      return is;
    }

    // fallback到组件名
    return children === null || children === void 0 ? void 0 : (_children$type = children.type) === null || _children$type === void 0 ? void 0 : _children$type.name;
  }
  function KeepAlive(_ref) {
    var children = _ref.children,
      exclude = _ref.exclude,
      include = _ref.include,
      _ref$max = _ref.max,
      max = _ref$max === void 0 ? Number.MAX_SAFE_INTEGER : _ref$max;
    var childrenMap = Horizon.useRef(new Map()); // 缓存所有的组件节点
    var cachedChildrenKeys = Horizon.useRef([]); // 已经缓存的所有children节点的key的数组，按照激活事件由老到新排序。主要用于处理max场景下，有些移除最久没用的组件缓存
    var _useState = Horizon.useState(null),
      currentChildrenKey = _useState[0],
      updateCurrentChildrenKey = _useState[1];
    var needCache = Horizon.useMemo(function () {
      var key = getComponentKey(children);
      var isInInclude = !include || isKeyMatched(key, include);
      var isNotInExclude = !exclude || !isKeyMatched(key, exclude);
      return isInInclude && isNotInExclude && max !== 0;
    }, [children, include, exclude, max]);
    Horizon.useEffect(function () {
      if (!children) {
        updateCurrentChildrenKey(null);
        return;
      }
      var key = getComponentKey(children);
      if (needCache) {
        if (key === currentChildrenKey) {
          return;
        }
        childrenMap.current.set(key, {
          key: key,
          children: children
        });
        var needDeletedKey = updateCachedChildrenKeys(cachedChildrenKeys.current, key, max);
        if (needDeletedKey) {
          childrenMap.current.delete(needDeletedKey);
        }
      } else {
        childrenMap.current.delete(key);
      }
      updateCurrentChildrenKey(key);
    }, [children]);
    return jsxRuntime.jsxs(jsxRuntime.Fragment, {
      children: [Array.from(childrenMap.current.values()).map(function (_ref2) {
        var children = _ref2.children,
          key = _ref2.key;
        return jsxRuntime.jsx(Keeper, {
          children: children,
          active: key === currentChildrenKey
        }, key);
      }), needCache ? null : children]
    });
  }

  exports.ConditionalRenderer = ConditionalRenderer;
  exports.DirectiveComponent = DirectiveComponent;
  exports.DynamicComponent = DynamicComponent;
  exports.Else = Else;
  exports.ElseIf = ElseIf;
  exports.GlobalComponent = GlobalComponent;
  exports.If = If;
  exports.KeepAlive = KeepAlive;
  exports.KeepAlivePro = KeepAlivePro;
  exports.SemiControlledInput = SemiControlledInput;
  exports.createApp = createApp;
  exports.createAppContext = createAppContext;
  exports.defineAsyncComponent = defineAsyncComponent;
  exports.defineEmits = defineEmits;
  exports.defineExpose = defineExpose;
  exports.emit = emit;
  exports.getCurrentInstance = getCurrentInstance;
  exports.initProps = initProps;
  exports.inject = inject;
  exports.onActivated = onActivated;
  exports.onBeforeMount = onBeforeMount;
  exports.onBeforeUnmount = onBeforeUnmount;
  exports.onBeforeUpdate = onBeforeUpdate;
  exports.onDeactivated = onDeactivated;
  exports.onMounted = onMounted;
  exports.onUnmounted = onUnmounted;
  exports.onUpdated = onUpdated;
  exports.provide = provide;
  exports.registerComponent = registerComponent;
  exports.registerDirective = registerDirective;
  exports.setToInstance = setToInstance;
  exports.styles = styles;
  exports.updateProps = updateProps;
  exports.useActivatePro = useActivatePro;
  exports.useAttrs = useAttrs;
  exports.useDirectives = useDirectives;
  exports.useGlobalProperties = useGlobalProperties;
  exports.useIsMounted = useIsMounted;
  exports.useProvide = useProvide;
  exports.useReactiveProps = useReactiveProps;
  exports.useSlots = useSlots;
  exports.useUnActivatePro = useUnActivatePro;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=vue-adapter.js.map
