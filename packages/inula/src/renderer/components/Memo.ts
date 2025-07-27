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

import { TYPE_MEMO } from '../../external/JSXElementType';
import { ComponentType, ExoticComponent, FunctionComponent, MemoComponent } from '../../types';

export function memo<Props extends Record<string, any>>(
  type: FunctionComponent<Props>,
  compare?: (oldProps: Readonly<Props>, newProps: Readonly<Props>) => boolean
): ExoticComponent<Props>;
export function memo<T extends ComponentType<any>>(
  type: T,
  compare?: (oldProps: any, newProps: any) => boolean
): MemoComponent<T>;
export function memo<Props>(type, compare?: (oldProps: Props, newProps: Props) => boolean): unknown {
  const memoJSXElement = {
    vtype: TYPE_MEMO,
    $$typeof: TYPE_MEMO, // 规避三方件hoist-non-react-statics中，通过$$typeof获取类型，但获取不到，导致type被覆盖
    type: type,
    compare: compare === undefined ? null : compare,
  };

  // 控制vtype不能修改，规避三方件hoist-non-react-statics修改vtype导致问题
  Object.defineProperty(memoJSXElement, 'vtype', {
    configurable: false,
    writable: false,
  });

  return memoJSXElement;
}
