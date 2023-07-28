/**
 * vNode结构的变化标志
 */
import type { VNode } from './VNode';
export declare const InitFlag = /**     */ 0;
export declare const DirectAddition: number;
export declare const Addition: number;
export declare const Update: number;
export declare const Deletion: number;
export declare const ResetText: number;
export declare const Callback: number;
export declare const DidCapture: number;
export declare const Ref: number;
export declare const Snapshot: number;
export declare const Interrupted: number;
export declare const ShouldCapture: number;
export declare const ForceUpdate: number;
export declare const Clear: number;
export declare const FlagUtils: {
    removeFlag(node: VNode, flag: number): void;
    removeLifecycleEffectFlags(node: any): void;
    hasAnyFlag(node: VNode): boolean;
    hasFlag(node: VNode, flag: any): boolean;
    setNoFlags(node: VNode): void;
    markAddition(node: VNode): void;
    setAddition(node: VNode): void;
    markDirectAddition(node: VNode): void;
    markUpdate(node: VNode): void;
    setDeletion(node: VNode): void;
    markContentReset(node: VNode): void;
    markCallback(node: VNode): void;
    markDidCapture(node: VNode): void;
    markShouldCapture(node: VNode): void;
    markRef(node: VNode): void;
    markSnapshot(node: VNode): void;
    markInterrupted(node: VNode): void;
    markForceUpdate(node: VNode): void;
    markClear(node: VNode): void;
};
