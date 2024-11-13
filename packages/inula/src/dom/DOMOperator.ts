// /*
//  * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
//  *
//  * openInula is licensed under Mulan PSL v2.
//  * You can use this software according to the terms and conditions of the Mulan PSL v2.
//  * You may obtain a copy of Mulan PSL v2 at:
//  *
//  *          http://license.coscl.org.cn/MulanPSL2
//  *
//  * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
//  * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
//  * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
//  * See the Mulan PSL v2 for more details.
//  */

import { createDom } from './utils/DomCreator';
import { getSelectionInfo, resetSelectionRange, SelectionData } from './SelectionRangeHandler';
import { controlInputValue } from './valueHandler/ValueChangeHandler';
import { updateTextareaValue } from './valueHandler/TextareaValueHandler';
import { NSS } from './utils/DomCreator';
import { adjustStyleValue } from './DOMPropertiesHandler/StyleHandler';
import { type Container, CommonTags } from '../renderer/Types';
export type Props = Record<string, any> & {
  autoFocus?: boolean;
  children?: any;
  dangerouslySetInnerHTML?: any;
  disabled?: boolean;
  hidden?: boolean;
  style?: { display?: string };
};

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
  return dom ? getChildNS((dom as Element).namespaceURI ?? null, dom.nodeName) : getChildNS(parentNS, type);
}

export function prepareForSubmit(): void {
  selectionInfo = <SelectionData>getSelectionInfo();
}

export function resetAfterSubmit(): void {
  resetSelectionRange(selectionInfo);
  selectionInfo = null;
}

export function createElement(
  tagName: string,
  props: Props,
  parentNamespace: string,
  rootDom: Element
): { element: any; props: Props } {
  // document取值于treeRoot对应的DOM的ownerDocument。
  // 解决：在iframe中使用top的inula时，inula在创建DOM时用到的document并不是iframe的document，而是top中的document的问题。
  const doc = rootDom instanceof Document ? rootDom : rootDom.ownerDocument;

  const dom: Element = createDom(tagName, parentNamespace, doc);

  return { element: dom, props };
}
export function handleControledElements(target: Element, type: string, props: Props) {
  switch (type) {
    case 'input':
      controlInputValue(<HTMLInputElement>target, props);
      break;
    case 'textarea':
      updateTextareaValue(<HTMLTextAreaElement>target, props);
      break;
    default:
      break;
  }
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
export function createText(text: string) {
  return document.createTextNode(text);
}

// 提交vNode的类型为DomComponent或者DomText的更新

export function clearText(dom: Element): void {
  dom.innerHTML = '';
}

// 添加child元素
export function appendChildElement(parent: Element | Container, child: Element | Text): void {
  parent.appendChild(child);
}

// 插入dom元素
export function insertElementBefore(parent: Element | Container, child: Element | Text, beforeChild: Element | Text) {
  parent.insertBefore(child, beforeChild);
}

export function removeChildElement(parent: Element | Container, child: Element | Text) {
  parent.removeChild(child);
}

// 隐藏元素
export function hideElement(tag, dom) {
  if (tag === CommonTags.ComponentElement) {
    (dom as HTMLElement).style.display = 'none';
  } else if (tag === CommonTags.TextElement) {
    dom.textContent = '';
  }
}

// 不隐藏元素
export function unHideElement(tag, dom, props?: Props) {
  if (tag === CommonTags.ComponentElement) {
    (dom as HTMLElement).style.display = adjustStyleValue('display', props?.style?.display ?? '') as string;
  } else if (tag === CommonTags.TextElement) {
    dom.textContent = props as any;
  }
}
