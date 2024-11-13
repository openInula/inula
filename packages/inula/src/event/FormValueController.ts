/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { getVNodeProps } from '../renderer/utils/InternalKeys';
import { getTag } from '../renderer/utils/common';
import { InulaReconciler } from '../renderer';
import { ElementType } from '../renderer/Types';

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

// 受控组件值重新赋值
function controlValue(target: ElementType) {
  const props = getVNodeProps(target);
  if (props) {
    const type = getTag(target);
    InulaReconciler.hostConfig.handleControledInputElements(target, type ?? '', props);
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
