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

import { TYPE_FORWARD_REF } from '../../external/JSXElementType';
import { ExoticComponent, ForwardRefRenderFunc, PropsOmitRef, RefAttributes } from '../../types';

export function forwardRef<T, P = any>(
  render: ForwardRefRenderFunc<T, P>
): ExoticComponent<PropsOmitRef<P>> & RefAttributes<T>;
export function forwardRef(render: (...arg: any) => any): unknown {
  const forwardRefJSXElement = {
    vtype: TYPE_FORWARD_REF,
    $$typeof: TYPE_FORWARD_REF, // 规避三方件hoist-non-react-statics中，通过$$typeof获取类型，但获取不到，导致render被覆盖
    render,
  };

  // 控制vtype不能修改，规避三方件hoist-non-react-statics修改vtype导致问题
  Object.defineProperty(forwardRefJSXElement, 'vtype', {
    configurable: false,
    writable: false,
  });

  return forwardRefJSXElement;
}
