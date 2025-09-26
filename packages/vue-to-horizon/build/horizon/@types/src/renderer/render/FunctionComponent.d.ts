import type { VNode } from '../Types';
export declare function bubbleRender(): void;
export declare function setStateChange(isUpdate: any): void;
export declare function isStateChange(): boolean;
export declare function captureFunctionComponent(processing: VNode, funcComp: any, nextProps: any): VNode;
export declare function captureRender(processing: VNode): VNode | null;
