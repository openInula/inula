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

import { Props } from '../utils/Interface';

// 值的优先级 value > children > defaultValue
function getInitValue(props: Props) {
  const { value } = props;

  if (value === undefined) {
    const { defaultValue, children } = props;
    let initValue = defaultValue;

    // children content存在时，会覆盖defaultValue
    if (children != null) {
      // 子节点不是纯文本，则取第一个子节点
      initValue = children instanceof Array ? children[0] : children;
    }

    // defaultValue 属性未配置，置为空字符串
    initValue = initValue ?? '';
    return initValue;
  } else {
    return value;
  }
}

export function getTextareaPropsWithoutValue(dom: HTMLTextAreaElement, properties: Object) {
  return {
    ...properties,
    value: undefined,
  };
}

export function updateTextareaValue(dom: HTMLTextAreaElement, props: Props, isInit = false) {
  if (isInit) {
    const initValue = getInitValue(props);
    if (initValue !== '') {
      dom.value = initValue;
    }
  } else {
    // 获取当前节点的 value 值
    let value = props.value;
    if (value != null) {
      value = String(value);
      // 当且仅当值实际发生变化时才去设置节点的value值
      if (dom.value !== value) {
        dom.value = value;
      }
    }
  }
}
