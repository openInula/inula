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
import { Bitmap, ViewParticle } from '@openinula/reactivity-parser';

/**
 * To prune the bitmap of unused properties
 * Here are several things to be done in this phase:
 * 1. The unused reactive variables will turn to plain variables
 * 2. And the bit of the variable should be pruned
 * 3. The depMask of the view, computed and watch will be pruned
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
  index = 1,
  bitPositionToRemoveInParent: number[] = []
) {
  const bitPositionToRemove: number[] = [...bitPositionToRemoveInParent];
  // dfs the component tree
  comp.variables = comp.variables.map(v => {
    if (v.type === 'reactive') {
      // get the index bit, computed should keep the highest bit, etc. 0b0111 -> 0b0100
      const shouldBeReactive = comp.usedBit & keepHighestBit(v.bit);

      if (shouldBeReactive) {
        // assign the final bit to the variable, pruning the unused bit
        v.bit = 1 << (index++ - bitPositionToRemove.length - 1);
      } else {
        bitPositionToRemove.push(index++);
        v.bit = 0;
      }

      // If computed, prune the depMask
      if (v.dependency) {
        v.dependency.depMask = getDepMask(v.dependency.allDepBits, bitPositionToRemove);
      }
    } else if (v.type === 'subComp') {
      // Recursively prune the subcomponent, keep the index for the next variable
      pruneUnusedState(v, index, bitPositionToRemove);
      v.usedBit = pruneBitmap(v.usedBit, bitPositionToRemove);
    }

    return v;
  });

  comp.watch?.forEach(watch => {
    const dependency = watch.dependency;
    if (!dependency) {
      return;
    }
    dependency.depMask = getDepMask(dependency.allDepBits, bitPositionToRemove);
  });

  // handle children
  if (comp.type === 'hook') {
    if (comp.children) {
      comp.children.depMask = getDepMask(comp.children.allDepBits, bitPositionToRemove);
    }
  } else {
    if (comp.children) {
      comp.children.forEach(child => {
        pruneViewParticleUnusedBit(child as ViewParticle, bitPositionToRemove);
      });
    }
  }
}

function pruneBitmap(depMask: Bitmap, bitPositionToRemove: number[]) {
  // turn the bitmap to binary string
  const binaryStr = depMask.toString(2);
  const length = binaryStr.length;
  // iterate the binaryStr to keep the bit that is not in the bitPositionToRemove
  let result = '';
  for (let i = length; i > 0; i--) {
    if (!bitPositionToRemove.includes(i)) {
      result = result + binaryStr[length - i];
    }
  }

  return parseInt(result, 2);
}

/**
 * Get the depMask by pruning the bitPositionToRemove
 * The reason why we need to get the depMask from depBitmaps instead of fullDepMask is that
 * the fullDepMask contains the bit of used variables, which is not the direct dependency
 *
 * @param depBitmaps
 * @param bitPositionToRemove
 */
function getDepMask(depBitmaps: Bitmap[], bitPositionToRemove: number[]) {
  // prune each dependency bitmap and combine them
  return depBitmaps.reduce((acc, cur) => {
    // computed should keep the highest bit, others should be pruned
    return keepHighestBit(pruneBitmap(cur, bitPositionToRemove)) | acc;
  }, 0);
}

function pruneViewParticleUnusedBit(particle: ViewParticle, bitPositionToRemove: number[]) {
  // dfs the view particle to prune the bitmap
  const doPrune = (value: any) => {
    if (value && typeof value === 'object' && 'allDepBits' in value) {
      pruneBit(bitPositionToRemove, value);
    }
  };

  function traverse(value: any) {
    if (value === null || typeof value !== 'object') {
      return;
    }

    doPrune(value);

    if (Array.isArray(value)) {
      value.forEach(traverse);
    } else {
      for (const key in value) {
        traverse(value[key]);
      }
    }
  }

  traverse(particle);
}

function pruneBit(bitPositionToRemove: number[], prunable: { allDepBits: number[]; depMask?: number }) {
  prunable.depMask = getDepMask(prunable.allDepBits, bitPositionToRemove);
}

function keepHighestBit(bitmap: number) {
  // 获取二进制数的长度
  const length = bitmap.toString(2).length;

  // 创建掩码
  const mask = 1 << (length - 1);

  // 使用按位与运算符只保留最高位
  return bitmap & mask;
}
