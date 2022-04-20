/**
 * <input> <textarea> <select> <option> 对 value 做了特殊处理
 * 处理组件被代理和不被代理情况下的不同逻辑
 */

import {HorizonDom, HorizonSelect, IProperty} from '../utils/Interface';
import {
  getInputPropsWithoutValue,
  setInitInputValue,
  updateInputValue,
  resetInputValue,
} from './InputValueHandler';
import {
  getOptionPropsWithoutValue,
} from './OptionValueHandler';
import {
  getSelectPropsWithoutValue,
  updateSelectValue,
} from './SelectValueHandler';
import {
  getTextareaPropsWithoutValue,
  updateTextareaValue,
} from './TextareaValueHandler';
import {getDomTag} from '../utils/Common';

// 获取元素除了被代理的值以外的属性
function getPropsWithoutValue(type: string, dom: HorizonDom, properties: IProperty) {
  switch (type) {
    case 'input':
      return getInputPropsWithoutValue(<HTMLInputElement>dom, properties);
    case 'option':
      return getOptionPropsWithoutValue(dom, properties);
    case 'select':
      return getSelectPropsWithoutValue(<HorizonSelect>dom, properties);
    case 'textarea':
      return getTextareaPropsWithoutValue(<HTMLTextAreaElement>dom, properties);
    default:
      return properties;
  }
}

// 其它属性挂载完成后处理被代理值相关的属性
function setInitValue(type: string, dom: HorizonDom, properties: IProperty) {
  switch (type) {
    case 'input':
      setInitInputValue(<HTMLInputElement>dom, properties);
      break;
    case 'select':
      updateSelectValue(<HorizonSelect>dom, properties, true);
      break;
    case 'textarea':
      updateTextareaValue(<HTMLTextAreaElement>dom, properties, true);
      break;
    default:
      break;
  }
}

// 更新需要适配的属性
function updateValue(type: string, dom: HorizonDom, properties: IProperty) {
  switch (type) {
    case 'input':
      updateInputValue(<HTMLInputElement>dom, properties);
      break;
    case 'select':
      updateSelectValue(<HorizonSelect>dom, properties);
      break;
    case 'textarea':
      updateTextareaValue(<HTMLTextAreaElement>dom, properties);
      break;
    default:
      break;
  }
}

function resetValue(dom: HorizonDom, properties: IProperty) {
  const type = getDomTag(dom);
  switch (type) {
    case 'input':
      resetInputValue(<HTMLInputElement>dom, properties);
      break;
    case 'select':
      updateSelectValue(<HorizonSelect>dom, properties);
      break;
    case 'textarea':
      updateTextareaValue(<HTMLTextAreaElement>dom, properties);
      break;
    default:
      break;
  }
}

export {
  getPropsWithoutValue,
  setInitValue,
  updateValue,
  resetValue,
};
