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

import { types as t } from '@openinula/babel-api';
import { ComponentNode, HookNode, StateStmt, SubCompStmt } from '../../src/analyze/types';

export function findVarByName(comp: ComponentNode | HookNode, name: string): StateStmt {
  const result = comp.body.find(v => {
    if (v.type === 'state') {
      const id = v.name as t.Identifier;
      return id.name === name;
    }
    return false;
  });
  if (!result) {
    throw new Error(`Can't find reactive variable ${name}`);
  }

  return result as StateStmt;
}

export function findSubCompByName(comp: ComponentNode | HookNode, name: string): SubCompStmt {
  const result = comp.body.find(v => v.type === 'subComp' && v.name === name) as SubCompStmt;
  if (!result) {
    throw new Error(`Can't find subComp variable ${name}`);
  }

  return result;
}
