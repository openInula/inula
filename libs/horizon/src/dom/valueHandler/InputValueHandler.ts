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
  let {checked} = props;
  if (checked == null) {
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
  const {value, checked} = props;

  if (value != null) { // 处理 dom.value 逻辑
    if (dom.value !== String(value)) {
      dom.value = String(value);
    }
  } else if (checked != null) {
    updateCommonProp(dom, 'checked', checked, true);
  }
}

// 设置input的初始值
export function setInitInputValue(dom: HTMLInputElement, props: Props) {
  const {value, defaultValue} = props;
  const {initValue, initChecked} = getInitValue(dom, props);

  if (value != null || defaultValue != null) {
    // value 的使用优先级 value 属性 > defaultValue 属性 > 空字符串
    const initValueStr = String(initValue);

    dom.value = initValueStr;

    dom.defaultValue = initValueStr;
  }

  // checked 的使用优先级 checked 属性 > defaultChecked 属性 > false
  dom.defaultChecked = Boolean(initChecked);
}
