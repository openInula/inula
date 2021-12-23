import type {VNode} from '../Types';
import type {Props} from '../../dom/DOMOperator';

import {
  getNamespaceCtx,
  setNamespaceCtx,
  resetNamespaceCtx,
} from '../ContextSaver';
import {
  appendChildElement,
  newDom,
  initDomProps, getPropChangeList,
  isTextChild,
} from '../../dom/DOMOperator';
import {FlagUtils} from '../vnode/VNodeFlags';
import {createVNodeChildren, markRef} from './BaseComponent';
import {DomComponent, DomPortal, DomText} from '../vnode/VNodeTags';
import {getFirstChild, travelVNodeTree} from '../vnode/VNodeUtils';

export function captureRender(processing: VNode): Array<VNode> | null {
  return captureDomComponent(processing);
}

export function bubbleRender(processing: VNode) {
  resetNamespaceCtx(processing);

  const type = processing.type;
  const newProps = processing.props;
  if (!processing.isCreated && processing.realNode != null) {
    // 更新dom属性
    updateDom(
      processing,
      type,
      newProps,
    );

    if (processing.oldRef !== processing.ref) {
      FlagUtils.markRef(processing);
    }
  } else {
    const parentNamespace = getNamespaceCtx();

    // 创建dom
    const dom = newDom(
      type,
      newProps,
      parentNamespace,
      processing,
    );

    appendAllChildren(dom, processing);

    processing.realNode = dom;

    if (initDomProps(dom, type, newProps)) {
      FlagUtils.markUpdate(processing);
    }

    // 处理ref导致的更新
    if (processing.ref !== null) {
      FlagUtils.markRef(processing);
    }
  }
}

function captureDomComponent(processing: VNode): Array<VNode> | null {
  setNamespaceCtx(processing);

  const type = processing.type;
  const newProps = processing.props;
  const oldProps = !processing.isCreated ? processing.oldProps : null;

  let nextChildren = newProps.children;
  const isDirectTextChild = isTextChild(type, newProps);

  if (isDirectTextChild) {
    // 如果为文本节点，则认为没有子节点
    nextChildren = null;
  } else if (oldProps !== null && isTextChild(type, oldProps)) {
    // 将纯文本的子节点改为vNode节点
    FlagUtils.markContentReset(processing);
  }

  markRef(processing);
  processing.children = createVNodeChildren(processing, nextChildren);
  return processing.children;
}

// 把dom类型的子节点append到parent dom中
function appendAllChildren(parent: Element, processing: VNode) {
  const vNode = getFirstChild(processing);
  if (vNode === null) {
    return;
  }

  // 向下递归它的子节点，查找所有终端节点。
  travelVNodeTree(vNode, (node) => {
    if (node.tag === DomComponent || node.tag === DomText) {
      appendChildElement(parent, node.realNode);
    }
  }, (node) => {
    // 已经append到父节点，或者是DomPortal都不需要处理child了
    return node.tag === DomComponent || node.tag === DomText || node.tag === DomPortal;
  }, processing);
}

function updateDom(
  processing: VNode,
  type: any,
  newProps: Props,
) {
  // 如果oldProps !== newProps，意味着存在更新，并且需要处理其相关的副作用
  const oldProps = processing.oldProps;
  if (oldProps === newProps) {
    // 如果props没有发生变化，即使它的children发生了变化，我们也不会改变它
    return;
  }

  const dom: Element = processing.realNode;

  const changeList = getPropChangeList(
    dom,
    type,
    oldProps,
    newProps,
  );
  processing.changeList = changeList;

  // 标记为更新
  FlagUtils.markUpdate(processing);
}