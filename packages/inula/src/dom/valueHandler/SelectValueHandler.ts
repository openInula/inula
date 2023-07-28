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

import { InulaSelect, Props } from '../utils/Interface';

function updateMultipleValue(options, newValues) {
  const newValueSet = new Set();

  newValues.forEach(val => {
    newValueSet.add(String(val));
  });

  // options 非数组
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const newValue = newValueSet.has(option.value);

    if (option.selected !== newValue) {
      option.selected = newValue;
    }
  }
}

// 单选时传入的选项参数必须是可以转为字符串的类型
function updateSingleValue(options, newValue) {
  for (let i = 0; i < options.length; i++) {
    const option = options[i];

    if (option.value === String(newValue)) {
      option.selected = true;
      break;
    }
  }
}

// 更新 <option>
function updateValue(options, newValues: any, isMultiple: boolean) {
  if (isMultiple) {
    updateMultipleValue(options, newValues);
  } else {
    updateSingleValue(options, newValues);
  }
}

export function getSelectPropsWithoutValue(dom: InulaSelect, properties: Object) {
  return {
    ...properties,
    value: undefined,
  };
}

export function updateSelectValue(dom: InulaSelect, props: Props, isInit = false) {
  const { value, defaultValue, multiple } = props;

  const oldMultiple = dom._multiple !== undefined ? dom._multiple : dom.multiple;
  const newMultiple = Boolean(multiple);
  dom._multiple = newMultiple;

  // 设置了 value 属性
  if (value !== null && value !== undefined) {
    updateValue(dom.options, value, newMultiple);
  } else if (oldMultiple !== newMultiple) {
    // 修改了 multiple 属性
    // 切换 multiple 之后，如果设置了 defaultValue 需要重新应用
    if (defaultValue !== null && defaultValue !== undefined) {
      updateValue(dom.options, defaultValue, newMultiple);
    } else {
      // 恢复到未选定状态
      updateValue(dom.options, newMultiple ? [] : '', newMultiple);
    }
  } else if (isInit && defaultValue !== null && defaultValue !== undefined) {
    // 设置了 defaultValue 属性
    updateValue(dom.options, defaultValue, newMultiple);
  }
}
