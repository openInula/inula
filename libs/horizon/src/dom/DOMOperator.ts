/**
 * Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
 */

import {
  saveVNode,
  updateVNodeProps,
} from './DOMInternalKeys';
import {
  createDom,
} from './utils/DomCreator';
import {getSelectionInfo, resetSelectionRange, selectionData} from './SelectionRangeHandler';
import {isElement, isComment, isDocument, isDocumentFragment} from './utils/Common';
import {NSS} from './utils/DomCreator';
import {adjustStyleValue} from './DOMPropertiesHandler/StyleHandler';

import {listenDelegatedEvents} from '../event/EventBinding';
import type {VNode} from '../renderer/Types';
import {
  setInitValue,
  getPropsWithoutValue,
  updateValue,
} from './valueHandler/ValueHandler';
import {
  compareProps,
  setDomProps, updateDomProps
} from './DOMPropertiesHandler/DOMPropertiesHandler';
import {isNativeElement, validateProps} from './validators/ValidateProps';
import {watchValueChange} from './valueHandler/ValueChangeHandler';
import {DomComponent, DomText} from '../renderer/vnode/VNodeTags';
import {updateCommonProp} from './DOMPropertiesHandler/UpdateCommonProp';

export type Props = {
  autoFocus?: boolean,
  children?: any,
  dangerouslySetInnerHTML?: any,
  disabled?: boolean,
  hidden?: boolean,
  style?: { display?: string },
};

export type Container = (Element & { _treeRoot?: VNode }) | (Document & { _treeRoot?: VNode });

let selectionInfo: null | selectionData = null;

const types = ['button', 'input', 'select', 'textarea'];

// button、input、select、textarea、如果有 autoFocus 属性需要focus
function shouldAutoFocus(type: string, props: Props): boolean {
  return types.includes(type) ? Boolean(props.autoFocus) : false;
}

function getChildNS(parent: string | null, type: string,): string {
  if (parent === NSS.svg && type === 'foreignObject') {
    return NSS.html;
  }
  if (parent == null || parent === NSS.html) {
    // 没有父命名空间
    return Object.keys(NSS).includes(type) ? NSS[type] : NSS.html;
  }
  // 默认返回parentNamespace.
  return parent;
}

function getRootNS(dom, root, nextRoot) {
  let namespace;
  let tag;
  let container, ownNamespace;

  if (isDocument(dom)) {
    tag = '#document';
    namespace = root ? root.namespaceURI : getChildNS(null, '');
  } else if (isDocumentFragment(dom)) {
    tag = '#fragment';
    namespace = root ? root.namespaceURI : getChildNS(null, '');
  } else if (isComment(dom)) {
    container = nextRoot.parentNode;
    ownNamespace = container.namespaceURI || null;
    tag = container.tagName;
    namespace = getChildNS(ownNamespace, tag);
  } else {
    container = nextRoot;
    ownNamespace = container.namespaceURI || null;
    tag = container.tagName;
    namespace = getChildNS(ownNamespace, tag);
  }

  return namespace;
}

// 获取容器
export function getNSCtx(
  nextRoot: Container,
  ctxNamespace: string,
  type: string): string {
  let namespace;
  if (nextRoot) {
    // 获取并解析根节点容器
    const root = nextRoot.documentElement;
    namespace = getRootNS(nextRoot, root, nextRoot);
  } else {
    // 获取子节点容器
    namespace = getChildNS(ctxNamespace, type);
  }
  return namespace;
}

export function prepareForSubmit(): void {
  selectionInfo = <selectionData>getSelectionInfo();
}

export function resetAfterSubmit(): void {
  resetSelectionRange(selectionInfo);
  selectionInfo = null;
}

/**
 * 在内存中创建 DOM 对象
 * @param tagName 元素的类型
 * @param props 属性
 * @param parentNamespace 当前上下文
 * @param vNode 当前元素对应的 VNode
 * @returns DOM 对象
 */
export function newDom(
  tagName: string,
  props: Props,
  parentNamespace: string,
  vNode: VNode,
): Element {
  const dom: Element = createDom(tagName, props, parentNamespace);
  // 将 vNode 节点挂到 DOM 对象上
  saveVNode(vNode, dom);
  // 将属性挂到 DOM 对象上
  updateVNodeProps(dom, props);

  return dom;
}

// 设置节点默认事件、属性
export function initDomProps(dom: Element, tagName: string, rawProps: Props): boolean {
  validateProps(tagName, rawProps);

  // 获取不包括value，defaultValue的属性
  const props: Object = getPropsWithoutValue(tagName, dom, rawProps);

  // 初始化DOM属性（不包括value，defaultValue）
  setDomProps(tagName, dom, props);

  if (tagName === 'input' || tagName === 'textarea') {
    // 增加监听value和checked的set、get方法
    watchValueChange(dom);
  }

  // 设置dom.value值，触发受控组件的set方法
  setInitValue(tagName, dom, rawProps);

  return shouldAutoFocus(tagName, rawProps);
}

// 准备更新之前进行一系列校验 DOM，寻找属性差异等准备工作
export function getPropChangeList(
  dom: Element,
  type: string,
  lastRawProps: Props,
  nextRawProps: Props,
): null | Array<any> {
  // 校验两个对象的不同
  validateProps(type, nextRawProps);

  // 重新定义的属性不需要参与对比，被代理的组件需要把这些属性覆盖到props中
  const oldProps: Object = getPropsWithoutValue(type, dom, lastRawProps);
  const newProps: Object = getPropsWithoutValue(type, dom, nextRawProps);

  const changeList = compareProps(oldProps, newProps);
  return changeList;
}

export function isTextChild(type: string, props: Props): boolean {
  if (type === 'textarea') {
    return true;
  } else if (type === 'option') {
    return true;
  } else if (type === 'noscript') {
    return true;
  } else if (typeof props.children === 'string') {
    return true;
  } else if (typeof props.children === 'number') {
    return true;
  } else {
    return (
      props.dangerouslySetInnerHTML &&
      typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML.__html != null
    );
  }
}

export function newTextDom(
  text: string,
  processing: VNode,
): Text {
  const textNode: Text = document.createTextNode(text);
  saveVNode(processing, textNode);
  return textNode;
}

export function submitMount(
  dom: Element,
  type: string,
  newProps: Props,
): void {
  if (shouldAutoFocus(type, newProps)) {
    // button、input、select、textarea、如果有 autoFocus 属性需要focus
    dom.focus();
  }
}

// 提交vNode的类型为Component或者Text的更新
export function submitDomUpdate(tag: number, vNode: VNode) {
  const newProps = vNode.props;
  const element: Element = vNode.realNode;

  if (tag === DomComponent) {
    // DomComponent类型
    if (element != null) {
      const type = vNode.type;
      const changeList = vNode.changeList;
      vNode.changeList = null;
      if (changeList !== null) {
        saveVNode(vNode, element);
        updateVNodeProps(element, newProps);
        // 应用diff更新Properties.
        // 当一个选中的radio改变名称,浏览器使另一个radio的复选框为false.
        if (type === 'input' && newProps.type === 'radio' && newProps.name != null && newProps.checked != null) {
          updateCommonProp(element, 'checked', newProps.checked);
        }
        const isNativeTag = isNativeElement(type, newProps);
        updateDomProps(element, changeList, isNativeTag);
        updateValue(type, element, newProps);
      }
    }
  } else if (tag === DomText) {
    // text类型
    element.textContent = newProps;
  }
}

export function clearText(dom: Element): void {
  dom.innerHTML = '';
}

// 添加child元素
export function appendChildElement(isContainer: boolean,
  parent: Element | Container,
  child: Element | Text): void {
  if (isContainer && isComment(parent)) {
    parent.parentNode.insertBefore(child, parent);
  } else {
    parent.appendChild(child);
  }
}

// 插入dom元素
export function insertDomBefore(
  isContainer: boolean,
  parent: Element | Container,
  child: Element | Text,
  beforeChild: Element | Text,
) {
  if (isContainer && isComment(parent)) {
    parent.parentNode.insertBefore(child, beforeChild);
  } else {
    parent.insertBefore(child, beforeChild);
  }
}

export function removeChildDom(
  isContainer: boolean,
  parent: Element | Container,
  child: Element | Text
) {
  if (isContainer && isComment(parent)) {
    parent.parentNode.removeChild(child);
  } else {
    parent.removeChild(child);
  }
}

// 隐藏元素
export function hideDom(tag: number, element: Element | Text) {
  if (tag === DomComponent) {
    // DomComponent类型
    const {style} = element;
    if (style.setProperty && typeof style.setProperty === 'function') {
      style.setProperty('display', 'none', 'important');
    } else {
      style.display = 'none';
    }
  } else if (tag === DomText) {
    // text类型
    element.textContent = '';
  }
}

// 不隐藏元素
export function unHideDom(tag: number, element: Element | Text, props: Props) {
  if (tag === DomComponent) {
    // DomComponent类型
    const style = props.style;
    let display = null;
    if (style !== undefined && style !== null && style.hasOwnProperty('display')) {
      display = style.display;
    }
    element.style.display = adjustStyleValue('display', display);
  } else if (tag === DomText) {
    // text类型
    element.textContent = props;
  }
}

export function clearContainer(container: Container): void {
  if (isElement(container)) {
    container.textContent = '';
  }
  if (isDocument(container) && container.body != null) {
    container.body.textContent = '';
  }
}

export function prePortal(portal: Element): void {
  listenDelegatedEvents(portal);
}
