import type { VNode, ContextType } from '../../Types';
export declare function resetDepContexts(vNode: VNode): void;
export declare function getNewContext<T>(vNode: VNode, ctx: ContextType<T>, isUseContext?: boolean): T;
