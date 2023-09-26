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

import {Atom} from './Atom';
import {getRNodeVal, nodeSymbol} from './RNode';
import {AtomNode, AtomNodeFn, ProxyRNode, ProxyRNodeFn, Reactive, ReactiveProxy, RNode} from './types';
import {GET_R_NODE} from './proxy/RProxyHandler';

export function isAtom(val: unknown): val is Atom {
  return val instanceof Atom;
}

export function isRNode(val: unknown): val is RNode {
  return typeof val === 'object' && val != null && val['type'] === nodeSymbol;
}

export function isReactiveProxy(val: unknown): val is RNode {
  return typeof val === 'object' && val != null && val[GET_R_NODE] !== undefined;
}

export function isReactiveObj(val: unknown): val is ProxyRNodeFn<any> | AtomNodeFn<any> {
  return isAtom(val) || isReactiveProxy(val);
}

export function isObject(obj: unknown): boolean {
  const type = typeof obj;
  return obj != null && (type === 'object' || type === 'function');
}

export function isPrimitive(obj: unknown): boolean {
  const type = typeof obj;
  return obj != null && type !== 'object' && type !== 'function';
}

export function isFunction<T extends (...prev: any) => any>(obj: unknown): obj is T {
  return typeof obj === 'function';
}

/**
 * 如果是函数就执行，如果是reactive就调用get()
 * @param val 值/reactive对象/函数
 * @return 返回真实值
 */
export function calculateReactive(val: any | (() => any)): any {
  let ret = val;
  if (typeof val === 'function') {
    ret = val();
  }

  if (isReactiveObj(ret)) {
    ret = ret.get();
  }

  return ret;
}

export function getRNode<T = any>(rObj: ProxyRNode<T> | AtomNode<T>): RNode {
  return isReactiveProxy(rObj) ? rObj[GET_R_NODE] : rObj;
}

export function getRNodeFromProxy<T = any>(rObj: ProxyRNode<T>): RNode {
  return rObj[GET_R_NODE];
}

export function isPromise<T>(obj: unknown): obj is Promise<T> {
  return obj instanceof Promise;
}

export function getValue(value: any): any {
  if (isAtom(value)) {
    return getRNodeVal(value as Reactive);
  }
  if (isReactiveProxy(value)) {
    return getRNodeVal(value[GET_R_NODE]);
  }
  return value;
}
