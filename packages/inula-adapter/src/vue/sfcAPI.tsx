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

import { InulaNode, vueReactive } from '@cloudsop/horizon';
import { emit } from './globalAPI';

const { useInstance } = vueReactive;

type AnyProps = Record<string, any>;

/**
 * Custom Hook to simulate Vue's fallthrough attributes functionality
 * @param props Component props
 * @param excludeList Parameters declared as props do not fallthrough
 * @returns fallthrough attributes
 */
export function useAttrs<T extends AnyProps>(props: T, excludeList: (keyof T)[] = []): Omit<T, keyof T & string> {
  const attrs = { ...props } as T;
  excludeList.forEach(key => delete attrs[key]);
  const instance = useInstance();
  instance.$attrs = attrs;
  return attrs;
}

type Slots = {
  [key: string]: SlotFunction | InulaNode;
  default?: InulaNode;
};
type SlotFunction = (props: any) => InulaNode;

/**
 * Custom Hook to simulate Vue's useSlots functionality in React
 * @param props Component props
 * @returns An object containing all slots, including the default slot
 */
export function useSlots(props: AnyProps): Slots {
  const slots: Slots = {};

  // Extract template slots from props
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('template_')) {
      const slotName = key.replace('template_', '');
      slots[slotName] = value;
    }
  });

  // Add default slot if children are provided
  if (props.children) {
    slots.default = props.children;
  }

  return slots;
}

export function defineExpose<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed) {
  const instance = useInstance();

  if (instance) {
    // 检查 exposed 是否是一个对象
    if (typeof exposed === 'object' && exposed !== null) {
      // 遍历 exposed 对象的所有属性
      Object.keys(exposed).forEach(key => {
        // 将每个属性赋值给 instance
        instance[key] = exposed[key];
      });
    } else {
      console.warn('defineExpose: Argument should be an object');
    }
  } else {
    console.warn('defineExpose: No instance found. Make sure this is called inside a component setup function.');
  }
}

type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
type EmitsOptions = ObjectEmitsOptions | string[];

// 新的 defineEmits 函数实现
export function defineEmits<T extends EmitsOptions>(emits: T, props: AnyProps) {
  return function <K extends keyof T>(eventName: K, ...args: Parameters<any>) {
    emit(props, eventName as string, ...args);
  };
}
