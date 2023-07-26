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

/**
 * 处理文本框、输入框中框选范围内的数据
 */

import { getIFrameFocusedDom, isText } from './utils/Common';

import { isElement } from './utils/Common';

/**
 * 设置聚焦的 textarea 或 input 节点的选择范围
 * @param dom 需要设置选择范围的 input 或 textarea
 * @param range 选择范围对象
 */
function setSelectionRange(dom: HTMLInputElement | HTMLTextAreaElement, range) {
  const { start, end } = range;
  let realEnd = end;

  if (realEnd === null || realEnd === undefined) {
    realEnd = start;
  }

  if (typeof dom.setSelectionRange === 'function') {
    dom.setSelectionRange(start, realEnd);
  }
}

/**
 * 获取文本框、输入框中选中的文本的范围
 * @param dom 需要设置选择范围的 input 或 textarea
 * @return {start: selectionStart, end: selectionEnd}
 */
function getSelectionRange(dom: Element | HTMLInputElement | HTMLTextAreaElement | void) {
  const selectionRange = { start: 0, end: 0 };

  if (!dom) {
    return selectionRange;
  }
  if ('selectionStart' in dom) {
    // 现代浏览器的 input 或 textarea 有 selectionStart 属性.
    selectionRange.start = dom.selectionStart;
    selectionRange.end = dom.selectionEnd;
  }

  return selectionRange;
}

// 判断第一个节点和另一个节点是否是包含关系
function isNodeContainsByTargetNode(targetNode, node) {
  if (!targetNode || !node) {
    return false;
  }
  if (targetNode === node) {
    return true;
  }
  if (isText(targetNode)) {
    return false;
  }
  if (isText(node)) {
    return isNodeContainsByTargetNode(targetNode, node.parentNode);
  }
  if (typeof targetNode.contains === 'function') {
    return targetNode.contains(node); // 该的节点是否为目标节点的后代节点
  }
  if (typeof targetNode.compareDocumentPosition === 'function') {
    // compareDocumentPosition 数值，表示两个节点彼此做比较的位置
    const CONTAINS_CODE = 16;
    // 返回 16 代表 第二节点在第一节点内部
    return targetNode.compareDocumentPosition(node) === CONTAINS_CODE;
  }
  return false;
}

function isInDocument(dom) {
  if (dom && dom.ownerDocument) {
    return isNodeContainsByTargetNode(dom.ownerDocument.documentElement, dom);
  }
  return false;
}

// 判断一个标签是否有设置选择范围的能力
export function hasSelectionProperties(dom) {
  let elementType;

  if (dom && dom.nodeName) {
    elementType = dom.nodeName.toLowerCase();
    const validInputType = ['text', 'search', 'tel', 'url', 'password'];

    if (elementType === 'input') {
      return validInputType.includes(dom.type);
    } else if (elementType === 'textarea') {
      return dom.contentEditable === 'true';
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// 返回当前 focus 的元素以及其选中的范围
export function getSelectionInfo() {
  const focusedDom = getIFrameFocusedDom();
  return {
    focusedDom,
    selectionRange: hasSelectionProperties(focusedDom) ? getSelectionRange(focusedDom) : null,
  };
}

export interface SelectionData {
  focusedDom: HTMLInputElement | HTMLTextAreaElement | void;
  selectionRange?: {
    start: number;
    end: number;
  };
}

// 防止选择范围内的信息因为节点删除或其他原因导致的信息丢失
export function resetSelectionRange(preSelectionRangeData: SelectionData) {
  // 当前 focus 的元素
  const currentFocusedDom = getIFrameFocusedDom();

  // 先前 focus 的元素
  const preFocusedDom = preSelectionRangeData.focusedDom;

  if (!preFocusedDom) {
    return;
  }

  // 先前的选择范围信息
  const preSelectionRange = preSelectionRangeData.selectionRange;

  if (currentFocusedDom !== preFocusedDom && isInDocument(preFocusedDom)) {
    if (preSelectionRange !== null) {
      setSelectionRange(preFocusedDom, preSelectionRange);
    }

    // 滚动条位置可能会因为一个节点的选中变化位置，需要做处理
    const ancestors = [];
    let ancestor = preFocusedDom.parentNode;
    // 查找先前的 focus 节点的先祖
    while (ancestor) {
      if (isElement(ancestor)) {
        // 是元素节点，就把先祖信息放到先祖数组中
        // @ts-ignore
        const { scrollLeft, scrollTop } = ancestor;
        ancestors.push({
          dom: ancestor,
          scrollLeft,
          scrollTop,
        });
      }
      ancestor = ancestor.parentNode;
    }

    // 执行先前 focus 节点的 focus 方法
    if (typeof preFocusedDom.focus === 'function') {
      preFocusedDom.focus();
    }

    ancestors.forEach(ancestorInfo => {
      const ancestorDom = ancestorInfo.dom;
      ancestorDom.scrollLeft = ancestorInfo.scrollLeft;
      ancestorDom.scrollTop = ancestorInfo.scrollTop;
    });
  }
}
