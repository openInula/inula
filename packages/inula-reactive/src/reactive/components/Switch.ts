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

import { calculateReactive } from '../Utils';
import { JSXElement, VNode } from '../../renderer/Types';
import { Children } from '../../external/ChildrenUtil';

export function Switch<T>({
  children,
  default: df,
}: {
  children: JSXElement[] | Record<any, () => JSXElement>;
  default?: JSXElement;
}): JSXElement | null {
  const arr = Children.toArray(children);

  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    const showComp = arr[i];

    const ifValue: any = calculateReactive((showComp as VNode).props.if);

    if (ifValue) {
      index = i;
      break;
    }
  }

  return index >= 0 ? arr[index] : df ?? null;
}
