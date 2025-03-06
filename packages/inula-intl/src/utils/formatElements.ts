/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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
import { cloneElement, createElement, Fragment, InulaElement } from '@cloudsop/horizon';
import { voidElementTags } from '../constants';

// 用于匹配标签的正则表达式
const tagReg = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/;

// 用于匹配换行符的正则表达式
const nlReg = /(?:\r\n|\r|\n)/g;

export function formatElements(
  value: string,
  elements: { [key: string]: InulaElement<any> } = {}
): string | Array<any> {
  const elementKeyID = getElementIndex(0, '$Inula');

  //  value：This is a rich text with a custom component: <1/>
  const arrays = value.replace(nlReg, '').split(tagReg);

  // 若无InulaNode元素，则返回
  if (arrays.length === 1) return value;

  const result: any = [];

  const before = arrays.shift();
  if (before) {
    result.push(before);
  }

  for (const [index, children, after] of getElements(arrays)) {
    let element = elements[index];

    if (!element || (voidElementTags[element.type as string] && children)) {
      const errorMessage = !element
        ? `Index not declared as ${index} in original translation`
        : `${element.type} , No child element exists. Please check.`;
      console.error(errorMessage);

      // 对于异常元素，通过创建<></>来代替，并继续解析现有的子元素和之后的元素，并保证在构建数组时，不会因为缺少元素而导致索引错位。
      element = createElement(Fragment, {});
    }

    // 如果存在子元素，则进行递归处理
    const formattedChildren = children ? formatElements(children, elements) : element.props.children;

    // 更新element 的属性和子元素
    const clonedElement = cloneElement(element, { key: elementKeyID() }, formattedChildren);
    result.push(clonedElement);

    if (after) {
      result.push(after);
    }
  }
  return result;
}

/**
 *  从arrays数组中解析出标签元素和其子元素
 * @param arrays
 */
function getElements(arrays: string[]) {
  // 如果 arrays 数组为空，则返回空数组
  if (!arrays.length) return [];

  /**
   * pairedIndex: 第一个元素表示配对标签的内容，即 <1>...</1> 形式的标签。
   * children: 第二个元素表示配对标签内的子元素内容。
   * unpairedIndex: 第三个元素表示自闭合标签的内容，即 <1/> 形式的标签。
   * textAfter: 第四个元素表示标签之后的文本内容，即标签后紧跟着的文本。
   * eg: [undefined,undefined,1,""]
   */
  const [pairedIndex, children, unpairedIndex, textAfter] = arrays.splice(0, 4);

  // 解析当前标签元素和它的子元素，返回一个包含标签索引、子元素和后续文本的数组
  const currentElement: [number, string, string] = [
    parseInt(pairedIndex || unpairedIndex), // 解析标签索引，如果是自闭合标签，则使用 unpaired
    children || '',
    textAfter || '',
  ];

  // 递归调用 getElements 函数，处理剩余的 arrays 数组
  const remainingElements = getElements(arrays);

  // 将当前元素和递归处理后的元素数组合并并返回
  return [currentElement, ...remainingElements];
}

// 对传入富文本元素的位置标志索引
function getElementIndex(count = 0, prefix = '') {
  return function () {
    return `${prefix}_${count++}`;
  };
}
