import type {VNode} from '../Types';

import {mergeDefaultProps} from './LazyComponent';
import {updateVNode, createVNode, onlyUpdateChildVNodes, updateVNodePath} from '../vnode/VNodeCreator';
import {shallowCompare} from '../utils/compare';
import {
  TYPE_FRAGMENT,
  TYPE_PROFILER,
  TYPE_STRICT_MODE,
} from '../utils/elementType';
import {Fragment} from '../vnode/VNodeTags';

export function captureRender(processing: VNode, shouldUpdate: boolean): Array<VNode> | null {
  return captureMemoComponent(processing, shouldUpdate);
}

export function bubbleRender() {}

export function captureMemoComponent(
  processing: VNode,
  shouldUpdate: boolean,
): Array<VNode> | null {
  const Component = processing.type;
  // 合并 函数组件或类组件 的defaultProps
  const newProps = mergeDefaultProps(Component, processing.props);

  if (processing.isCreated) {
    let newChild = null;
    const type = Component.type;
    if (type === TYPE_STRICT_MODE || type === TYPE_FRAGMENT || type === TYPE_PROFILER) {
      newChild = createVNode(Fragment, null, newProps.children);
    } else {
      newChild = createVNode('props', type, null, newProps, processing);
    }
    newChild.parent = processing;
    newChild.ref = processing.ref;
    updateVNodePath(newChild);
    processing.children = [newChild];

    return processing.children;
  }

  const firstChild = processing.children.length ? processing.children[0] : null; // Memo只有一个child
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
  processing.children = [newChild];

  return processing.children;
}
