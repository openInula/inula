/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
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
    if ([TYPE_FRAGMENT, TYPE_SUSPENSE].includes(type)) {
      return type;
    }

    const vtypeOfType = type?.vtype;
    if ([TYPE_MEMO, TYPE_PROVIDER, TYPE_LAZY, TYPE_FORWARD_REF, TYPE_CONTEXT].includes(vtypeOfType)) {
      return vtypeOfType;
    }

    const vtype = ele.vtype;
    if(TYPE_PORTAL === vtype) {
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
