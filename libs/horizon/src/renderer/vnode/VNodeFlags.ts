/**
 * vNode结构的变化标志
 */

import type { VNode } from '../Types';

// vNode节点的flags
export const Addition = 'Addition';
export const Update = 'Update';
export const Deletion = 'Deletion';
export const ResetText = 'ResetText';
export const Callback = 'Callback';
export const DidCapture = 'DidCapture';
export const Ref = 'Ref';
export const Snapshot = 'Snapshot';
// 被中断了，抛出错误的vNode以及它的父vNode
export const Interrupted = 'Interrupted';
export const ShouldCapture = 'ShouldCapture';
// For suspense
export const ForceUpdate = 'ForceUpdate';

const FlagArr = [Addition, Update, Deletion, ResetText, Callback, DidCapture, Ref, Snapshot, Interrupted, ShouldCapture, ForceUpdate];

const LifecycleEffectArr = [Update, Callback, Ref, Snapshot];

function resetFlag(node) {
  node.flags = {};
}

export class FlagUtils {
  static removeFlag(node: VNode, flag: string) {
    node.flags[flag] = false;
  }
  static removeLifecycleEffectFlags(node) {
    LifecycleEffectArr.forEach(key => {
      node.flags[key] = false;
    });
  }
  static hasAnyFlag(node: VNode) { // 有标志位
    let keyFlag = false;
    FlagArr.forEach(key => {
      if (node.flags[key]) {
        keyFlag = true;
        return;
      }
    });
    return keyFlag;
  }

  static setNoFlags(node: VNode) {
    resetFlag(node);
  }

  static markAddition(node: VNode) {
    node.flags.Addition = true;
  }
  static setAddition(node: VNode) {
    resetFlag(node);
    node.flags.Addition = true;
  }
  static markUpdate(node: VNode) {
    node.flags.Update = true;
  }
  static setDeletion(node: VNode) {
    resetFlag(node);
    node.flags.Deletion = true;
  }
  static markContentReset(node: VNode) {
    node.flags.ResetText = true;
  }
  static markCallback(node: VNode) {
    node.flags.Callback = true;
  }
  static markDidCapture(node: VNode) {
    node.flags.DidCapture = true;
  }
  static markShouldCapture(node: VNode) {
    node.flags.ShouldCapture = true;
  }
  static markRef(node: VNode) {
    node.flags.Ref = true;
  }
  static markSnapshot(node: VNode) {
    node.flags.Snapshot = true;
  }
  static markInterrupted(node: VNode) {
    node.flags.Interrupted = true;
  }
  static markForceUpdate(node: VNode) {
    node.flags.ForceUpdate = true;
  }
}

