import {isMounted} from '../renderer/vnode/VNodeUtils';
import {SuspenseComponent} from '../renderer/vnode/VNodeTags';
import {getNearestVNode} from '../dom/DOMInternalKeys';
import {handleEventMain} from './HorizonEventMain';
import {runDiscreteUpdates} from '../renderer/Renderer';
import {getEventTarget} from './utils';

// 生成委托事件的监听方法
export function createCustomEventListener(
  target: EventTarget,
  nativeEvtName: string,
  isCapture: boolean,
): EventListener {
  return triggerDelegatedEvent.bind(null, nativeEvtName, isCapture, target);
}

// 触发委托事件
function triggerDelegatedEvent(
  nativeEvtName: string,
  isCapture: boolean,
  targetDom: EventTarget,
  nativeEvent,
) {
  // 执行之前的调度事件
  runDiscreteUpdates();

  const nativeEventTarget = getEventTarget(nativeEvent);
  let targetVNode = getNearestVNode(nativeEventTarget);

  if (targetVNode !== null) {
    if (isMounted(targetVNode)) {
      if (targetVNode.tag === SuspenseComponent) {
        targetVNode = null;
      }
    } else {
      // vnode已销毁
      targetVNode = null;
    }
  }
  handleEventMain(nativeEvtName, isCapture, nativeEvent, targetVNode, targetDom);
}
