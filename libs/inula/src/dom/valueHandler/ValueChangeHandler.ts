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
 * Inula的输入框和文本框的change事件在原生的change事件上做了一层处理
 * 只有值发生变化时才会触发change事件。
 */

const HANDLER_KEY = '_valueChangeHandler';

// 判断是否是 check 类型
function isCheckType(dom: HTMLInputElement): boolean {
  const { type, nodeName } = dom;
  if (nodeName && nodeName.toLowerCase() === 'input') {
    return type === 'checkbox' || type === 'radio';
  }

  return false;
}

/**
 * value值发生变化时，执行value的getter、setter。
 * 事件触发时，判断currentVal 和 input 的真实值是否一致，从而判断是否实际变更，
 * 只有发生变更了，事件处理才会生成一个change事件
 */
export function watchValueChange(dom) {
  if (!dom[HANDLER_KEY]) {
    // check: 复选框、单选框; value: 输入框、文本框等
    const keyForValue = isCheckType(dom) ? 'checked' : 'value';
    // 获取 value 属性的描述信息，其 value 在其 constructor 的 原型上
    const descriptor = Object.getOwnPropertyDescriptor(dom.constructor.prototype, keyForValue);

    if (Object.prototype.hasOwnProperty.call(dom, keyForValue)) {
      return;
    }

    // currentVal存储最新值，并重写value的setter、getter
    let currentVal = String(dom[keyForValue]);

    const setFunc = descriptor?.set;
    Object.defineProperty(dom, keyForValue, {
      ...descriptor,
      set: function (value) {
        currentVal = String(value);
        setFunc?.apply(this, [value]);
      },
    });

    dom[HANDLER_KEY] = {
      getValue() {
        return currentVal;
      },
      setValue(value) {
        currentVal = String(value);
      },
    };
  }
}

// 更新input dom的handler 状态，返回是否更新
export function updateInputHandlerIfChanged(dom) {
  const handler = dom[HANDLER_KEY];
  if (!handler) {
    return true;
  }

  let newValue;
  if (isCheckType(dom)) {
    newValue = dom.checked ? 'true' : 'false';
  } else {
    newValue = dom.value;
  }

  const oldValue = handler.getValue();
  if (newValue !== oldValue) {
    handler.setValue(newValue);
    return true;
  }

  return false;
}
