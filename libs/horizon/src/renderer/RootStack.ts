/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
 */

import { VNode } from './vnode/VNode';
const currentRootStack: VNode[] = [];
export function getCurrentRoot() {
  return currentRootStack[currentRootStack.length - 1];
}

export function pushCurrentRoot(root: VNode) {
  return currentRootStack.push(root);
}

export function popCurrentRoot() {
  return currentRootStack.pop();
}
