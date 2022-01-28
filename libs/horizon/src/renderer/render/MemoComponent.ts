import type {VNode} from '../Types';

import {mergeDefaultProps} from './LazyComponent';
import {updateVNode, onlyUpdateChildVNodes, updateVNodePath, createFragmentVNode, createUndeterminedVNode} from '../vnode/VNodeCreator';
import {shallowCompare} from '../utils/compare';
import {
  TYPE_FRAGMENT,
  TYPE_PROFILER,
  TYPE_STRICT_MODE,
} from '../../external/JSXElementType';

export function bubbleRender() {}

export function captureMemoComponent(
  processing: VNode,
  shouldUpdate: boolean,
): VNode | null {
  const Component = processing.type;
  // 合并 函数组件或类组件 的defaultProps
  const newProps = mergeDefaultProps(Component, processing.props);

  if (processing.isCreated) {
    let newChild = null;
    const type = Component.type;
    if (type === TYPE_STRICT_MODE || type === TYPE_FRAGMENT || type === TYPE_PROFILER) {
      newChild = createFragmentVNode(null, newProps.children);
    } else {
      newChild = createUndeterminedVNode(type, null, newProps);
    }
    newChild.parent = processing;
    newChild.ref = processing.ref;
    updateVNodePath(newChild);
    processing.child = newChild;

    return newChild;
  }

  const firstChild = processing.child; // Memo只有一个child
  if (!shouldUpdate) {
    const oldProps = firstChild.props;
    // 默认是浅对比
    const compare = Component.compare ? Component.compare : shallowCompare;
    if (compare(oldProps, newProps) && processing.oldRef === processing.ref) {
      return onlyUpdateChildVNodes(processing);
    }
  }

  const newChild = updateVNode(firstChild, newProps);
  newChild.parent = processing;
  newChild.cIndex = 0;
  updateVNodePath(newChild);
  newChild.ref = processing.ref;
  processing.child = newChild;

  return newChild;
}

export function captureRender(processing: VNode, shouldUpdate: boolean): VNode | null {
  return captureMemoComponent(processing, shouldUpdate);
}
