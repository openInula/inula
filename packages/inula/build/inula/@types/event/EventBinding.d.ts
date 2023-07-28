import { VNode } from '../renderer/vnode/VNode';
export declare function lazyDelegateOnRoot(currentRoot: VNode, eventName: string): void;
export declare function listenSimulatedDelegatedEvents(root: VNode): void;
export declare function listenNonDelegatedEvent(inulaEventName: string, domElement: Element, listener: any): void;
