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
  ClsOrFunComponent,
  LazyComponent,
  MemoComponent,
  SuspenseComponent,
} from './VNodeTags';
import { createUpdateArray } from '../UpdateHandler';
import {
  TYPE_CONTEXT,
  TYPE_FORWARD_REF, TYPE_FRAGMENT,
  TYPE_LAZY,
  TYPE_MEMO, TYPE_PROFILER,
  TYPE_PROVIDER, TYPE_STRICT_MODE,
  TYPE_SUSPENSE,
} from '../../external/JSXElementType';
import { VNode } from './VNode';
import {JSXElement} from '../Types';

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

const newVirtualNode = function(tag: VNodeTag, key?: null | string, vNodeProps?: any, outerDom?: any): VNode {
  return new VNode(tag, vNodeProps, key, outerDom);
};

function isClassComponent(comp: Function) {
  // 如果使用 getPrototypeOf 方法获取构造函数，不能兼容业务组组件继承组件的使用方式，会误认为是函数组件
  // 如果使用静态属性，部分函数高阶组件会将类组件的静态属性复制到自身，导致误判为类组件
  // 既然已经兼容使用了该标识符，那么继续使用
  return comp.prototype?.isReactComponent === true;
}

// 解析懒组件的tag
export function getLazyVNodeTag(lazyComp: any): string {
  let vNodeTag = ClsOrFunComponent;
  if (typeof lazyComp === 'function') {
    vNodeTag = isClassComponent(lazyComp) ? ClassComponent : FunctionComponent;
  } else if (lazyComp !== undefined && lazyComp !== null && typeLazyMap[lazyComp.vtype]) {
    vNodeTag = typeLazyMap[lazyComp.vtype];
  }
  return vNodeTag;
}

// 创建processing
export function updateVNode(vNode: VNode, vNodeProps?: any): VNode {
  if (vNode.tag === ClassComponent) {
    vNode.oldState = vNode.state;
  }

  if (vNode.tag === SuspenseComponent) {
    vNode.oldSuspenseChildStatus = vNode.suspenseChildStatus;
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

function getVNodeTag(type: any) {
  let vNodeTag = ClsOrFunComponent;
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
    throw Error(`Component type is invalid, got: ${type == null ? type : componentType}`);
  }
  return { vNodeTag, isLazy };
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
  vNode.outerDom = portal.outerDom;
  return vNode;
}

export function createUndeterminedVNode(type, key, props) {
  const { vNodeTag, isLazy } = getVNodeTag(type);

  const vNode = newVirtualNode(vNodeTag, key, props);
  vNode.type = type;
  vNode.shouldUpdate = true;

  if (isLazy) {
    vNode.lazyType = type;
  }
  return vNode;
}

export function createTreeRootVNode(container) {
  const vNode = newVirtualNode(TreeRoot, null, null, container);
  vNode.path += 0;
  createUpdateArray(vNode);
  return vNode;
}

// TODO: 暂时保留给测试用例使用，后续修改测试用例
export function createVNode(tag: VNodeTag | string, ...secondArg) {
  let vNode = null;
  switch (tag) {
    case TreeRoot:
      // 创建treeRoot
      vNode = newVirtualNode(TreeRoot, null, null, secondArg[0]);
      vNode.path += 0;

      createUpdateArray(vNode);
      break;
  }

  return vNode;
}

export function updateVNodePath(vNode: VNode) {
  vNode.path = vNode.parent.path + vNode.cIndex;
}

export function createVNodeFromElement(element: JSXElement): VNode {
  const type = element.type;
  const key = element.key;
  const props = element.props;

  if (type === TYPE_STRICT_MODE || type === TYPE_FRAGMENT || type === TYPE_PROFILER) {
    return createFragmentVNode(key, props.children);
  } else {
    return createUndeterminedVNode(type, key, props);
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
        updateVNodePath(child);
        child = child.next;
      }
    }

    // 返回子节点，继续遍历
    return processing.child;
  }

  // 子树无需工作
  return null;
}

