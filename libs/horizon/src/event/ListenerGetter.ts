import {VNode} from '../renderer/Types';
import {DomComponent} from '../renderer/vnode/VNodeTags';
import {throwIfTrue} from '../renderer/utils/throwIfTrue';
import type {Props} from '../dom/DOMOperator';
import {EVENT_TYPE_ALL, EVENT_TYPE_CAPTURE, EVENT_TYPE_BUBBLE} from './const';
import {ProcessingListenerList, ListenerUnitList} from './Types';
import {CustomBaseEvent} from './customEvents/CustomBaseEvent';

// 返回是否应该阻止事件响应标记，disabled组件不响应鼠标事件
function shouldPrevent(
  name: string,
  type: string,
  props: Props,
): boolean {
  const canPreventMouseEvents = [
    'onClick',
    'onClickCapture',
    'onDoubleClick',
    'onDoubleClickCapture',
    'onMouseDown',
    'onMouseDownCapture',
    'onMouseMove',
    'onMouseMoveCapture',
    'onMouseUp',
    'onMouseUpCapture',
    'onMouseEnter',
  ];
  const interActiveElements = ['button', 'input', 'select', 'textarea'];
  if (canPreventMouseEvents.includes(name)) {
    return !!(props.disabled && interActiveElements.includes(type));
  }
  return false;
}

// 从vnode属性中获取事件listener
function getListener(
  vNode: VNode,
  eventName: string,
): Function | null {
  const realNode = vNode.realNode;
  if (realNode === null) {
    return null;
  }
  const props = vNode.props;
  if (props === null) {
    return null;
  }
  const listener = props[eventName];
  if (shouldPrevent(eventName, vNode.type, props)) {
    return null;
  }
  throwIfTrue(
    listener && typeof listener !== 'function',
    '`%s` listener should be a function.',
    eventName
  );
  return listener;
}

// 获取监听事件
export function getListenersFromTree(
  targetVNode: VNode | null,
  name: string | null,
  horizonEvent: CustomBaseEvent,
  eventType: string,
): ProcessingListenerList {
  if (!name) {
    return [];
  }
  const captureName = name + EVENT_TYPE_CAPTURE;
  const listeners: ListenerUnitList = [];

  let vNode = targetVNode;

  // 从目标节点到根节点遍历获取listener
  while (vNode !== null) {
    const {realNode, tag} = vNode;
    if (tag === DomComponent && realNode !== null) {
      if (eventType === EVENT_TYPE_ALL || eventType === EVENT_TYPE_CAPTURE) {
        const captureListener = getListener(vNode, captureName);
        if (captureListener) {
          listeners.unshift({
            vNode,
            listener: captureListener,
            currentTarget: realNode,
            event: horizonEvent,
          });
        }
      }
      if (eventType === EVENT_TYPE_ALL || eventType === EVENT_TYPE_BUBBLE) {
        const bubbleListener = getListener(vNode, name);
        if (bubbleListener) {
          listeners.push({
            vNode,
            listener: bubbleListener,
            currentTarget: realNode,
            event: horizonEvent,
          });
        }
      }
    }
    vNode = vNode.parent;
  }
  return listeners.length > 0 ? [listeners]: [];
}



