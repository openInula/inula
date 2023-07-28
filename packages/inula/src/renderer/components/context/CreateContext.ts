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

import type { ContextType } from '../../Types';
import { TYPE_PROVIDER, TYPE_CONTEXT } from '../../../external/JSXElementType';

export function createContext<T>(val: T): ContextType<T> {
  const context: ContextType<T> = {
    vtype: TYPE_CONTEXT,
    value: val,
    Provider: null,
    Consumer: null,
  };

  context.Provider = {
    vtype: TYPE_PROVIDER,
    _context: context,
  };

  context.Consumer = context;

  return context;
}
