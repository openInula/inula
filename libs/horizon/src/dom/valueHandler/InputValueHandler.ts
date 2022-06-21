import { updateCommonProp } from '../DOMPropertiesHandler/UpdateCommonProp';
import { IProperty } from '../utils/Interface';
import { isInputElement } from '../utils/Common';
import { getVNodeProps } from '../DOMInternalKeys';
import { updateInputValueIfChanged } from './ValueChangeHandler';

function getInitValue(dom: HTMLInputElement, properties: IProperty) {
  const { value, defaultValue, checked, defaultChecked } = properties;

  const defaultValueStr = defaultValue != null ? defaultValue : '';
  const initValue = value != null ? value : defaultValueStr;
  const initChecked = checked != null ? checked : defaultChecked;

  return { initValue, initChecked };
}

export function getInputPropsWithoutValue(dom: HTMLInputElement, properties: IProperty) {
  // checked属于必填属性，无法置
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

  if (value != null) { // 处理 dom.value 逻辑
    if (dom.value !== String(value)) {
      dom.value = String(value);
    }
  } else if (checked != null) {
    updateCommonProp(dom, 'checked', checked, true);
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

// 找出同一form内，name相同的Radio，更新它们Handler的Value
export function syncRadiosHandler(targetRadio: Element) {
  if (isInputElement(targetRadio)) {
    const props = getVNodeProps(targetRadio);
    if (props) {
      const { name, type } = props;
      if (type === 'radio' && name != null) {
        const radioList = document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`);
        for (let i = 0; i < radioList.length; i++) {
          const radio = radioList[i];
          if (radio === targetRadio) {
            continue;
          }
          if (radio.form != null && targetRadio.form != null && radio.form !== targetRadio.form) {
            continue;
          }

          updateInputValueIfChanged(radio);
        }
      }
    }
  }
}
