/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import type { Source, VNode } from '../Types';

import { mergeDefaultProps } from './LazyComponent';
import {
  updateVNode,
  onlyUpdateChildVNodes,
  createFragmentVNode,
  createUndeterminedVNode,
} from '../vnode/VNodeCreator';
import { shallowCompare } from '../utils/compare';
import { TYPE_FRAGMENT, TYPE_PROFILER, TYPE_STRICT_MODE } from '../../external/JSXElementType';
import { markVNodePath } from '../utils/vNodePath';

export function bubbleRender() {}

export function captureMemoComponent(processing: VNode, shouldUpdate: boolean): VNode | null {
  const Component = processing.type;
  // 合并 函数组件或类组件 的defaultProps
  let newProps = mergeDefaultProps(Component, processing.props);
  // 解决Inula.memo(Inula.forwardRef(()=>{}))两层包装的场景
  newProps = mergeDefaultProps(Component.type, newProps);

  if (processing.isCreated) {
    let newChild: VNode | null = null;
    const type = Component.type;
    if (type === TYPE_STRICT_MODE || type === TYPE_FRAGMENT || type === TYPE_PROFILER) {
      newChild = createFragmentVNode(null, newProps.children);
    } else {
      newChild = createUndeterminedVNode(type, null, newProps, processing.src);
    }
    newChild.parent = processing;
    newChild.ref = processing.ref;
    markVNodePath(newChild);
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
  markVNodePath(newChild);
  newChild.ref = processing.ref;
  processing.child = newChild;

  return newChild;
}

export function captureRender(processing: VNode, shouldUpdate: boolean): VNode | null {
  return captureMemoComponent(processing, shouldUpdate);
}
