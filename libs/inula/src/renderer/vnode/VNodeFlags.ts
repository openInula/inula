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

/**
 * vNode结构的变化标志
 */

import type { VNode } from './VNode';

export const InitFlag = /**     */ 0;
// vNode节点的flags
export const DirectAddition = /**  */ 1 << 0; // 在本次更新前入股父dom没有子节点，说明本次可以直接添加至父节点，不需要通过 getSiblingDom 找到 before 节点
export const Addition = /**     */ 1 << 1;
export const Update = /**     */ 1 << 2;
export const Deletion = /**     */ 1 << 3;
export const ResetText = /**     */ 1 << 4;
export const Callback = /**     */ 1 << 5;
export const DidCapture = /**     */ 1 << 6;
export const Ref = /**     */ 1 << 7;
export const Snapshot = /**     */ 1 << 8;
export const Interrupted = /**     */ 1 << 9; // 被中断了，抛出错误的vNode以及它的父vNode
export const ShouldCapture = /**     */ 1 << 11;
export const ForceUpdate = /**     */ 1 << 12; // For suspense
export const Clear = /**     */ 1 << 13;
const LifecycleEffectArr = Update | Callback | Ref | Snapshot;

export const FlagUtils = {
  removeFlag(node: VNode, flag: number) {
    node.flags &= ~flag;
  },

  removeLifecycleEffectFlags(node) {
    node.flags &= ~LifecycleEffectArr;
  },

  hasAnyFlag(node: VNode) {
    // 有标志位
    return node.flags !== InitFlag;
  },

  hasFlag(node: VNode, flag) {
    return (node.flags & flag) !== 0;
  },

  setNoFlags(node: VNode) {
    node.flags = InitFlag;
  },

  markAddition(node: VNode) {
    node.flags |= Addition;
  },

  setAddition(node: VNode) {
    node.flags = Addition;
  },

  markDirectAddition(node: VNode) {
    node.flags |= DirectAddition;
  },
  markUpdate(node: VNode) {
    node.flags |= Update;
  },
  setDeletion(node: VNode) {
    node.flags = Deletion;
  },
  markContentReset(node: VNode) {
    node.flags |= ResetText;
  },
  markCallback(node: VNode) {
    node.flags |= Callback;
  },
  markDidCapture(node: VNode) {
    node.flags |= DidCapture;
  },
  markShouldCapture(node: VNode) {
    node.flags |= ShouldCapture;
  },
  markRef(node: VNode) {
    node.flags |= Ref;
  },
  markSnapshot(node: VNode) {
    node.flags |= Snapshot;
  },
  markInterrupted(node: VNode) {
    node.flags |= Interrupted;
  },
  markForceUpdate(node: VNode) {
    node.flags |= ForceUpdate;
  },

  markClear(node: VNode) {
    node.flags |= Clear;
  }
}
