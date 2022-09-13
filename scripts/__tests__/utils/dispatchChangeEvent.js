/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
 */
export default function dispatchChangeEvent(inputEle, value) {
  const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputSetter.call(inputEle, value);

  inputEle.dispatchEvent(new Event('input', { bubbles: true}));
}
