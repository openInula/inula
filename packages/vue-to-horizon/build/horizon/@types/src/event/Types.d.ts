import type { VNode } from '../renderer/Types';
import { WrappedEvent } from './EventWrapper';
export declare type AnyNativeEvent = KeyboardEvent | MouseEvent | TouchEvent | UIEvent | Event;
export interface HorizonEventListener {
    (event: WrappedEvent): void;
}
export declare type ListenerUnit = {
    vNode: null | VNode;
    listener: HorizonEventListener;
    currentTarget: EventTarget;
    event: WrappedEvent;
};
export declare type ListenerUnitList = Array<ListenerUnit>;
