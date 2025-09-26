import { VNode } from './VNode';
export declare function updateShouldUpdateOfTree(vNode: VNode): VNode | null;
export declare function updateChildShouldUpdate(vNode: VNode): void;
export declare function setParentsChildShouldUpdate(parent: VNode | null): void;
export declare function updateParentsChildShouldUpdate(vNode: VNode): void;
