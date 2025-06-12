'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

var TYPE_COMMON_ELEMENT = 1;
var TYPE_FRAGMENT = 3;

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

/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

// 当前处理的classVNode，用于设置inst.refs
var processingClassVNode = null;
function getProcessingClassVNode() {
  return processingClassVNode;
}

var BELONG_CLASS_VNODE_KEY = typeof Symbol === 'function' ? Symbol('belongClassVNode') : 'belongClassVNode';

/**
 * vtype 节点的类型，这里固定是element
 * type 保存dom节点的名称或者组件的函数地址
 * key key属性
 * ref ref属性
 * props 其他常规属性
 */
function JSXElement(type, key, ref, vNode, props, source) {
  var ele = _defineProperty({
    // 元素标识符
    vtype: TYPE_COMMON_ELEMENT,
    src: null,
    // 属于元素的内置属性
    type: type,
    key: key,
    ref: ref,
    props: props
  }, BELONG_CLASS_VNODE_KEY, vNode);
  // 兼容IE11不支持Symbol
  if (typeof BELONG_CLASS_VNODE_KEY === 'string') {
    Object.defineProperty(ele, BELONG_CLASS_VNODE_KEY, {
      configurable: false,
      enumerable: false,
      value: vNode
    });
  }
  return ele;
}
function mergeDefault(sourceObj, defaultObj) {
  Object.keys(defaultObj).forEach(function (key) {
    if (sourceObj[key] === undefined) {
      sourceObj[key] = defaultObj[key];
    }
  });
}

// ['key', 'ref', '__source', '__self']属性不从setting获取
var keyArray = ['key', 'ref', '__source', '__self'];
function buildElement(isClone, type, setting, children) {
  // setting中的值优先级最高，clone情况下从 type 中取值，创建情况下直接赋值为 null
  var key = setting && setting.key !== undefined ? String(setting.key) : isClone ? type.key : null;
  var ref = setting && setting.ref !== undefined ? setting.ref : isClone ? type.ref : null;
  var props = isClone ? _extends({}, type.props) : {};
  var vNode = isClone ? type[BELONG_CLASS_VNODE_KEY] : getProcessingClassVNode();
  if (setting !== null && setting !== undefined) {
    for (var k in setting) {
      if (!keyArray.includes(k)) {
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
  if (setting !== null && setting !== void 0 && setting.__source) {
    ({
      fileName: setting.__source.fileName,
      lineNumber: setting.__source.lineNumber
    });
  }
  return JSXElement(element, key, ref, vNode, props);
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
