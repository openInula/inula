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

import { getVNodeProps } from '../dom/DOMInternalKeys';
import { getDomTag, isNotNull } from '../dom/utils/Common';
import { Props } from '../dom/utils/Interface';
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

function controlInputValue(inputDom: HTMLInputElement, props: Props) {
  const { name, type } = props;

  // 如果是 radio，找出同一form内，name相同的Radio，更新它们Handler的Value
  if (type === 'radio' && isNotNull(name)) {
    const radioList = document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`);
    for (let i = 0; i < radioList.length; i++) {
      const radio = radioList[i];
      if (radio === inputDom) {
        continue;
      }
      if (isNotNull(radio.form) && isNotNull(inputDom.form) && radio.form !== inputDom.form) {
        continue;
      }

      updateInputHandlerIfChanged(radio);
    }
  } else {
    updateInputValue(inputDom, props);
  }
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
