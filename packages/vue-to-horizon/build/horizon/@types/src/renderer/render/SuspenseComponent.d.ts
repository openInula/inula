import type { VNode, PromiseType } from '../Types';
export declare enum SuspenseChildStatus {
    Init = "",
    ShowChild = "showChild",
    ShowFallback = "showFallback"
}
export declare function captureSuspenseComponent(processing: VNode): any;
export declare function captureRender(processing: VNode, shouldUpdate: boolean): Array<VNode> | VNode | null;
export declare function bubbleRender(processing: VNode): any;
export declare function handleSuspenseChildThrowError(parent: VNode, processing: VNode, promise: PromiseType<any>): boolean;
export declare function listenToPromise(suspenseVNode: VNode): void;
