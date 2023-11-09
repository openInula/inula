/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import { Hook } from '../../../inula/src/renderer/hooks/HookType';
import { ModifyHooks, ModifyProps, ModifyState } from '../utils/constants';
import { VNode } from '../../../inula/src/renderer/vnode/VNode';
import {
  ClassComponent,
  FunctionComponent,
  ContextConsumer,
  ContextProvider,
  ForwardRef,
  SuspenseComponent,
  MemoComponent,
} from '../../../inula/src/renderer/vnode/VNodeTags';
import { helper } from '../injector';
import { JSXElement, ContextType } from '../../../inula/src/renderer/Types';
import { decycle } from 'json-decycle';

// 展示值为 string 的可编辑模型
type EditableStringType = 'string' | 'number' | 'undefined' | 'null';
// 展示值为 string 的不可编辑类型
type UnEditableStringType =
  | 'function'
  | 'symbol'
  | 'object'
  | 'map'
  | 'set'
  | 'array'
  | 'dom' // 值为 dom 元素的 ref 类型
  | 'ref'; // 值为其他数据的 ref 类型

type ShowAsStringType = EditableStringType | UnEditableStringType;

export type IAttr = {
  name: string | number;
  indentation: number;
  hIndex?: number; // 用于记录 hook 的 hIndex 值
} & (
  | {
  type: ShowAsStringType;
  value: string;
}
  | {
  type: 'boolean';
  value: boolean;
}
  );

type ShowType = ShowAsStringType | 'boolean';

const propsAndStateTag = [ClassComponent];
const propsAndHooksTag = [FunctionComponent, ForwardRef];
const propsTag = [ContextConsumer, ContextProvider, SuspenseComponent, MemoComponent];
const MAX_TITLE_LENGTH = 50;

function isJSXElement(obj: any): obj is JSXElement {
  return !!(obj?.type && obj.vtype);
}

const isCycle = (obj: any): boolean => {
  return obj?.Consumer === obj;
};

const getObjectKeys = (attr: Record<string, any>): Array<string | number | symbol> => {
  const keys: (string | symbol)[] = [];
  let current = attr;
  try {
    while (current != null) {
      const currentKeys = [
        ...Object.keys(current),
        ...Object.getOwnPropertySymbols(current)
      ];
      const descriptors = Object.getOwnPropertyDescriptors(current);
      currentKeys.forEach(key => {
        // @ts-ignore key 可以为 symbol 类型
        if (descriptors[key].enumerable) {
          keys.push(key);
        }
      });
      current = Object.getPrototypeOf(current);
    }
  } catch (e) {
    console.log(attr);
  }
  return keys;
};

// 用于比较两个 key 值的顺序
export function sortKeys(
  firstKey: string | number | symbol,
  secondKey: string | number | symbol
): number {
  if (firstKey.toString() > secondKey.toString()) {
    return 1;
  } else if (secondKey.toString() > firstKey.toString()) {
    return -1;
  } else {
    return 0;
  }
}

const parseSubTitle = <T>(attr: T) => {
  const AttrType = typeof attr;

  if (Array.isArray(attr)) {
    let title = '';
    // 当 i > 0 时多加一个逗号和空格，例如：Person: { name: 'XXX', age: xxx }
    for (let i = 0; i < attr.length; i++) {
      if (i > 0) {
        title = `${title}, `;
      }
      title = `${title}${parseSubTitle(attr[i])}`;
      if (title.length > MAX_TITLE_LENGTH) {
        break;
      }
    }

    if (title.length > MAX_TITLE_LENGTH) {
      title = `${title.substr(0, MAX_TITLE_LENGTH)}…`;
    }
    return `[${title}]`;
  } else if (AttrType === 'string') {
    return `"${attr}"`;
  } else if (AttrType === 'function') {
    const funcName = attr['name'];
    return `ƒ ${funcName}() {}`;
  } else if (
    AttrType === 'boolean' ||
    AttrType === 'number' ||
    AttrType === 'undefined'
  ) {
    return `${attr}`;
  } else if (AttrType === 'object') {
    if (attr === null) {
      return 'null';
    }

    if (isCycle(attr)) {
      attr = JSON.parse(JSON.stringify(attr, decycle()));
    }
    const keys = getObjectKeys(attr).sort(sortKeys);
    let title = '';
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // 当 i > 0 时多加一个逗号和空格，例如：Person: { name: "xxx", age: xxx }
      if (i > 0) {
        title = `${title}, `;
      }
      title = `${title}${key.toString()}: ${parseSubTitle(attr[key])}`;
      if (title.length > MAX_TITLE_LENGTH) {
        break;
      }
    }
    if (title.length > MAX_TITLE_LENGTH) {
      title = `${title.substr(0, MAX_TITLE_LENGTH)}…`;
    }
    return `{${title}}`;
  } else if (isJSXElement(attr)) {
    let title = '';
    if (typeof attr.type === 'string') {
      title = attr.type;
    } else {
      title = attr.type?.name ? attr.type.name : helper.getElementTag(attr);
    }
    return `${title} />`;
  }
};

const parseSubAttr = (
  attr: any,
  parentIndentation: number,
  attrName: string,
  result: IAttr[],
  hIndex?: number
) => {
  const AttrType = typeof attr;
  let value: any;
  let showType: any;
  let addSubState;

  if (
    AttrType === 'boolean' ||
    AttrType === 'number' ||
    AttrType === 'undefined' ||
    AttrType === 'string'
  ) {
    value = attr;
    showType = AttrType;
  } else if (AttrType === 'function') {
    const funcName = attr.name;
    value = `ƒ ${funcName}() {}`;
  } else if (AttrType === 'symbol') {
    value = attr.description;
  } else if (AttrType === 'object') {
    if (attr === null) {
      value = 'null';
    } else if (attr instanceof Map) {
      showType = 'map';
      const size = attr.size;
      value = `Map(${size})`;
      addSubState = () => {
        attr.forEach((value, key) => {
          parseSubAttr(value, parentIndentation + 2, key, result);
        });
      };
    } else if (attr instanceof Set) {
      showType = 'set';
      const size = attr.size;
      value = `Set(${size})`;
      addSubState = () => {
        let i = 0;
        attr.forEach(value => {
          parseSubAttr(value, parentIndentation + 2, String(i), result);
        });
        i++;
      };
    } else if (Array.isArray(attr)) {
      showType = 'array';
      value = parseSubTitle(attr);
      addSubState = () => {
        attr.forEach((attrValue, index) => {
          if (isJSXElement(attrValue)) {
            if (typeof attrValue.type === 'string') {
              value = attrValue.type + ' />';
            } else {
              value = attrValue.type?.name ? attrValue.type.name + ' />' : helper.getElementTag(attrValue) + ' />';
            }
            showType = 'string';
            const arrayItem: IAttr = {
              name: index,
              type: showType,
              value,
              indentation: parentIndentation + 2,
            };
            result.push(arrayItem);
          } else {
            parseSubAttr(attrValue, parentIndentation + 2, String(index), result);
          }
        });
      };
    } else if (attr instanceof Element) {
      showType = 'dom';
      value = '<' + attr.tagName.toLowerCase() + ' />';
    } else {
      if (isJSXElement(attr)) {
        if (typeof attr.type === 'string') {
          value = attr.type + ' />';
        } else {
          value = attr.type?.name ? attr.type.name + ' />' : helper.getElementTag(attr) + ' />';
        }
        showType = 'string';
      } else {
        showType = AttrType;
        value = Object.keys(attr).length === 0 ? '{}' : parseSubTitle(attr);
        addSubState = () => {
          // 判断是否为 Context 循环引用
          if (isCycle(attr)) {
            attr = JSON.parse(JSON.stringify(attr, decycle()));
          }
          Object.entries(attr).map(([key, val]) => {
            if (key === '_vNode') {
              val = JSON.parse(JSON.stringify(val, decycle()));
            }
            parseSubAttr(val, parentIndentation + 2, key, result);
          });
        };
      }
    }
  }

  const item: IAttr = {
    name: attrName,
    type: showType,
    value,
    indentation: parentIndentation + 1,
  };
  if (hIndex !== undefined) {
    item.hIndex = hIndex;
  }
  result.push(item);
  if (addSubState) {
    addSubState();
  }
};

// 将属性的值解析成固定格式， props 和类组件的 state 必须是一个对象
export function parseAttr(rootAttr: any) {
  const result: IAttr[] = [];
  const indentation = 0;
  if (typeof rootAttr === 'object' && rootAttr !== null) {
    Object.keys(rootAttr).forEach(key => {
      parseSubAttr(rootAttr[key], indentation, key, result);
    });
  }
  return result;
}

export function parseHooks(
  hooks: Hook<any, any>[] | null,
  depContexts: Array<ContextType<any>> | null,
  getHookInfo
) {
  const result: IAttr[] = [];
  const indentation = 0;
  if (depContexts !== null && depContexts?.length > 0) {
    depContexts.forEach(context => {
      parseSubAttr(context.value, indentation, 'Context', result);
    });
  }
  hooks?.forEach(hook => {
    const hookInfo = getHookInfo(hook);
    if (hookInfo) {
      const { name, hIndex, value } = hookInfo;
      parseSubAttr(value, indentation, name, result, hIndex);
    }
  });
  return result;
}

export function parseVNodeAttrs(vNode: VNode, getHookInfo) {
  const tag = vNode.tag;

  if (propsAndStateTag.includes(tag)) {
    const { props, state, src } = vNode;
    const parsedProps = parseAttr(props);
    const parsedState = parseAttr(state);
    return {
      parsedProps,
      parsedState,
      src,
    };
  } else if (propsAndHooksTag.includes(tag)) {
    const {  props, hooks, depContexts, src } = vNode;
    const parsedProps = parseAttr(props);
    const parsedHooks = parseHooks(hooks, depContexts, getHookInfo);
    return {
      parsedProps,
      parsedHooks,
      src,
    };
  } else if (propsTag.includes(tag)) {
    const { props, src } = vNode;
    const parsedProps = parseAttr(props);
    return {
      parsedProps,
      src,
    };
  }
}

// 计算属性的访问顺序
function calculateAttrAccessPath(item: IAttr, index: number, attrs: IAttr[], isHook: boolean) {
  let currentIndentation = item.indentation;
  const path: (string | number | undefined)[] = [item.name];
  let hookRootItem: IAttr = item;
  for (let i = index - 1; i >= 0; i--) {
    const lastItem = attrs[i];
    const lastIndentation = lastItem.indentation;
    if (lastIndentation < currentIndentation) {
      hookRootItem = lastItem;
      path.push(lastItem.name);
      currentIndentation = lastIndentation;
    }
  }
  path.reverse();
  if (isHook) {
    if (hookRootItem) {
      path[0] = hookRootItem.hIndex;
    } else {
      console.error('There is a bug, please report');
    }
  }
  return path;
}

export function buildAttrModifyData(
  parsedAttrsType: string,
  attrs: IAttr[],
  value,
  item: IAttr,
  index: number,
  id: number
) {
  let type;
  if (parsedAttrsType === 'parsedProps') {
    type = ModifyProps;
  } else if (parsedAttrsType === 'parsedState') {
    type = ModifyState;
  } else if (parsedAttrsType === 'parsedHooks') {
    type = ModifyHooks;
  } else {
    return null;
  }

  const path = calculateAttrAccessPath(item, index, attrs, parsedAttrsType === 'parsedHooks');

  return {
    id: id,
    type: type,
    value: value,
    path: path,
  };
}
