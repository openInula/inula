import type { VNode } from './Types';
export declare function setProcessing(vNode: VNode | null): void;
export declare function calcStartUpdateVNode(treeRoot: VNode): VNode;
export declare function tryRenderFromRoot(treeRoot: VNode): void;
export declare function launchUpdateFromVNode(vNode: VNode): void;
export declare function runDiscreteUpdates(): void;
export declare function asyncUpdates(fn: any, ...param: any[]): any;
export declare function syncUpdates(fn: any): any;
