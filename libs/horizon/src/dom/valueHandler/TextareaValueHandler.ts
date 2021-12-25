import {IProperty} from '../utils/Interface';


// 值的优先级 value > children > defaultValue
function getInitValue(properties: IProperty) {
  const {value} = properties;

  if (value == null) {
    const {defaultValue, children} = properties;
    let initValue = defaultValue;

    // children content存在时，会覆盖defaultValue
    if (children != null) {
      // 子节点不是纯文本，则取第一个子节点
      initValue = children instanceof Array ? children[0] : children;
    }

    // defaultValue 属性未配置，置为空字符串
    initValue = initValue != null ? initValue : '';
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

export function updateTextareaValue(dom: HTMLTextAreaElement, properties: IProperty, isInit: boolean = false) {
  if (isInit) {
    const initValue = getInitValue(properties);
    if (initValue !== '') {
      dom.value = initValue;
    }
  } else {
    // 获取当前节点的 value 值
    let value = properties.value;
    if (value != null) {
      value = String(value);
      // 当且仅当值实际发生变化时才去设置节点的value值
      if (dom.value !== value) {
        dom.value = value;
      }
    }
  }
}

