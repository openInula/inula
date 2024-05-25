/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { ComponentNode, ReactiveVariable, SubCompVariable } from '../../src/analyze/types';

export function findVarByName(comp: ComponentNode | SubCompVariable, name: string): ReactiveVariable {
  const result = comp.variables.find(v => v.name === name);
  if (!result) {
    throw new Error(`Can't find reactive variable ${name}`);
  }

  return result as ReactiveVariable;
}

export function findSubCompByName(comp: ComponentNode, name: string): SubCompVariable {
  const result = comp.variables.find(v => v.name === name) as SubCompVariable;
  if (!result) {
    throw new Error(`Can't find subComp variable ${name}`);
  }

  return result;
}
