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

import type { VNodeTag } from './VNodeTags';
import { FlagUtils } from './VNodeFlags';
import {
  ClassComponent,
  ContextConsumer,
  ContextProvider,
  ForwardRef,
  Fragment,
  FunctionComponent,
  DomComponent,
  DomPortal,
  TreeRoot,
  DomText,
  LazyComponent,
  MemoComponent,
  SuspenseComponent,
} from './VNodeTags';
import {
  TYPE_CONTEXT,
  TYPE_FORWARD_REF,
  TYPE_FRAGMENT,
  TYPE_LAZY,
  TYPE_MEMO,
  TYPE_PROFILER,
  TYPE_PROVIDER,
  TYPE_STRICT_MODE,
  TYPE_SUSPENSE,
} from '../../external/JSXElementType';
import { VNode } from './VNode';
import { JSXElement, Source } from '../Types';
import { markVNodePath } from '../utils/vNodePath';

const typeLazyMap = {
  [TYPE_FORWARD_REF]: ForwardRef,
  [TYPE_MEMO]: MemoComponent,
};
const typeMap = {
  ...typeLazyMap,
  [TYPE_PROVIDER]: ContextProvider,
  [TYPE_CONTEXT]: ContextConsumer,
  [TYPE_LAZY]: LazyComponent,
};

function newVirtualNode(tag: VNodeTag, key?: null | string, vNodeProps?: any, realNode?: any): VNode {
  return new VNode(tag, vNodeProps, key, realNode);
}

function isClassComponent(comp: Function) {
  // 如果使用 getPrototypeOf 方法获取构造函数，不能兼容业务组组件继承组件的使用方式，会误认为是函数组件
  // 如果使用静态属性，部分函数高阶组件会将类组件的静态属性复制到自身，导致误判为类组件
  // 既然已经兼容使用了该标识符，那么继续使用
  return comp.prototype?.isReactComponent === true;
}

// 解析懒组件的tag
export function getLazyVNodeTag(lazyComp: any): string {
  if (typeof lazyComp === 'function') {
    return isClassComponent(lazyComp) ? ClassComponent : FunctionComponent;
  } else if (lazyComp !== undefined && lazyComp !== null && typeLazyMap[lazyComp.vtype]) {
    return typeLazyMap[lazyComp.vtype];
  }
  throw Error("Inula can't resolve the content of lazy");
}

// 创建processing
export function updateVNode(vNode: VNode, vNodeProps?: any): VNode {
  if (vNode.tag === ClassComponent) {
    vNode.oldState = vNode.state;
  }

  if (vNode.tag === SuspenseComponent) {
    vNode.suspenseState.oldChildStatus = vNode.suspenseState.childStatus;
    vNode.oldChild = vNode.child;
  }

  vNode.oldProps = vNode.props;
  vNode.props = vNodeProps;

  vNode.oldRef = vNode.ref;

  FlagUtils.setNoFlags(vNode);
  vNode.dirtyNodes = null;
  vNode.isCreated = false;

  return vNode;
}

export function createFragmentVNode(fragmentKey, fragmentProps) {
  const vNode = newVirtualNode(Fragment, fragmentKey, fragmentProps);
  vNode.shouldUpdate = true;
  return vNode;
}

export function createDomTextVNode(content) {
  const vNode = newVirtualNode(DomText, null, content);
  vNode.shouldUpdate = true;
  return vNode;
}

export function createPortalVNode(portal) {
  const children = portal.children ?? [];
  const vNode = newVirtualNode(DomPortal, portal.key, children);
  vNode.shouldUpdate = true;
  vNode.realNode = portal.realNode;
  return vNode;
}

export function createUndeterminedVNode(type, key, props, source: Source | null): VNode {
  let vNodeTag = FunctionComponent;
  let isLazy = false;
  const componentType = typeof type;
  if (componentType === 'function') {
    if (isClassComponent(type)) {
      vNodeTag = ClassComponent;
    }
  } else if (componentType === 'string') {
    vNodeTag = DomComponent;
  } else if (type === TYPE_SUSPENSE) {
    vNodeTag = SuspenseComponent;
  } else if (componentType === 'object' && type !== null && typeMap[type.vtype]) {
    vNodeTag = typeMap[type.vtype];
    isLazy = type.vtype === TYPE_LAZY;
  } else {
    throw Error(`Component type is invalid, got: ${type === null || type === undefined ? type : componentType}`);
  }

  const vNode = newVirtualNode(vNodeTag, key, props);
  vNode.type = type;
  vNode.shouldUpdate = true;

  if (isLazy) {
    vNode.lazyType = type;
  }

  vNode.src = isDev ? source : null;
  return vNode;
}

export function getElementTag(element: JSXElement): string {
  const type = element.type;

  if (type === TYPE_STRICT_MODE || type === TYPE_FRAGMENT || type === TYPE_PROFILER) {
    return Fragment;
  } else {
    let vNodeTag = FunctionComponent;
    const componentType = typeof type;

    if (componentType === 'function') {
      if (isClassComponent(type)) {
        vNodeTag = ClassComponent;
      }
    } else if (componentType === 'string') {
      vNodeTag = DomComponent;
    } else if (type === TYPE_SUSPENSE) {
      vNodeTag = SuspenseComponent;
    } else if (componentType === 'object' && type !== null && typeMap[type.vtype]) {
      vNodeTag = typeMap[type.vtype];
    }

    return vNodeTag;
  }
}

export function createTreeRootVNode(container) {
  const vNode = newVirtualNode(TreeRoot, null, null, container);
  vNode.path = '0';
  vNode.updates = [];
  return vNode;
}

// 暂时保留给测试用例使用，后续修改测试用例
export function createVNode(tag: VNodeTag | string, ...secondArg) {
  let vNode = null;
  switch (tag) {
    case TreeRoot:
      // 创建treeRoot
      vNode = newVirtualNode(TreeRoot, null, null, secondArg[0]);
      vNode.path = '0';

      vNode.updates = [];
      break;
    default:
      break;
  }

  return vNode;
}

export function createVNodeFromElement(element: JSXElement): VNode {
  const { type, key, props, src } = element;

  if (type === TYPE_STRICT_MODE || type === TYPE_FRAGMENT || type === TYPE_PROFILER) {
    return createFragmentVNode(key, props.children);
  } else {
    return createUndeterminedVNode(type, key, props, src);
  }
}

// 直接更新子节点属性即可，不需要diff
export function onlyUpdateChildVNodes(processing: VNode): VNode | null {
  // 检查子树是否需要更新
  if (processing.childShouldUpdate) {
    // 此vNode无需更新，但是子树需要
    if (!processing.isCreated && processing.child !== null) {
      // 更新子节点
      let child: VNode | null = processing.child;
      while (child !== null) {
        updateVNode(child, child.props);
        markVNodePath(child);
        child = child.next;
      }
    }

    // 返回子节点，继续遍历
    return processing.child;
  }

  // 当跳过子树更新时，父节点path更新时，需要更新所有子树path
  if (processing.child && processing.path !== processing.child.path.slice(0, processing.path.length)) {
    // bfs更新子树path
    const queue: VNode[] = [];

    const putChildrenIntoQueue = (vNode: VNode) => {
      const child = vNode.child;
      if (child) {
        queue.push(child);
        let sibling = child.next;
        while (sibling) {
          queue.push(sibling);
          sibling = sibling.next;
        }
      }
    };

    putChildrenIntoQueue(processing);

    while (queue.length) {
      const vNode = queue.shift()!;

      markVNodePath(vNode);

      putChildrenIntoQueue(vNode);
    }
  }
  // 子树无需工作
  return null;
}
