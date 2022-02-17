/**
 * vNode结构的变化标志
 */

import type { VNode } from '../Types';


export const InitFlag =   /**     */    0b000000000000;
// vNode节点的flags
export const Addition =  /**     */     0b100000000000;
export const Update =     /**     */    0b010000000000;
export const Deletion = /**     */      0b001000000000;
export const ResetText =/**     */      0b000100000000;
export const Callback =   /**     */    0b000010000000;
export const DidCapture =/**     */     0b000001000000;
export const Ref =       /**     */     0b000000100000;
export const Snapshot =  /**     */     0b000000010000;
export const Interrupted =  /**     */  0b000000001000; // 被中断了，抛出错误的vNode以及它的父vNode
export const ShouldCapture =/**     */  0b000000000100;
export const ForceUpdate = /**     */   0b000000000010; // For suspense
export const Clear =     /**     */     0b000000000001;
const LifecycleEffectArr = Update | Callback | Ref | Snapshot;

export class FlagUtils {
  static removeFlag(node: VNode, flag: number) {
    const flags = node.flags;
    node.flags = flags & (~flag);
  }
  static removeLifecycleEffectFlags(node) {
    const flags = node.flags;
    node.flags = flags & (~LifecycleEffectArr);
  }
  static hasAnyFlag(node: VNode) { // 有标志位
    return node.flags !== InitFlag;
  }

  static setNoFlags(node: VNode) {
    node.flags = InitFlag;
  }

  static markAddition(node: VNode) {
    node.flags |= Addition;
  }
  static setAddition(node: VNode) {
    node.flags = Addition;
  }
  static markUpdate(node: VNode) {
    node.flags |= Update;
  }
  static setDeletion(node: VNode) {
    node.flags = Deletion;
  }
  static markContentReset(node: VNode) {
    node.flags |= ResetText;
  }
  static markCallback(node: VNode) {
    node.flags |= Callback;
  }
  static markDidCapture(node: VNode) {
    node.flags |= DidCapture;
  }
  static markShouldCapture(node: VNode) {
    node.flags |= ShouldCapture;
  }
  static markRef(node: VNode) {
    node.flags |= Ref;
  }
  static markSnapshot(node: VNode) {
    node.flags |= Snapshot;
  }
  static markInterrupted(node: VNode) {
    node.flags |= Interrupted;
  }
  static markForceUpdate(node: VNode) {
    node.flags |= ForceUpdate;
  }

  static markClear(node: VNode) {
    node.flags |= Clear;
  }
}

