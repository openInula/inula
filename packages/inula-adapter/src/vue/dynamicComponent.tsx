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
import Inula, { ComponentType, InulaElement } from 'openinula';
import { getCurrentInstance } from './globalAPI';

// 定义组件映射类型
interface ComponentsMap {
  [key: string]: ComponentType<any>;
}

// DynamicComponent 的 props 类型
interface DynamicComponentProps {
  is: string | ComponentType;
  components?: ComponentsMap;

  [key: string]: any; // 允许任意其他属性
}

/**
 * 对标Vue的动态组件，如：<component :is="Math.random() > 0.5 ? Foo : Bar" />
 * @param is
 * @param components
 * @param componentProps
 * @constructor
 */
export function DynamicComponent({ is, components, ...componentProps }: DynamicComponentProps): InulaElement | null {
  if (is === '') {
    return null;
  }

  let Component: any = null;

  if (typeof is === 'string') {
    const pascalCaseName = toPascalCase(is);
    // Look in local components first
    Component = components && components[pascalCaseName];

    // If not found, look in global components
    if (!Component) {
      const app = getCurrentInstance().appContext.app;
      Component = app._context.components[pascalCaseName];
    }
  } else if (typeof is === 'function') {
    // If 'is' is already a component, use it directly
    Component = is;
  }

  if (!Component) {
    Component = is;
  }

  return <Component {...componentProps} />;
}

// 把vue风格的组件命名转换为react风格的组件命名，如：my-component => MyComponent
function toPascalCase(name: string): string {
  // If the string doesn't contain hyphens, just capitalize the first letter
  if (!name.includes('-')) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // For hyphenated strings, capitalize each word
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

DynamicComponent.__internal_comp_tag = 'DynamicComponent';
