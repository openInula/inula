import { VNode } from './vnode/VNode';
export declare function getCurrentRoot(): VNode;
export declare function pushCurrentRoot(root: VNode): void;
export declare function popCurrentRoot(): VNode;
