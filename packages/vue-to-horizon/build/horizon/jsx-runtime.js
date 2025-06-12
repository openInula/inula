'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

var TYPE_COMMON_ELEMENT = 1;
var TYPE_FRAGMENT = 3;
var TYPE_TEMPLATE = 12;

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

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

// 当前处理的classVNode，用于设置inst.refs
var processingClassVNode = null;
function getProcessingClassVNode() {
  return processingClassVNode;
}

// Using register component function, you can globally register function to horizon.
// This function can be then called using JSX without importing it in other component files.
// USE LOWERCASE NAMES ONLY. Otherwise jsx parser will mistake it with imported component.
var componentRegister;
function getComponentRegister() {
  if (!componentRegister) componentRegister = new Map();
  return componentRegister;
}
function kebab(value) {
  return value.replaceAll(/([a-z])([A-Z])/g, '$1-$2').replaceAll(/\s+/g, '-').toLowerCase();
}
function isComponentRegistered(name) {
  return getComponentRegister().has(kebab(name));
}

/**
 * vtype 节点的类型，这里固定是element
 * type 保存dom节点的名称或者组件的函数地址
 * key key属性
 * ref ref属性
 * props 其他常规属性
 */
function JSXElement(type, key, ref, vNode, props, source) {
  var ele = {
    // 元素标识符
    vtype: TYPE_COMMON_ELEMENT,
    src: null,
    // 属于元素的内置属性
    type: type,
    key: key,
    ref: ref,
    props: props,
    // 所属的class组件
    belongClassVNode: null
  };

  // 在 cloneDeep JSXElement 的时候会出现死循环，需要设置belongClassVNode的enumerable为false
  Object.defineProperty(ele, 'belongClassVNode', {
    configurable: false,
    enumerable: false,
    value: vNode
  });
  if (typeof type === 'function' && ref) {
    ref.current = new Proxy(ele, {
      get: function (target, prop) {
        var _target$props, _target$props$expose;
        return target === null || target === void 0 ? void 0 : (_target$props = target.props) === null || _target$props === void 0 ? void 0 : (_target$props$expose = _target$props.expose) === null || _target$props$expose === void 0 ? void 0 : _target$props$expose[prop];
      }
    });
  }
  return ele;
}
function isValidKey(key) {
  var keyArray = ['key', 'ref', '__source', '__self'];
  return !keyArray.includes(key);
}
function mergeDefault(sourceObj, defaultObj) {
  Object.keys(defaultObj).forEach(function (key) {
    if (sourceObj[key] === undefined) {
      sourceObj[key] = defaultObj[key];
    }
  });
}
var templates;
function buildElement(isClone, type, setting, children) {
  var _setting;
  // setting中的值优先级最高，clone情况下从 type 中取值，创建情况下直接赋值为 null

  function toArray(item) {
    if (!item) return [];
    if (Array.isArray(item)) return item;
    return [item];
  }
  if (typeof type === 'string' && isComponentRegistered(type)) {
    type = getComponentRegister().get(type);
  }
  if (type === 'slottedElement') {
    templates = toArray(children[0].props.children).filter(function (child) {
      return (child === null || child === void 0 ? void 0 : child.vtype) === TYPE_TEMPLATE;
    });
    children[0].props.templates = templates;
    return children[0];
  }
  if (type === 'slot') {
    var template;
    if (setting.name) {
      var _setting$templates;
      template = (_setting$templates = setting.templates) === null || _setting$templates === void 0 ? void 0 : _setting$templates.find(function (temp) {
        return temp.props.name === setting.name;
      });
    } else {
      template = setting.templates;
    }
    if (template) {
      var _template, _template$props, _template2, _template2$props;
      return typeof ((_template = template) === null || _template === void 0 ? void 0 : (_template$props = _template.props) === null || _template$props === void 0 ? void 0 : _template$props.children) === 'function' ? template.props.children(setting) : (_template2 = template) === null || _template2 === void 0 ? void 0 : (_template2$props = _template2.props) === null || _template2$props === void 0 ? void 0 : _template2$props.children;
    }
    return children;
  }
  if (type === 'template') {
    if (!setting) setting = {};
    if (!setting.name) setting.name = 'default';
    return {
      vtype: TYPE_TEMPLATE,
      src: null,
      type: type,
      props: _extends({}, setting, {
        children: setting.is ? setting.is : function () {
          return children;
        }
      }),
      belongClassVNode: null
    };
    // return children;
  }

  var key = setting && setting.key !== undefined ? String(setting.key) : isClone ? type.key : null;
  var ref = setting && setting.ref !== undefined ? setting.ref : isClone ? type.ref : null;
  var props = isClone ? _extends({}, type.props) : {};
  var vNode = isClone ? type.belongClassVNode : getProcessingClassVNode();
  if (setting !== null && setting !== undefined) {
    var keys = Object.keys(setting);
    var keyLength = keys.length;
    for (var i = 0; i < keyLength; i++) {
      var k = keys[i];
      if (isValidKey(k)) {
        props[k] = setting[k];
      }
    }
    if (setting.ref !== undefined && isClone) {
      vNode = getProcessingClassVNode();
    }
  }
  if (children.length) {
    props.children = children.length === 1 ? children[0] : children;
  }
  var element = isClone ? type.type : type;
  // 合并默认属性
  if (element && element.defaultProps) {
    mergeDefault(props, element.defaultProps);
  }
  if ((_setting = setting) !== null && _setting !== void 0 && _setting.__source) {
    ({
      fileName: setting.__source.fileName,
      lineNumber: setting.__source.lineNumber
    });
  }
  var jsxElement = JSXElement(element, key, ref, vNode, props);
  return jsxElement;
}

// 兼容高版本的babel编译方式
function jsx(type, setting, key) {
  if (setting.key === undefined && key !== undefined) {
    setting.key = key;
  }
  return buildElement(false, type, setting, []);
}

exports.Fragment = TYPE_FRAGMENT;
exports.jsx = jsx;
exports.jsxs = jsx;
