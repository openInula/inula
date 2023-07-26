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

import { updateCommonProp } from '../DOMPropertiesHandler/UpdateCommonProp';
import { Props } from '../utils/Interface';

function getInitValue(dom: HTMLInputElement, props: Props) {
  const { value, defaultValue, checked, defaultChecked } = props;

  const defaultValueStr = defaultValue != null ? defaultValue : '';
  const initValue = value != null ? value : defaultValueStr;
  const initChecked = checked != null ? checked : defaultChecked;

  return { initValue, initChecked };
}

export function getInputPropsWithoutValue(dom: HTMLInputElement, props: Props) {
  // checked属于必填属性，无法置
  let { checked } = props;
  if (checked === undefined) {
    checked = getInitValue(dom, props).initChecked;
  }

  return {
    ...props,
    value: undefined,
    defaultValue: undefined,
    defaultChecked: undefined,
    checked,
  };
}

export function updateInputValue(dom: HTMLInputElement, props: Props) {
  const { value, checked } = props;

  if (value !== undefined) {
    // 处理 dom.value 逻辑
    if (dom.value !== String(value)) {
      dom.value = String(value);
    }
  } else if (checked !== undefined) {
    updateCommonProp(dom, 'checked', checked, true);
  }
}

// 设置input的初始值
export function setInitInputValue(dom: HTMLInputElement, props: Props) {
  const { value, defaultValue } = props;
  const { initValue, initChecked } = getInitValue(dom, props);

  if (value !== undefined || defaultValue !== undefined) {
    // value 的使用优先级 value 属性 > defaultValue 属性 > 空字符串
    const initValueStr = String(initValue);

    dom.value = initValueStr;

    dom.defaultValue = initValueStr;
  }

  // checked 的使用优先级 checked 属性 > defaultChecked 属性 > false
  dom.defaultChecked = Boolean(initChecked);
}
