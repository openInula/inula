import type { VNode, Callback } from './Types';
export declare type Update = {
    type: 'Update' | 'Override' | 'ForceUpdate' | 'Error';
    content: any;
    callback: Callback | null;
};
export declare type Updates = Array<Update> | null;
export declare enum UpdateState {
    Update = "Update",
    Override = "Override",
    ForceUpdate = "ForceUpdate",
    Error = "Error"
}
export declare function newUpdate(): Update;
export declare function pushUpdate(vNode: VNode, update: Update): void;
export declare function processUpdates(vNode: VNode, inst: any, props: any): void;
export declare function pushForceUpdate(vNode: VNode): void;
