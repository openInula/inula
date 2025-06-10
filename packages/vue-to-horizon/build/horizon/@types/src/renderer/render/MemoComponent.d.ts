import type { VNode } from '../Types';
export declare function bubbleRender(): void;
export declare function captureMemoComponent(processing: VNode, shouldUpdate: boolean): VNode | null;
export declare function captureRender(processing: VNode, shouldUpdate: boolean): VNode | null;
