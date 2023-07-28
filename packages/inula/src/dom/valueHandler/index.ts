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

/**
 * <input> <textarea> <select> <option> 对 value 做了特殊处理
 * 处理组件被代理和不被代理情况下的不同逻辑
 */

import { InulaDom, InulaSelect, Props } from '../utils/Interface';
import { getInputPropsWithoutValue, setInitInputValue, updateInputValue } from './InputValueHandler';
import { getOptionPropsWithoutValue } from './OptionValueHandler';
import { getSelectPropsWithoutValue, updateSelectValue } from './SelectValueHandler';
import { getTextareaPropsWithoutValue, updateTextareaValue } from './TextareaValueHandler';

// 获取元素除了被代理的值以外的属性
function getPropsWithoutValue(type: string, dom: InulaDom, props: Props) {
  switch (type) {
    case 'input':
      return getInputPropsWithoutValue(<HTMLInputElement>dom, props);
    case 'option':
      return getOptionPropsWithoutValue(dom, props);
    case 'select':
      return getSelectPropsWithoutValue(<InulaSelect>dom, props);
    case 'textarea':
      return getTextareaPropsWithoutValue(<HTMLTextAreaElement>dom, props);
    default:
      return props;
  }
}

// 其它属性挂载完成后处理被代理值相关的属性
function setInitValue(type: string, dom: InulaDom, props: Props) {
  switch (type) {
    case 'input':
      setInitInputValue(<HTMLInputElement>dom, props);
      break;
    case 'select':
      updateSelectValue(<InulaSelect>dom, props, true);
      break;
    case 'textarea':
      updateTextareaValue(<HTMLTextAreaElement>dom, props, true);
      break;
    default:
      break;
  }
}

// 更新需要适配的属性
function updateValue(type: string, dom: InulaDom, props: Props) {
  switch (type) {
    case 'input':
      updateInputValue(<HTMLInputElement>dom, props);
      break;
    case 'select':
      updateSelectValue(<InulaSelect>dom, props);
      break;
    case 'textarea':
      updateTextareaValue(<HTMLTextAreaElement>dom, props);
      break;
    default:
      break;
  }
}

export { getPropsWithoutValue, setInitValue, updateValue };
