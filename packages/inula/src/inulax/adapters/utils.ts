/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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
import type { ComponentType } from '../../types';
import { TYPE_FORWARD_REF, TYPE_MEMO } from '../../external/JSXElementType';
import type { JSXElement } from '../../external/JSXElement';

// 定义 Inula 组件静态属性的键名列表
const INULA_STATICS: StaticsKeys = [
  'childContextTypes',
  'contextType',
  'contextTypes',
  'defaultProps',
  'displayName',
  'getDefaultProps',
  'getDerivedStateFromError',
  'getDerivedStateFromProps',
  'mixins',
  'propTypes',
  'type',
];

type StaticsKeys = (string | symbol)[];

const BUILTIN_STATICS: StaticsKeys = ['name', 'length', 'prototype', 'caller', 'callee', 'arguments', 'arity'];

// 定义 ForwardRef 组件静态属性的键名列表
const FORWARD_REF_STATICS: StaticsKeys = ['vtype', 'render', 'defaultProps', 'displayName', 'propTypes'];

// 定义 Memo 组件静态属性的键名列表
const MEMO_STATICS: StaticsKeys = ['vtype', 'compare', 'defaultProps', 'displayName', 'propTypes', 'type'];

const {
  defineProperty,
  getOwnPropertyNames,
  getOwnPropertySymbols,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  prototype: objectPrototype,
} = Object;

function getComponentStatic<T extends ComponentType<any>>(component: T) {
  const type = (component as unknown as ReturnType<typeof JSXElement>).vtype;
  if (type === TYPE_MEMO) {
    return MEMO_STATICS;
  } else if (type === TYPE_FORWARD_REF) {
    return FORWARD_REF_STATICS;
  } else {
    return INULA_STATICS;
  }
}

export default function transferNonInulaStatics<T extends ComponentType<any>, S extends ComponentType<any>>(
  target: T,
  source: S | string,
  excludeList: StaticsKeys = []
): ComponentType<any> {
  if (typeof source !== 'string') {
    if (objectPrototype) {
      const inheritedComponent = getPrototypeOf(source);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        // 如果原型存在且不等于对象原型，递归调用，转移原型上的静态属性
        transferNonInulaStatics(target, inheritedComponent, excludeList);
      }
    }

    // 获取源组件的所有属性键名（包括符号属性）
    const keys: StaticsKeys = getOwnPropertyNames(source);
    if (typeof getOwnPropertySymbols === 'function') {
      keys.push(...getOwnPropertySymbols(source));
    }
    // 获取目标组件和源组件的静态属性列表
    const targetStatics = getComponentStatic(target);
    const sourceStatics = getComponentStatic(source);

    // 遍历所有属性键名
    for (const key of keys) {
      // 如果键名不在内置静态属性列表中，且不在排除列表中，且不在源组件的静态属性列表中，且不在目标组件的静态属性列表中
      if (
        !BUILTIN_STATICS.includes(key) &&
        !(excludeList && excludeList.includes(key)) &&
        !(sourceStatics && sourceStatics.includes(key)) &&
        !(targetStatics && targetStatics.includes(key))
      ) {
        // 获取源组件的属性描述符
        const descriptor = getOwnPropertyDescriptor(source, key);
        if (descriptor) {
          try {
            // 将属性描述符应用到目标组件
            defineProperty(target, key, descriptor);
          } catch (_) {
            // 忽略错误
          }
        }
      }
    }
  }
  return target;
}
