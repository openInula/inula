import { VNode } from '../renderer/Types';
import { WrappedEvent } from './EventWrapper';
import { ListenerUnitList } from './Types';
export declare function getListenersFromTree(targetVNode: VNode | null, horizonEvtName: string | null, nativeEvent: WrappedEvent, eventType: string): ListenerUnitList;
