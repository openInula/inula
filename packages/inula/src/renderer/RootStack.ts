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

import { VNode } from './vnode/VNode';

const currentRootStack: (VNode | undefined)[] = [];
let index = -1;
export function getCurrentRoot() {
  return currentRootStack[index];
}

export function pushCurrentRoot(root: VNode) {
  index++;
  currentRootStack[index] = root;
}

export function popCurrentRoot() {
  const target = currentRootStack[index];
  currentRootStack[index] = undefined;
  index--;
  return target;
}
