import {HorizonSelect, IProperty} from '../utils/Interface';

function updateMultipleValue(options, newValues) {
  const newValueSet = new Set();

  newValues.forEach((val) => {
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

export function getSelectPropsWithoutValue(dom: HorizonSelect, properties: Object) {
  return {
    ...properties,
    value: undefined,
  }
}

export function updateSelectValue(dom: HorizonSelect, properties: IProperty, isInit: boolean = false) {
  const {value, defaultValue, multiple} = properties;

  const oldMultiple = dom._multiple !== undefined ? dom._multiple : dom.multiple;
  const newMultiple = Boolean(multiple);
  dom._multiple = newMultiple;

  // 设置了 value 属性
  if (value != null) {
    updateValue(dom.options, value, newMultiple);
  } else if (oldMultiple !== newMultiple) { // 修改了 multiple 属性
    // 切换 multiple 之后，如果设置了 defaultValue 需要重新应用
    if (defaultValue != null) {
      updateValue(dom.options, defaultValue, newMultiple);
    } else {
      // 恢复到未选定状态
      updateValue(dom.options, newMultiple ? [] : '', newMultiple);
    }
  } else if (isInit && defaultValue != null) { // 设置了 defaultValue 属性
    updateValue(dom.options, defaultValue, newMultiple);
  }
}
