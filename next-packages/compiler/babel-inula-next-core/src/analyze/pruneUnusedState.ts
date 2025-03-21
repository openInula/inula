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

import { ComponentNode, HookNode } from './types';

/**
 * To prune the bitmap of unused properties
 * etc.:
 * ```js
 * let a = 1; // 0b001
 * let b = 2; // 0b010 if b is not *used*, so it should be pruned
 * let c = 3; // 0b100 -> 0b010(cause bit of b is pruned)
 * let d = a + c // The depMask of d should be 0b11, pruned from 0b101
 * ```
 */
export function pruneUnusedState(
  comp: ComponentNode<'comp'> | ComponentNode<'subComp'> | HookNode,
  idMap: Map<number, number>,
  bitIndex = -1
) {
  const reactiveMap = comp.scope.reactiveMap;
  const usedIdBits = comp.scope.usedIdBits;

  let preId: number;
  Array.from(reactiveMap).forEach(([, idBit]) => {
    if (usedIdBits & idBit) {
      if (preId !== idBit) {
        // the reactive shared same id with previous one, we should not change the index
        bitIndex++;
      }
      idMap.set(idBit, 1 << bitIndex);
    }
    preId = idBit;
  });

  for (const stmt of comp.body) {
    if (stmt.type === 'subComp') {
      bitIndex = pruneUnusedState(stmt.component, idMap, bitIndex);
    }
  }

  return bitIndex;
}
