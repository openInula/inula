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

import { TYPE_COMMON_ELEMENT } from './JSXElementType';
import { getProcessingClassVNode } from '../renderer/GlobalVar';
import { ContextType, Source } from '../renderer/Types';
import { BELONG_CLASS_VNODE_KEY } from '../renderer/vnode/VNode';
import { Context, ExoticComponent, InulaElement, InulaNode, KVObject, ConsumerProps, ProviderProps } from '../types';
import { ReduxStoreHandler } from 'src/inulax/adapters/redux';
import { Subscription } from 'src/inulax/adapters/subscription';
import { OriginalComponent } from '../inulax/adapters/reduxReact';
import { MergePropsP } from '../../build';

/**
 * vtype 节点的类型，这里固定是element
 * type 保存dom节点的名称或者组件的函数地址
 * key key属性
 * ref ref属性
 * props 其他常规属性
 */
export function JSXElement(type, key, ref, vNode, props, source: Source | null) {
  const ele = {
    // 元素标识符
    vtype: TYPE_COMMON_ELEMENT,
    src: null,

    // 属于元素的内置属性
    type: type,
    key: key,
    ref: ref,
    props: props,

    // 所属的class组件,clonedeep jsxElement时需要防止无限循环
    [BELONG_CLASS_VNODE_KEY]: vNode,
  };
  // 兼容IE11不支持Symbol
  if (typeof BELONG_CLASS_VNODE_KEY === 'string') {
    Object.defineProperty(ele, BELONG_CLASS_VNODE_KEY, {
      configurable: false,
      enumerable: false,
      value: vNode,
    });
  }
  if (isDev) {
    // 为了test判断两个 JSXElement 对象是否相等时忽略src属性，需要设置src的enumerable为false
    Object.defineProperty(ele, 'src', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    });
  }

  return ele;
}

function mergeDefault(sourceObj, defaultObj) {
  Object.keys(defaultObj).forEach(key => {
    if (sourceObj[key] === undefined) {
      sourceObj[key] = defaultObj[key];
    }
  });
}

// ['key', 'ref', '__source', '__self']属性不从setting获取
const keyArray = ['key', 'ref', '__source', '__self'];
//这个没太懂 todo
function buildElement(isClone, type, setting, children) {
  // setting中的值优先级最高，clone情况下从 type 中取值，创建情况下直接赋值为 null
  const key = setting && setting.key !== undefined ? String(setting.key) : isClone ? type.key : null;
  const ref = setting && setting.ref !== undefined ? setting.ref : isClone ? type.ref : null;
  const props = isClone ? { ...type.props } : {};
  let vNode = isClone ? type[BELONG_CLASS_VNODE_KEY] : getProcessingClassVNode();

  if (setting !== null && setting !== undefined) {
    for (const k in setting) {
      if (!keyArray.includes(k)) {
        props[k] = setting[k];
      }
    }
    if (setting.ref !== undefined && isClone) {
      vNode = getProcessingClassVNode();
    }
  }

  if (children.length) {
    props.children = children.length === 1 ? children[0] : children;
  }
  const element = isClone ? type.type : type;
  // 合并默认属性
  if (element && element.defaultProps) {
    mergeDefault(props, element.defaultProps);
  }
  let src: Source | null = null;
  if (setting?.__source) {
    src = {
      fileName: setting.__source.fileName,
      lineNumber: setting.__source.lineNumber,
    };
  }
  return JSXElement(element, key, ref, vNode, props, src);
}

// 创建Element结构体，供JSX编译时调用
//type 细节化 todo 参考react
export function createElement<P>(
  //仍然需要修改 MergeProps定义问题
  type: OriginalComponent<MergedProps>,
  setting?: P | null,
  ...children: InulaNode[]
): InulaElement<P>;

export function createElement(
  type: ExoticComponent<ProviderProps<{ store: ReduxStoreHandler; subscription: Subscription }>>,
  setting: { [p: string]: any } | null,
  ...children: InulaNode[]
): InulaElement;

export function createElement(
  type: ExoticComponent<ConsumerProps<{ store: ReduxStoreHandler; subscription: Subscription }>>,
  setting: { [key: string]: any } | null,
  ...children: InulaNode[]
): InulaElement;

// 重载签名 2：处理 InulaElement 类型
export function createElement<P>(type: InulaElement<P>, setting?: P | null, ...children: InulaNode[]): InulaElement<P>;

// 实现签名：与重载签名一致的实现
export function createElement<P>(
  type:
    | string
    | InulaElement<P>
    | ExoticComponent<ConsumerProps<P>>
    | Context<{ store: ReduxStoreHandler; subscription: Subscription }>
    | ExoticComponent<ProviderProps<{ store: ReduxStoreHandler; subscription: Subscription }>>
    | OriginalComponent<MergeProps>,
  setting?: (P & { children?: InulaNode }) | null,
  ...children: InulaNode[]
): InulaElement | InulaElement<P> {
  return buildElement(false, type, setting, children);
}
//只传入 element，克隆该元素，返回一个新的 InulaElement。
export function cloneElement<P>(element: InulaElement<P>): InulaElement<P>;
//传入 element 和 setting，克隆元素并覆盖属性。
export function cloneElement<P>(element: InulaElement<P>, setting: Partial<P> | null): InulaElement<P>;
//：传入 element、setting 和 children，克隆元素，覆盖属性并指定新的子节点。
export function cloneElement<P>(
  element: InulaElement<P>,
  setting: Partial<P> | null,
  ...children: InulaNode[]
): InulaElement<P>;

export function cloneElement<P>(
  element: InulaElement<P>,
  setting?: Partial<P> | null,
  ...children: InulaNode[]
): InulaElement<P> {
  return buildElement(true, element, setting, children);
}
// 检测结构体是否为合法的Element
export function isValidElement<P>(element: KVObject | null | undefined): element is InulaElement<P> {
  return !!(element && element.vtype === TYPE_COMMON_ELEMENT);
}

// 兼容高版本的babel编译方式
export function jsx(type, setting, key) {
  if (setting.key === undefined && key !== undefined) {
    setting.key = key;
  }
  return buildElement(false, type, setting, []);
}
