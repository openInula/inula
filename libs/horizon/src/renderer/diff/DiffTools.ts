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

import type { VNode, JSXElement } from '../Types';

// 当前vNode和element是同样的类型
// LazyComponent 会修改type的类型，所以特殊处理这种类型
export const isSameType = (vNode: VNode, ele: JSXElement) =>
  vNode.type === ele.type || (vNode.isLazyComponent && vNode.lazyType === ele.type);

export function isTextType(newChild: any) {
  return typeof newChild === 'string' || typeof newChild === 'number';
}

export function isIteratorType(newChild: any) {
  return (typeof Symbol === 'function' && newChild[Symbol.iterator]) || newChild['@@iterator'];
}

export function getIteratorFn(maybeIterable: any): () => Iterator<any> {
  return maybeIterable[Symbol.iterator] || maybeIterable['@@iterator'];
}

export function isObjectType(newChild: any) {
  return typeof newChild === 'object' && newChild !== null;
}
