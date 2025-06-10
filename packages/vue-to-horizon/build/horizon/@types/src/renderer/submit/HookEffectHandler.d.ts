/**
 * useEffect 和 useLayoutEffect的执行逻辑
 */
import type { VNode } from '../Types';
export declare function setSchedulingEffects(value: any): void;
export declare function isSchedulingEffects(): boolean;
export declare function callUseEffects(vNode: VNode): void;
export declare function callRenderEffects(vNode: VNode): void;
export declare function runAsyncEffects(): void;
export declare function callEffectRemove(vNode: VNode): void;
export declare function callUseLayoutEffectRemove(vNode: VNode): void;
export declare function callUseLayoutEffectCreate(vNode: VNode): void;
