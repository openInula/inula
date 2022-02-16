import {createCustomEvent} from '../customEvents/EventFactory';
import {shallowCompare} from '../../renderer/utils/compare';
import {getFocusedDom} from '../../dom/utils/Common';
import {getDom} from '../../dom/DOMInternalKeys';
import {isDocument} from '../../dom/utils/Common';
import {isTextInputElement} from '../utils';
import type {AnyNativeEvent} from '../Types';
import {getListenersFromTree} from '../ListenerGetter';
import type {VNode} from '../../renderer/Types';
import {EVENT_TYPE_ALL} from '../const';
import {ListenerUnitList} from '../Types';

const horizonEventName = 'onSelect'

let currentElement = null;
let currentVNode = null;
let lastSelection: Selection | null = null;

function initTargetCache(dom, vNode) {
  if (isTextInputElement(dom) || dom.contentEditable === 'true') {
    currentElement = dom;
    currentVNode = vNode;
    lastSelection = null;
  }
}

function clearTargetCache() {
  currentElement = null;
  currentVNode = null;
  lastSelection = null;
}

// 标记是否在鼠标事件过程中
let isInMouseEvent = false;

// 获取节点所在的document对象
function getDocument(eventTarget) {
  if (eventTarget.window === eventTarget) {
    return eventTarget.document;
  }
  if (isDocument(eventTarget)) {
    return eventTarget;
  }
  return eventTarget.ownerDocument;
}

function getSelectEvent(nativeEvent, target) {
  const doc = getDocument(target);
  if (isInMouseEvent || currentElement == null || currentElement !== getFocusedDom(doc)) {
    return [];
  }

  const currentSelection = window.getSelection();
  if (!shallowCompare(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    const event = createCustomEvent(
      horizonEventName,
      'select',
      nativeEvent,
      target,
    );
    event.target = currentElement;

    return getListenersFromTree(
      currentVNode,
      horizonEventName,
      event,
      EVENT_TYPE_ALL
    );
  }
  return [];
}


/**
 * 该插件创建一个onSelect事件
 * 支持元素： input、textarea、contentEditable元素
 * 触发场景：用户输入、折叠选择、文本选择
 */
export function getListeners(
  name: string,
  nativeEvt: AnyNativeEvent,
  vNode: null | VNode,
  target: null | EventTarget,
): ListenerUnitList {
  const targetNode = vNode ? getDom(vNode) : window;
  let eventUnitList: ListenerUnitList = [];
  switch (name) {
    case 'focusin':
      initTargetCache(targetNode, vNode);
      return eventUnitList;
    case 'focusout':
      clearTargetCache();
      return eventUnitList;
    case 'mousedown':
      isInMouseEvent = true;
      return eventUnitList;
    case 'contextmenu':
    case 'mouseup':
    case 'dragend':
      isInMouseEvent = false;
      eventUnitList = getSelectEvent(nativeEvt, target);
      break;
    case 'selectionchange':
    case 'keydown':
    case 'keyup':
      eventUnitList = getSelectEvent(nativeEvt, target);
  }
  return eventUnitList;
}
