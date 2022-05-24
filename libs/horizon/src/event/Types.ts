
import type {VNode} from '../renderer/Types';

export type AnyNativeEvent = KeyboardEvent | MouseEvent | TouchEvent | UIEvent | Event;

export type ListenerUnit = {
  vNode: null | VNode;
  listener: Function;
  currentTarget: EventTarget;
  event: AnyNativeEvent;
};

export type ListenerUnitList = Array<ListenerUnit>;
