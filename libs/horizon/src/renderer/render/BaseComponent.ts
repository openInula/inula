import type { VNode } from '../Types';

import {cacheOldCtx, isOldProvider} from '../components/context/CompatibleContext';
import {
  ClassComponent,
  ContextProvider,
  DomComponent,
  DomPortal,
  TreeRoot,
  SuspenseComponent,
} from '../vnode/VNodeTags';
import { getContextChangeCtx, setContextCtx, setNamespaceCtx } from '../ContextSaver';
import { FlagUtils } from '../vnode/VNodeFlags';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';
import {onlyUpdateChildVNodes} from '../vnode/VNodeCreator';
import componentRenders from './index';

export function captureVNode(processing: VNode): VNode | null {
  const component = componentRenders[processing.tag];

  if (processing.tag !== SuspenseComponent) {
    // 该vNode没有变化，不用进入capture，直接复用。
    if (
      !processing.isCreated &&
      processing.oldProps === processing.props &&
      !getContextChangeCtx() &&
      !processing.shouldUpdate
    ) {
      // 复用还需对stack进行处理
      handlerContext(processing);

      return onlyUpdateChildVNodes(processing);
    }
  }

  const shouldUpdate = processing.shouldUpdate;
  processing.shouldUpdate = false;
  return component.captureRender(processing, shouldUpdate);
}

// 复用vNode时，也需对stack进行处理
function handlerContext(processing: VNode) {
  switch (processing.tag) {
    case TreeRoot:
      setNamespaceCtx(processing, processing.outerDom);
      break;
    case DomComponent:
      setNamespaceCtx(processing);
      break;
    case ClassComponent: {
      const isOldCxtExist = isOldProvider(processing.type);
      cacheOldCtx(processing, isOldCxtExist);
      break;
    }
    case DomPortal:
      setNamespaceCtx(processing, processing.outerDom);
      break;
    case ContextProvider: {
      const newValue = processing.props.value;
      setContextCtx(processing, newValue);
      break;
    }
  }
}

// 创建孩子节点
export function createVNodeChildren(processing: VNode, nextChildren: any) {
  const isComparing = !processing.isCreated;

  return createChildrenByDiff(processing, processing.child, nextChildren, isComparing);
}

export function markRef(processing: VNode) {
  const ref = processing.ref;
  if ((processing.isCreated && ref !== null) || (!processing.isCreated && processing.oldRef !== ref)) {
    FlagUtils.markRef(processing);
  }
}
