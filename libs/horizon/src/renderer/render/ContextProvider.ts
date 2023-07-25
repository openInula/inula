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

import type { VNode, ContextType, ProviderType } from '../Types';

import { isSame } from '../utils/compare';
import { ClassComponent, ContextProvider } from '../vnode/VNodeTags';
import { pushForceUpdate } from '../UpdateHandler';
import { resetContext, setContext } from '../ContextSaver';
import { travelVNodeTree } from '../vnode/VNodeUtils';
import { launchUpdateFromVNode } from '../TreeBuilder';
import { onlyUpdateChildVNodes } from '../vnode/VNodeCreator';
import { setParentsChildShouldUpdate } from '../vnode/VNodeShouldUpdate';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';

// 从依赖中找到匹配context的VNode
function matchDependencies(depContexts, context, vNode): boolean {
  for (let i = 0; i < depContexts.length; i++) {
    const contextItem = depContexts[i];
    if (contextItem === context) {
      // 匹配到了更新的context，需要创建update。
      if (vNode.tag === ClassComponent) {
        pushForceUpdate(vNode);
      }

      vNode.shouldUpdate = true;

      // 找到需要更新的节点，所以祖先节点都需要改为shouldUpdate为true
      setParentsChildShouldUpdate(vNode.parent);

      vNode.isDepContextChange = true;
      // 由于我们已经找到匹配项，我们可以停止遍历依赖项列表。
      return true;
    }
  }

  return false;
}

// 从当前子节点开始向下遍历，找到消费此context的组件，并更新
function handleContextChange(processing: VNode, context: ContextType<any>): void {
  const vNode = processing.child;
  if (vNode === null) {
    return;
  }

  let isMatch = false;

  // 从vNode开始遍历
  travelVNodeTree(
    vNode,
    node => {
      const depContexts = node.depContexts;
      if (depContexts && depContexts.length) {
        isMatch = matchDependencies(depContexts, context, node) || isMatch;
      }
    },
    node =>
      // 如果这是匹配的provider，则不要更深入地扫描
      node.tag === ContextProvider && node.type === processing.type,
    processing,
    null
  );

  // 找到了依赖context的子节点，触发一次更新
  if (isMatch) {
    launchUpdateFromVNode(processing);
  }
}

function captureContextProvider(processing: VNode): VNode | null {
  const providerType: ProviderType<any> = processing.type;
  const contextType: ContextType<any> = providerType._context;

  const newProps = processing.props;
  const oldProps = !processing.isCreated ? processing.oldProps : null;

  // 获取provider设置的context，即provider组件设置的value
  const newCtx = newProps.value;

  // 更新processing的context值为newProps.value
  setContext(processing, newCtx);

  if (oldProps !== null) {
    const oldCtx = oldProps.value;
    const isSameContext = isSame(oldCtx, newCtx);
    if (isSameContext) {
      // context没有改变，复用
      if (oldProps.children === newProps.children) {
        return onlyUpdateChildVNodes(processing);
      }
    } else {
      // context更改，更新所有依赖的组件
      handleContextChange(processing, contextType);
    }
  }

  const newElements = newProps.children;
  processing.child = createChildrenByDiff(processing, processing.child, newElements, !processing.isCreated);
  return processing.child;
}

export function captureRender(processing: VNode): VNode | null {
  return captureContextProvider(processing);
}

export function bubbleRender(processing: VNode) {
  resetContext(processing);
}
