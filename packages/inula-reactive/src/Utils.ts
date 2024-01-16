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

import { RNode } from './RNode';

export function isReactively(obj: any) {
  return obj instanceof RNode;
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

export function isArray(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Array]';
}
