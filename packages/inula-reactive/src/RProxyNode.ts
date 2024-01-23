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

import { createProxy } from './proxy/RProxyHandler';
import {getRNodeVal, getRootRNode, setRNodeVal} from './RNodeAccessor';
import { preciseCompare } from './comparison/InDepthComparison';
import { isObject } from './Utils';
import {RNode, Root, runEffects} from "./RNode";

export interface RNodeOptions {
  root?: Root<any> | null;
  isSignal?: boolean;
  isEffect?: boolean;
  isComputed?: boolean;
  isProxy?: boolean;
  parent?: RNode<any> | null;
  key?: KEY | null;
  equals?: (a: any, b: any) => boolean;
}

export type KEY = string | symbol;

export class RProxyNode<T = any> extends RNode<T> {
  // 维护数据结构
  root: Root<T> | null;
  parent: RProxyNode | null = null;
  key: KEY | null;
  children: Map<KEY, RProxyNode> | null = null;

  proxy: any = null;

  extend: any; // 用于扩展，放一些自定义属性

  isComputed = false;

  constructor(fnOrValue: (() => T) | T, options?: RNodeOptions) {
    super(fnOrValue, options);

    this.isComputed = options?.isComputed || false;

    this.proxy = createProxy(this);
    this.parent = options?.parent || null;
    this.key = options?.key as KEY;
    this.root = options?.root || {};

    if (this.parent && !this.parent.children) {
      this.parent.children = new Map();
      this.parent.children.set(this.key, this);
    }

    if (this.isComputed) {
      this.update();
    }
  }

  compare(prevValue: any, value: any) {
    const isObj = isObject(value);
    const isPrevObj = isObject(prevValue);

    // 新旧数据都是 对象或数组
    if (isObj && isPrevObj) {
      // preciseCompare(this, value, prevValue, false);

      this.setDirty();

      this.setValue(value);
    } else {
      if (!this.equals(prevValue, value)) {
        this.setDirty();

        this.setValue(value);
      }
    }
  }

  execute() {
    // 执行 reactive 函数
    if (this.isComputed) {
      setRNodeVal(this, this.fn!());
    }
  }

  setByArrayModified(value: T) {
    const prevValue = this.getValue();

    preciseCompare(this, value, prevValue, true);

    this.setDirty();

    this.setValue(value);

    // 运行EffectQueue
    runEffects();
  }

  getValue() {
    return getRNodeVal(this);
  }

  setValue(value: any) {
    setRNodeVal(this, value);
  }
}
