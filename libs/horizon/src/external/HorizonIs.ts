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

function isObject(i) {
  return Object.prototype.toString.call(i) === '[object Object]';
}

function getType(ele: any) {
  if (isObject(ele)) {
    const type = ele.type;
    if ([TYPE_FRAGMENT, TYPE_SUSPENSE].includes(type)) {
      return type;
    }

    const vtypeOfType = type?.vtype;
    if ([TYPE_PROVIDER, TYPE_LAZY, TYPE_FORWARD_REF, TYPE_CONTEXT].includes(vtypeOfType)) {
      return vtypeOfType;
    }

    const vtype = ele.vtype;
    if([TYPE_MEMO, TYPE_FORWARD_REF, TYPE_PORTAL].includes(vtype)) {
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
