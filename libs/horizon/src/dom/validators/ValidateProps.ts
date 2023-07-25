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

import { getPropDetails, PROPERTY_TYPE, PropDetails } from './PropertiesData';

const INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;

// 是内置元素
export function isNativeElement(tagName: string, props: Record<string, any>) {
  return !tagName.includes('-') && props.is === undefined;
}

function isInvalidBoolean(attributeName: string, value: any, propDetails: PropDetails): boolean {
  if (propDetails.type === PROPERTY_TYPE.SPECIAL) {
    return false;
  }

  // 布尔值校验
  if (typeof value === 'boolean') {
    const isBooleanType = propDetails.type === PROPERTY_TYPE.BOOLEAN_STR || propDetails.type === PROPERTY_TYPE.BOOLEAN;

    if (isBooleanType || (attributeName.startsWith('data-') && attributeName.startsWith('aria-'))) {
      return false;
    }

    // 否则有问题
    return true;
  }

  return false;
}

// 是事件属性
export function isEventProp(propName) {
  return propName.substr(0, 2) === 'on';
}

function isValidProp(tagName, name, value) {
  // 校验事件名称
  if (isEventProp(name)) {
    // 事件名称不满足小驼峰
    if (INVALID_EVENT_NAME_REGEX.test(name)) {
      console.error('Invalid event property `%s`, events use the camelCase name.', name);
    }
    return true;
  }

  const propDetails = getPropDetails(name);

  // 当已知属性为错误类型时发出警告
  if (propDetails !== null && isInvalidBoolean(name, value, propDetails)) {
    return false;
  }

  return true;
}

export function isInvalidValue(
  name: string,
  value: any,
  propDetails: PropDetails | null,
  isNativeTag: boolean
): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (!isNativeTag) {
    return false;
  }

  if (propDetails !== null && isInvalidBoolean(name, value, propDetails)) {
    return true;
  }

  if (propDetails !== null && propDetails.type === PROPERTY_TYPE.BOOLEAN) {
    return !value;
  }

  return false;
}

// dev模式下校验属性是否合法
export function validateProps(type, props) {
  if (!props) {
    return;
  }

  // 非内置的元素
  if (!isNativeElement(type, props)) {
    return;
  }

  // style属性必须是对象
  if (props.style !== null && props.style !== undefined && typeof props.style !== 'object') {
    throw new Error('style should be a object.');
  }

  if (isDev) {
    // 校验属性
    const invalidProps = Object.keys(props).filter(key => !isValidProp(type, key, props[key]));

    const propString = invalidProps.map(prop => '`' + prop + '`').join(', ');

    if (invalidProps.length >= 1) {
      console.error('Invalid value for prop %s on <%s> tag.', propString, type);
    }
  }
}
