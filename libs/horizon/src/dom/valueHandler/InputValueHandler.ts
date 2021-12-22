import {updateCommonProp} from '../DOMPropertiesHandler/UpdateCommonProp';
import {getVNodeProps} from '../DOMInternalKeys';
import {IProperty} from '../utils/Interface';
import {getRootElement} from '../utils/Common';
import {isInputValueChanged} from './ValueChangeHandler';

function getInitValue(dom: HTMLInputElement, properties: IProperty) {
  const {value, defaultValue, checked, defaultChecked} = properties;

  const defaultValueStr = defaultValue != null ? defaultValue : '';
  const initValue = value != null ? value : defaultValueStr;
  const initChecked = checked != null ? checked : defaultChecked;

  return {initValue, initChecked};
}

export function getInputPropsWithoutValue(dom: HTMLInputElement, properties: IProperty) {
  // checked属于必填属性，无法置空
  let {checked} = properties;
  if (checked == null) {
    checked = getInitValue(dom, properties).initChecked;
  }

  return {
    ...properties,
    value: undefined,
    defaultValue: undefined,
    defaultChecked: undefined,
    checked,
  };
}

export function updateInputValue(dom: HTMLInputElement, properties: IProperty) {
  const {value, checked} = properties;

  if (checked != null) {
    updateCommonProp(dom, 'checked', checked);
  } else if (value != null) { // 处理 dom.value 逻辑
    if (dom.value !== String(value)) {
      dom.value = String(value);
    }
  }
}

// 设置input的初始值
export function setInitInputValue(dom: HTMLInputElement, properties: IProperty) {
  const {value, defaultValue} = properties;
  const {initValue, initChecked} = getInitValue(dom, properties);

  if (value != null || defaultValue != null) {
    // value 的使用优先级 value 属性 > defaultValue 属性 > 空字符串
    const initValueStr = String(initValue);

    dom.value = initValueStr;

    dom.defaultValue = initValueStr;
  }

  // checked 的使用优先级 checked 属性 > defaultChecked 属性 > false
  dom.defaultChecked = Boolean(initChecked);
}

export function resetInputValue(dom: HTMLInputElement, properties: IProperty) {
  const {name, type} = properties;
  // 如果是 radio，先更新相同 name 的 radio
  if (type === 'radio' && name != null) {
    // radio 的根节点
    const radioRoot = getRootElement(dom);

    const radioList = radioRoot.querySelectorAll(`input[type="radio"]`);

    for (let i = 0; i < radioList.length; i++) {
      const radio = radioList[i];
      // @ts-ignore
      if (radio.name !== name) {
        continue;
      }
      if (radio === dom) {
        continue;
      }
      // @ts-ignore
      if (radio.form !== dom.form) {
        continue;
      }

      // @ts-ignore
      const nonHorizonRadioProps = getVNodeProps(radio);

      isInputValueChanged(radio);
      // @ts-ignore
      updateInputValue(radio, nonHorizonRadioProps);
    }
  } else {
    updateInputValue(dom, properties);
  }
}
