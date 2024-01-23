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

import { isPrimitive } from './Utils';
import { RNode } from './RNode';
import { ProxyRNode } from './Types';
import { RProxyNode } from './RProxyNode';
import {getRNodeVal, getRootRNode} from "./RNodeAccessor";

export type Reactive<T = any> = RNode<T> | Atom<T>;

export function createReactive<T extends any>(raw?: T): ReactiveProxy<T> {
  if (isPrimitive(raw) || raw === null || raw === undefined) {
    return new RNode(raw, { isSignal: true });
  } else {
    const node = new RProxyNode(null, {
      root: { $: raw },
    });
    return node.proxy as ReactiveProxy<T>;
  }
}

export function createComputed<T>(fn: T) {
  const rNode = new RProxyNode(fn, { isComputed: true });
  return rNode.proxy;
}

export function createWatch<T>(fn: T) {
  const rNode = new RNode(fn, {
    isEffect: true,
  });

  rNode.get();
}

export function getOrCreateChildProxy(value: unknown, parent: RProxyNode<any>, key: string | symbol): ProxyRNode<any> {
  const child = getOrCreateChildRNode(parent, key);

  return child.proxy;
}

export function getOrCreateChildRNode(node: RProxyNode<any>, key: string | symbol): RProxyNode<any> {
  let child = node.children?.get(key);

  if (!child) {
    // child = new RProxyNode(null, {
    //   parent: node,
    //   key: key,
    //   root: node.root,
    // });

    child = new RProxyNode(() => {
      const rootRNode = getRootRNode(node);
      // 依赖根
      rootRNode.get();

      return getRNodeVal(node)[key];
    }, {
      isComputed: true,
      parent: node,
      key: key,
      root: node.root,
    });
  }

  child.track();

  return child;
}
