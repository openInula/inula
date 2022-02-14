import type {VNode} from '../../renderer/Types';
import type {AnyNativeEvent} from '../Types';
import {getListenersFromTree} from '../ListenerGetter';
import {createCustomEvent} from '../customEvents/EventFactory';
import {EVENT_TYPE_ALL} from '../const';
import {ListenerUnitList} from '../Types';

const compositionEventObj = {
  compositionstart: 'onCompositionStart',
  compositionend: 'onCompositionEnd',
  compositionupdate: 'onCompositionUpdate',
};

// compoisition事件主要处理中文输入法输入时的触发事件
export function getListeners(
  evtName: string,
  nativeEvt: AnyNativeEvent,
  vNode: null | VNode,
  target: null | EventTarget,
): ListenerUnitList {
  const evtType = compositionEventObj[evtName];

  const event = createCustomEvent(
    evtType,
    evtName,
    nativeEvt,
    null,
    target,
  );
  return getListenersFromTree(vNode, evtType, event, EVENT_TYPE_ALL);
}
