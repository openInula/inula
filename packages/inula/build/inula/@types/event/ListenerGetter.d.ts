import { VNode } from '../renderer/Types';
import { WrappedEvent } from './EventWrapper';
import { ListenerUnitList } from './Types';
export declare function getListenersFromTree(targetVNode: VNode | null, inulaEvtName: string | null, nativeEvent: WrappedEvent, eventType: string): ListenerUnitList;
export declare function collectMouseListeners(leaveEvent: null | WrappedEvent, enterEvent: null | WrappedEvent, from: VNode | null, to: VNode | null): ListenerUnitList;
