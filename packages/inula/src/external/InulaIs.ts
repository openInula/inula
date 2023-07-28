/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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
import {
  TYPE_COMMON_ELEMENT,
  TYPE_CONTEXT,
  TYPE_FORWARD_REF,
  TYPE_FRAGMENT,
  TYPE_LAZY,
  TYPE_MEMO,
  TYPE_PORTAL,
  TYPE_PROVIDER,
  TYPE_SUSPENSE,
} from './JSXElementType';

function isObject(anyThing) {
  return Object.prototype.toString.call(anyThing) === '[object Object]';
}

function isBuiltinTag(type: any) {
  return [TYPE_FRAGMENT, TYPE_SUSPENSE].includes(type);
}

function isBuiltinComponent(type: any) {
  return [TYPE_MEMO, TYPE_PROVIDER, TYPE_LAZY, TYPE_FORWARD_REF, TYPE_CONTEXT].includes(type);
}
/**
 * 获取传入的element的类型
 * 1. fragment, suspense 属于内置标签，类型位于type
 * 2. memo, lazy, forwardRef 属于包装函数，产生新的对象，类型位于type.vtype
 * 3. Context.Provider/Consumer 的类型是框架定义的对象，类型位于type.vtype
 * 4. portal比较特殊，函数结果直接可以作为element，类型位于vtype
 * @param ele
 */
function getType(ele: any) {
  if (isObject(ele)) {
    const type = ele.type;
    if (isBuiltinTag(type)) {
      return type;
    }

    const vtypeOfType = type?.vtype;
    if (isBuiltinComponent(vtypeOfType)) {
      return vtypeOfType;
    }

    const vtype = ele.vtype;
    if (TYPE_PORTAL === vtype) {
      return vtype;
    }
  }

  return undefined;
}

export function isElement(ele: any) {
  return isObject(ele) && ele.vtype === TYPE_COMMON_ELEMENT;
}

export function isFragment(ele: any) {
  return getType(ele) === TYPE_FRAGMENT;
}

export function isForwardRef(ele: any) {
  return getType(ele) === TYPE_FORWARD_REF;
}

export function isLazy(ele: any) {
  return getType(ele) === TYPE_LAZY;
}

export function isMemo(ele: any) {
  return getType(ele) === TYPE_MEMO;
}

export function isPortal(ele: any) {
  return getType(ele) === TYPE_PORTAL;
}

export function isContextProvider(ele: any) {
  return getType(ele) === TYPE_PROVIDER;
}

// Context.consumer的类型就是context的类型
export function isContextConsumer(ele: any) {
  return getType(ele) === TYPE_CONTEXT;
}

export function isValidElementType(type: any) {
  if (typeof type === 'string' || typeof type === 'function' || isBuiltinTag(type)) {
    return true;
  }

  if (isObject(type)) {
    if (isBuiltinComponent(type.vtype)) {
      return true;
    }
  }

  return false;
}
