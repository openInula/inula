import type { VNode } from '../Types';
export declare function getCurrentContext(clazz: any, processing: VNode): unknown;
export declare function captureRender(processing: VNode): VNode | null;
export declare function bubbleRender(): void;
