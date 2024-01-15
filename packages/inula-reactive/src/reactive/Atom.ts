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

import { RContextSet, triggerRContexts } from './RContext';
import { getRNodeVal, trackReactiveData } from './RNode';
import { isFunction, isObject } from './Utils';
import {AtomNode, RNode, Root, RootRNode} from './types';

export interface Atom<T = any> extends AtomNode<T> {
  root: Root<T>;
  parent: RNode;
  parentKey: string | symbol | null;
  usedRContexts?: RContextSet;
}

const atomKey = Symbol('atomAccessKey');
export const atomSymbol = Symbol('ReactiveAtom');

// 对原始数据做响应式的时候使用
export function Atom<T>(value: T, parent: RNode | null = null, parentKey: string | symbol | null = null) {
  if (parent === null && parentKey === null) {
    this.parent = {
      parent: null,
      parentKey: null,
      root: {
        $: { [atomKey]: value },
      },
      type: atomSymbol,
    } as RootRNode<T>;
    this.parentKey = atomKey;
    this.root = this.parent.root;
  } else {
    this.parent = parent;
    this.parentKey = parentKey;
    this.root = this.parent.root;
  }
}

Atom.prototype.get = function <T>(): T {
  trackReactiveData(this);
  return this.read();
};

Atom.prototype.set = function <T>(value: T | ((prev: T) => T)) {
  // 修改Atom值与父元素值
  const prevParent = getRNodeVal(this.parent);
  const prevValue = prevParent[this.parentKey];

  const newValue = isFunction(value) ? value(prevValue) : value;

  // 如果要改为非原始对象切父元素类型不为atomSymbol，说明该对象是Atom对象，不允许：从“原生数据”变成“对象”
  if (this.parent.type === atomSymbol && isObject(newValue)) {
    throw Error('Not allowed Change Primitive to Object');
  }

  // 1) 修改Node底层原始值
  prevParent[this.parentKey] = newValue;

  // 2) 触发使用到它的RContexts
  triggerRContexts(this, prevValue, newValue, false);
  return this;
};

Atom.prototype.read = function <T>(): T {
  return getRNodeVal(this);
};
