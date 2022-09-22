/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
 */

import { getVNodeProps } from '../dom/DOMInternalKeys';
import { getDomTag } from '../dom/utils/Common';
import {  Props } from '../dom/utils/Interface';
import { updateTextareaValue } from '../dom/valueHandler/TextareaValueHandler';
import { updateInputHandlerIfChanged } from '../dom/valueHandler/ValueChangeHandler';
import { updateInputValue } from '../dom/valueHandler/InputValueHandler';

// 记录表单控件 input/textarea/select的onChange事件的targets
let changeEventTargets: Array<any> | null = null;

// 存储队列中缓存组件
export function recordChangeEventTargets(target: EventTarget): void {
  if (changeEventTargets) {
    changeEventTargets.push(target);
  } else {
    changeEventTargets = [target];
  }
}

// 判断是否需要控制value与props保持一致
export function shouldControlValue(): boolean {
  return changeEventTargets !== null && changeEventTargets.length > 0;
}

// 从缓存队列中对受控组件进行赋值
export function tryControlValue() {
  if (!changeEventTargets) {
    return;
  }
  changeEventTargets.forEach(target => {
    controlValue(target);
  });
  changeEventTargets = null;
}

// 受控组件值重新赋值
function controlValue(target: Element) {
  const props = getVNodeProps(target);
  if (props) {
    const type = getDomTag(target);
    switch (type) {
      case 'input':
        controlInputValue(<HTMLInputElement>target, props);
        break;
      case 'textarea':
        updateTextareaValue(<HTMLTextAreaElement>target, props);
        break;
      default:
        break;
    }
  }
}

function controlInputValue(inputDom: HTMLInputElement, props: Props) {
  const { name, type } = props;

  // 如果是 radio，找出同一form内，name相同的Radio，更新它们Handler的Value
  if (type === 'radio' && name != null) {
    const radioList = document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`);
    for (let i = 0; i < radioList.length; i++) {
      const radio = radioList[i];
      if (radio === inputDom) {
        continue;
      }
      if (radio.form != null && inputDom.form != null && radio.form !== inputDom.form) {
        continue;
      }

      updateInputHandlerIfChanged(radio);
    }
  } else {
    updateInputValue(inputDom, props);
  }
}

