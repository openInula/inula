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

import { ComponentNode } from './types';
import { Bitmap, ViewParticle } from '@openinula/reactivity-parser';

/**
 * To prune the bitmap of unused properties
 * Here the depMask will be defined by prune the unused bit in fullDepMask
 * etc.:
 * ```js
 * let a = 1; // 0b001
 * let b = 2; // 0b010 b is not used*, and should be pruned
 * let c = 3; // 0b100 -> 0b010(cause bit of b is pruned)
 * ```
 */
export function pruneUnusedBit(
  comp: ComponentNode<'comp'> | ComponentNode<'subComp'>,
  index = 1,
  bitPositionToRemoveInParent: number[] = []
) {
  const bitPositionToRemove: number[] = [...bitPositionToRemoveInParent];
  // dfs the component tree
  comp.variables.forEach(v => {
    if (v.type === 'reactive') {
      // get the origin bit, computed should keep the highest bit, etc. 0b0111 -> 0b0100
      const originBit = keepHighestBit(v._fullBits);

      if (comp.usedBit & originBit) {
        v.bit = 1 << (index - bitPositionToRemove.length - 1);
        if (v.dependency) {
          v.dependency.depMask = getDepMask(v.dependency.depBitmaps, bitPositionToRemove);
        }
      } else {
        bitPositionToRemove.push(index);
      }
      index++;
    } else if (v.type === 'subComp') {
      pruneUnusedBit(v, index, bitPositionToRemove);
    }
  });

  comp.watch?.forEach(watch => {
    const dependency = watch.dependency;
    if (!dependency) {
      return;
    }
    dependency.depMask = getDepMask(dependency.depBitmaps, bitPositionToRemove);
  });

  // handle children
  if (comp.children) {
    comp.children.forEach(child => {
      if (child.type === 'comp') {
        pruneUnusedBit(child as ComponentNode<'comp'>, index, bitPositionToRemove);
      } else {
        pruneViewParticleUnusedBit(child as ViewParticle, bitPositionToRemove);
      }
    });
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
  const stack: ViewParticle[] = [particle];
  while (stack.length) {
    const node = stack.pop()! as ViewParticle;
    if (node.type === 'template') {
      node.props.forEach(prop => {
        prop.depMask = getDepMask(prop.depBitmaps, bitPositionToRemove);
      });
      stack.push(node.template);
    } else if (node.type === 'html') {
      for (const key in node.props) {
        node.props[key].depMask = getDepMask(node.props[key].depBitmaps, bitPositionToRemove);
      }
      stack.push(...node.children);
    } else if (node.type === 'text') {
      node.content.depMask = getDepMask(node.content.depBitmaps, bitPositionToRemove);
    } else if (node.type === 'for') {
      node.array.depMask = getDepMask(node.array.depBitmaps, bitPositionToRemove);
      stack.push(...node.children);
    } else if (node.type === 'if') {
      node.branches.forEach(branch => {
        branch.condition.depMask = getDepMask(branch.condition.depBitmaps, bitPositionToRemove);
        stack.push(...branch.children);
      });
    } else if (node.type === 'env') {
      for (const key in node.props) {
        node.props[key].depMask = getDepMask(node.props[key].depBitmaps, bitPositionToRemove);
      }
      stack.push(...node.children);
    } else if (node.type === 'exp') {
      node.content.depMask = getDepMask(node.content.depBitmaps, bitPositionToRemove);
    }
  }
}

function keepHighestBit(bitmap: number) {
  // 获取二进制数的长度
  const length = bitmap.toString(2).length;

  // 创建掩码
  const mask = 1 << (length - 1);

  // 使用按位与运算符只保留最高位
  return bitmap & mask;
}
