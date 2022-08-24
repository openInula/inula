import type { VNode } from '../Types';

import {
  ContextProvider,
  DomComponent,
  DomPortal,
  TreeRoot,
  SuspenseComponent,
} from '../vnode/VNodeTags';
import { setContext, setNamespaceCtx } from '../ContextSaver';
import { FlagUtils } from '../vnode/VNodeFlags';
import {onlyUpdateChildVNodes} from '../vnode/VNodeCreator';
import componentRenders from './index';
import {setProcessingVNode} from '../GlobalVar';
import { clearVNodeObservers } from '../../horizonx/store/StoreHandler';

// 复用vNode时，也需对stack进行处理
function handlerContext(processing: VNode) {
  switch (processing.tag) {
    case TreeRoot:
      setNamespaceCtx(processing, processing.realNode);
      break;
    case DomComponent:
      setNamespaceCtx(processing);
      break;
    case DomPortal:
      setNamespaceCtx(processing, processing.realNode);
      break;
    case ContextProvider: {
      const newValue = processing.props.value;
      setContext(processing, newValue);
      break;
    }
    // No Default
  }
}

export function captureVNode(processing: VNode): VNode | null {
  const component = componentRenders[processing.tag];

  if (processing.tag !== SuspenseComponent) {
    // 该vNode没有变化，不用进入capture，直接复用。
    if (
      !processing.isCreated &&
      processing.oldProps === processing.props &&
      !processing.shouldUpdate
    ) {
      // 复用还需对stack进行处理
      handlerContext(processing);

      return onlyUpdateChildVNodes(processing);
    }
  }

  const shouldUpdate = processing.shouldUpdate;
  processing.shouldUpdate = false;

  setProcessingVNode(processing);
  
  clearVNodeObservers(processing);
  const child = component.captureRender(processing, shouldUpdate);
  setProcessingVNode(null);

  return child;
}

export function markRef(processing: VNode) {
  const ref = processing.ref;
  if ((processing.isCreated && ref !== null) || (!processing.isCreated && processing.oldRef !== ref)) {
    FlagUtils.markRef(processing);
  }
}
