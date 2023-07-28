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

import { saveVNode, updateVNodeProps } from './DOMInternalKeys';
import { createDom } from './utils/DomCreator';
import { getSelectionInfo, resetSelectionRange, SelectionData } from './SelectionRangeHandler';
import { isDocument, shouldAutoFocus } from './utils/Common';
import { NSS } from './utils/DomCreator';
import { adjustStyleValue } from './DOMPropertiesHandler/StyleHandler';
import type { VNode } from '../renderer/Types';
import { setInitValue, getPropsWithoutValue, updateValue } from './valueHandler';
import { compareProps, setDomProps } from './DOMPropertiesHandler/DOMPropertiesHandler';
import { isNativeElement, validateProps } from './validators/ValidateProps';
import { watchValueChange } from './valueHandler/ValueChangeHandler';
import { DomComponent, DomText } from '../renderer/vnode/VNodeTags';
import { updateCommonProp } from './DOMPropertiesHandler/UpdateCommonProp';
import {getCurrentRoot} from '../renderer/RootStack';

export type Props = Record<string, any> & {
  autoFocus?: boolean;
  children?: any;
  dangerouslySetInnerHTML?: any;
  disabled?: boolean;
  hidden?: boolean;
  style?: { display?: string };
};

export type Container = (Element & { _treeRoot?: VNode | null }) | (Document & { _treeRoot?: VNode | null });

let selectionInfo: null | SelectionData = null;

function getChildNS(parentNS: string | null, tagName: string): string {
  if (parentNS === NSS.svg && tagName === 'foreignObject') {
    return NSS.html;
  }

  if (parentNS === null || parentNS === NSS.html) {
    // 没有父命名空间，或父命名空间为xhtml
    return NSS[tagName] ?? NSS.html;
  }

  // 默认返回parentNamespace.
  return parentNS;
}

// 获取容器
export function getNSCtx(parentNS: string, type: string, dom?: Container): string {
  return dom ? getChildNS(dom.namespaceURI ?? null, dom.nodeName) : getChildNS(parentNS, type);
}

export function prepareForSubmit(): void {
  selectionInfo = <SelectionData>getSelectionInfo();
}

export function resetAfterSubmit(): void {
  resetSelectionRange(selectionInfo);
  selectionInfo = null;
}

// 创建 DOM 对象
export function newDom(tagName: string, props: Props, parentNamespace: string, vNode: VNode): Element {
  // document取值于treeRoot对应的DOM的ownerDocument。
  // 解决：在iframe中使用top的inula时，inula在创建DOM时用到的document并不是iframe的document，而是top中的document的问题。
  const rootDom = getCurrentRoot().realNode;
  const doc = isDocument(rootDom) ? rootDom : rootDom.ownerDocument;

  const dom: Element = createDom(tagName, parentNamespace, doc);
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
  const isNativeTag = isNativeElement(tagName, props);
  setDomProps(dom, props, isNativeTag, true);

  if (tagName === 'input' || tagName === 'textarea') {
    // 增加监听value和checked的set、get方法
    watchValueChange(dom);
  }

  // 设置dom.value值，触发受控组件的set方法
  setInitValue(tagName, dom, rawProps);

  return shouldAutoFocus(tagName, rawProps);
}

// 准备更新之前进行一系列校验 DOM，寻找属性差异等准备工作
export function getPropChangeList(dom: Element, type: string, lastRawProps: Props, nextRawProps: Props): Object {
  // 校验两个对象的不同
  validateProps(type, nextRawProps);

  // 重新定义的属性不需要参与对比，被代理的组件需要把这些属性覆盖到props中
  const oldProps: Object = getPropsWithoutValue(type, dom, lastRawProps);
  const newProps: Object = getPropsWithoutValue(type, dom, nextRawProps);

  return compareProps(oldProps, newProps);
}

export function isTextChild(type: string, props: Props): boolean {
  if (type === 'textarea' || type === 'option' || type === 'noscript') {
    return true;
  }
  const childType = typeof props.children;
  if (childType === 'string' || childType === 'number') {
    return true;
  } else {
    return (
      props.dangerouslySetInnerHTML &&
      typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML.__html !== null &&
      props.dangerouslySetInnerHTML.__html !== undefined
    );
  }
}

export function newTextDom(text: string, processing: VNode): Text {
  const textNode: Text = document.createTextNode(text);
  saveVNode(processing, textNode);
  return textNode;
}

// 提交vNode的类型为DomComponent或者DomText的更新
export function submitDomUpdate(tag: string, vNode: VNode) {
  const newProps = vNode.props;
  const element: Element | null = vNode.realNode;

  if (tag === DomComponent) {
    // DomComponent类型
    if (element !== null && element !== undefined) {
      const type = vNode.type;
      const changeList = vNode.changeList;
      vNode.changeList = null;

      if (changeList !== null) {
        saveVNode(vNode, element);
        updateVNodeProps(element, newProps);
        // 应用diff更新Properties.
        // 当一个选中的radio改变名称,浏览器使另一个radio的复选框为false.
        if (
          type === 'input'
          && newProps.type === 'radio'
          && newProps.name !== null
          && newProps.name !== undefined
          && newProps.checked !== null
          && newProps.checked !== undefined
        ) {
          updateCommonProp(element, 'checked', newProps.checked, true);
        }
        const isNativeTag = isNativeElement(type, newProps);
        setDomProps(element, changeList, isNativeTag, false);
        updateValue(type, element, newProps);
      }
    }
  } else if (tag === DomText) {
    if (element != null) {
      // text类型
      element.textContent = newProps;
    }
  }
}

export function clearText(dom: Element): void {
  dom.innerHTML = '';
}

// 添加child元素
export function appendChildElement(parent: Element | Container, child: Element | Text): void {
  parent.appendChild(child);
}

// 插入dom元素
export function insertDomBefore(parent: Element | Container, child: Element | Text, beforeChild: Element | Text) {
  parent.insertBefore(child, beforeChild);
}

export function removeChildDom(parent: Element | Container, child: Element | Text) {
  parent.removeChild(child);
}

// 隐藏元素
export function hideDom(tag: string, dom: Element | Text) {
  if (tag === DomComponent) {
    dom.style.display = 'none';
  } else if (tag === DomText) {
    dom.textContent = '';
  }
}

// 不隐藏元素
export function unHideDom(tag: string, dom: Element | Text, props?: Props) {
  if (tag === DomComponent) {
    dom.style.display = adjustStyleValue('display', props?.style?.display ?? '');
  } else if (tag === DomText) {
    dom.textContent = props;
  }
}
