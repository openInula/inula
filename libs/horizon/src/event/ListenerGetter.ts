import { VNode } from '../renderer/Types';
import { DomComponent } from '../renderer/vnode/VNodeTags';
import { EVENT_TYPE_ALL, EVENT_TYPE_CAPTURE, EVENT_TYPE_BUBBLE } from './const';
import { AnyNativeEvent, ListenerUnitList } from './Types';

// 从vnode属性中获取事件listener
function getListenerFromVNode(vNode: VNode, eventName: string): Function | null {
  const props = vNode.props;
  const mouseEvents = ['onClick', 'onDoubleClick', 'onMouseDown', 'onMouseMove', 'onMouseUp', 'onMouseEnter'];
  const formElements = ['button', 'input', 'select', 'textarea'];

  // 是否应该阻止禁用的表单元素触发鼠标事件
  const shouldPreventMouseEvent =
    mouseEvents.includes(eventName) && props.disabled && formElements.includes(vNode.type);

  const listener = props[eventName];
  if (shouldPreventMouseEvent) {
    return null;
  } else {
    return listener;
  }
}

// 获取监听事件
export function getListenersFromTree(
  targetVNode: VNode | null,
  horizonEvtName: string | null,
  nativeEvent: AnyNativeEvent,
  eventType: string
): ListenerUnitList {
  if (!horizonEvtName) {
    return [];
  }

  const listeners: ListenerUnitList = [];

  let vNode = targetVNode;

  // 从目标节点到根节点遍历获取listener
  while (vNode !== null) {
    const { realNode, tag } = vNode;
    if (tag === DomComponent && realNode !== null) {
      if (eventType === EVENT_TYPE_ALL || eventType === EVENT_TYPE_CAPTURE) {
        const captureName = horizonEvtName + EVENT_TYPE_CAPTURE;
        const captureListener = getListenerFromVNode(vNode, captureName);
        if (captureListener) {
          listeners.unshift({
            vNode,
            listener: captureListener,
            currentTarget: realNode,
            event: nativeEvent,
          });
        }
      }

      if (eventType === EVENT_TYPE_ALL || eventType === EVENT_TYPE_BUBBLE) {
        const bubbleListener = getListenerFromVNode(vNode, horizonEvtName);
        if (bubbleListener) {
          listeners.push({
            vNode,
            listener: bubbleListener,
            currentTarget: realNode,
            event: nativeEvent,
          });
        }
      }
    }
    vNode = vNode.parent;
  }

  return listeners;
}
