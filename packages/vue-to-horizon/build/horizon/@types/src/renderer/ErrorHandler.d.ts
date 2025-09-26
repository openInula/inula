/**
 * 异常错误处理
 */
import type { PromiseType, VNode } from './Types';
export declare function isPromise(error: any): error is PromiseType<any>;
export declare function handleRenderThrowError(sourceVNode: VNode, error: any): void;
export declare function handleSubmitError(vNode: VNode, error: any): void;
