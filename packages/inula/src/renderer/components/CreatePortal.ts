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

import { TYPE_PORTAL } from '../../external/JSXElementType';
import type { PortalType } from '../Types';
import { InulaNode, InulaPortal } from '../../types';

export function createPortal(
  children: InulaNode,
  realNode: Element | DocumentFragment,
  key?: null | string
): InulaPortal;
export function createPortal(children: any, realNode: any, key = ''): PortalType | InulaPortal {
  return {
    vtype: TYPE_PORTAL,
    key: key == '' ? '' : '' + key,
    children,
    realNode,
  };
}
