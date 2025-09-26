/**
 * 保存与深度遍历相关的一些context。
 * 在深度遍历过程中，capture阶段会修改一些全局的值，在bubble阶段会恢复。
 */
import type { VNode } from './Types';
import type { Container } from '../dom/DOMOperator';
export declare function setNamespaceCtx(vNode: VNode, dom?: Container): void;
export declare function resetNamespaceCtx(vNode: VNode): void;
export declare function getNamespaceCtx(): string;
export declare function setContext<T>(providerVNode: VNode, nextValue: T): void;
export declare function resetContext(providerVNode: VNode): void;
