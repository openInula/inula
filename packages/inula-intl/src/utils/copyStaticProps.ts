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
import { isMemo, ForwardRef } from 'openinula';
import { INULA_FORWARD_REF_STATICS, INULA_MEMO_STATICS, INULA_STATICS, NATIVE_STATICS } from '../constants';

const staticsMap = new Map();
staticsMap.set(ForwardRef, INULA_FORWARD_REF_STATICS);

// 确定给定的组件是否为Memo组件，并返回相应的静态属性
function getStatics(component) {
  if (isMemo(component)) {
    return INULA_MEMO_STATICS;
  }

  if (staticsMap.has(component['vtype'])) {
    return staticsMap.get(component['vtype']) || INULA_STATICS;
  }
}

/**
 * 判断给定的对象属性描述是否有效
 * @param sourceComponent
 * @param key
 */
function isDescriptorValid<U>(sourceComponent: U, key: string | symbol) {
  const descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
  return descriptor && (!descriptor.get || descriptor.get.prototype);
}

// 将一个对象的非react静态属性复制到另一个对象上，并返回马目标对象
function copyStaticProps<T, U>(targetComponent: T, sourceComponent: U): T {
  if (typeof sourceComponent === 'string') {
    return targetComponent;
  }
  // 递归拷贝静态属性
  const inheritedComponent = Object.getPrototypeOf(sourceComponent);
  if (inheritedComponent && inheritedComponent !== Object.prototype) {
    copyStaticProps(targetComponent, inheritedComponent);
  }

  // 获取源组件的属性列表
  const keys: (string | symbol)[] = [
    //获取指定对象自身的所有属性的名称（包括不可枚举属性）
    ...Object.getOwnPropertyNames(sourceComponent),

    //获取指定对象自身的所有 Symbol 类型的属性的名称（包括不可枚举属性）
    ...Object.getOwnPropertySymbols(sourceComponent),
  ];

  // 获取目标组件和源组件的静态属性
  const targetStatics = getStatics(targetComponent);
  const sourceStatics = getStatics(sourceComponent);

  keys.forEach(key => {
    if (
      !NATIVE_STATICS[key] &&
      !(targetStatics && targetStatics[key]) &&
      !(sourceStatics && sourceStatics[key]) &&
      isDescriptorValid(sourceComponent, key)
    ) {
      try {
        // 在一个已有的targetComponent对象上增加sourceComponent的属性
        Object.defineProperty(targetComponent, key, Object.getOwnPropertyDescriptor(sourceComponent, key)!);
      } catch (e) {
        console.log('Error occurred while copying static props:', e);
      }
    }
  });

  return targetComponent;
}

export default copyStaticProps;
