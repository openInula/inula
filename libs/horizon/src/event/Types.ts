import type { VNode } from '../renderer/Types';
import { WrappedEvent } from './EventWrapper';

export type AnyNativeEvent = KeyboardEvent | MouseEvent | TouchEvent | UIEvent | Event;

export interface HorizonEventListener {
  (event: WrappedEvent): void;
}

export type ListenerUnit = {
  vNode: null | VNode;
  listener: HorizonEventListener;
  currentTarget: EventTarget;
  event: WrappedEvent;
};

export type ListenerUnitList = Array<ListenerUnit>;
