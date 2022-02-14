import {VNode} from '../renderer/Types';
import {DomComponent} from '../renderer/vnode/VNodeTags';
import {EVENT_TYPE_ALL, EVENT_TYPE_CAPTURE, EVENT_TYPE_BUBBLE} from './const';
import {ListenerUnitList} from './Types';
import {CustomBaseEvent} from './customEvents/CustomBaseEvent';

// 获取监听事件
export function getListenersFromTree(
  targetVNode: VNode | null,
  horizonEvtName: string | null,
  horizonEvent: CustomBaseEvent,
  eventType: string,
): ListenerUnitList {
  if (!horizonEvtName) {
    return [];
  }

  const listeners: ListenerUnitList = [];

  let vNode = targetVNode;

  // 从目标节点到根节点遍历获取listener
  while (vNode !== null) {
    const {realNode, tag} = vNode;
    if (tag === DomComponent && realNode !== null) {
      if (eventType === EVENT_TYPE_ALL || eventType === EVENT_TYPE_CAPTURE) {
        const captureName = horizonEvtName + EVENT_TYPE_CAPTURE;
        const captureListener = vNode.props[captureName];
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
        const bubbleListener = vNode.props[horizonEvtName];
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

  return listeners;
}



