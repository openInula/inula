
import type {VNode} from '../renderer/Types';
import {CustomBaseEvent} from './customEvents/CustomBaseEvent';

export type AnyNativeEvent = KeyboardEvent | MouseEvent | TouchEvent | UIEvent | Event;

export type ListenerUnit = {
  vNode: null | VNode;
  listener: Function;
  currentTarget: EventTarget;
  event: CustomBaseEvent;
};

export type ListenerUnitList = Array<ListenerUnit>;

export type ProcessingListenerList = Array<ListenerUnitList>;
