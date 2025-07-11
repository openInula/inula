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
import Inula, { vueReactive, useRef, ReactiveRet } from 'openinula';
import useScoped from './useScoped';

const { shallowReactive } = vueReactive;

interface Data {
  [key: string]: any;
}

interface Option {
  default?: any | (() => any);
  type?: any;
}

interface Options {
  [key: string]: Option;
}

/**
 * 自定义 Hook，用于处理响应式属性
 * @param rawProps 原始属性对象或 null
 * @param options 可选的配置对象，用于设置默认值
 * @returns 响应式处理后的属性对象
 */
export function useReactiveProps(rawProps: Data | null, options: Options = {}): ReactiveRet<Data> {
  // 使用 useRef 来存储响应式对象，确保在重渲染时保持引用
  const objRef = useRef<null | ReactiveRet<Data>>(null);

  if (objRef.current === null) {
    // 首次渲染时初始化属性
    objRef.current = initProps(rawProps, options);
  } else {
    // 后续更新时更新属性
    updateProps(objRef.current, rawProps, options);
  }

  useScoped();

  return objRef.current;
}

/**
 * 初始化属性对象
 * @param rawProps 原始属性对象或 null
 * @param options 配置对象，包含默认值
 * @returns 响应式处理后的属性对象
 */
export function initProps(rawProps: Data | null, options: Options): ReactiveRet<Data> {
  const props: Data = {};

  // 设置完整的属性
  setFullProps(rawProps, props, options);

  return shallowReactive(props) as ReactiveRet<Data>;
}

/**
 * 设置完整的属性
 * @param rawProps 原始属性对象或 null
 * @param props 目标属性对象
 * @param options 属性配置对象，包含默认值等信息
 */
function setFullProps(rawProps: Data | null, props: Data, options: Options): void {
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      props[key] = resolvePropValue(options, key, value);
    }
  }

  // 设置默认值
  for (const key in options) {
    if (
      Object.prototype.hasOwnProperty.call(options, key) &&
      (!Object.prototype.hasOwnProperty.call(props, key) || props[key] === undefined)
    ) {
      props[key] = resolvePropValue(options, key, props[key]);
    }
  }
}

/**
 * 更新属性对象
 * @param props 待更新的属性对象
 * @param rawProps 包含新值的原始属性对象或 null
 * @param options 属性配置对象，包含默认值等信息
 */
export function updateProps(props: Data, rawProps: Data | null, options: Options): void {
  for (const key in rawProps) {
    const value = rawProps![key];
    props[key] = resolvePropValue(options, key, value);
  }
}

/**
 * 解析属性值，考虑默认值
 * @param options 配置对象，包含默认值
 * @param key 属性键
 * @param value 当前属性值
 * @returns 解析后的属性值
 */
function resolvePropValue(options: Options, key: string, value: unknown): unknown {
  const opt = options[key];
  if (opt != null) {
    // 设置默认值
    if (opt.default != null && value === undefined) {
      const defaultValue = opt.default;
      if (typeof defaultValue === 'function' && !(opt.type && opt.type === Function)) {
        value = defaultValue();
      } else {
        value = defaultValue;
      }
    }
  }
  return value;
}
