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

import { Bitmap, ComponentNode } from './types';
import { ViewParticle } from '@openinula/reactivity-parser';

/**
 * To prune the bitmap of unused properties
 * etc.:
 * ```js
 * let a = 1; // 0b001
 * let b = 2; // 0b010 b is not used*, and should be pruned
 * let c = 3; // 0b100 -> 0b010(cause bit of b is pruned)
 * ```
 * @param root
 * @param index
 */
export function pruneComponentUnusedBit(comp: ComponentNode<'comp'> | ComponentNode<'subComp'>, index = 1) {
  // dfs the component tree
  // To store the bitmap of the properties
  const bitMap = new Map<string, number>();
  const bitPositionToRemove: number[] = [];
  comp.variables.forEach(v => {
    if (v.type === 'reactive') {
      // get the origin bit, computed should keep the highest bit, etc. 0b0111 -> 0b0100
      const originBit = keepHighestBit(v.depMask);
      if ((comp.usedBit & originBit) !== 0) {
        v.bit = 1 << index;
        bitMap.set(v.name, v.bit);
        if (v.isComputed) {
          v.depMask = pruneBitmap(v.depMask, bitPositionToRemove);
        }
      } else {
        bitPositionToRemove.push(index);
      }
      index++;
    } else if (v.type === 'subComp') {
      pruneComponentUnusedBit(v, index);
    }
  });

  comp.watch?.forEach(watch => {
    if (!watch.depMask) {
      return;
    }
    watch.depMask = pruneBitmap(watch.depMask, bitPositionToRemove);
  });

  // handle children
  if (comp.children) {
    comp.children.forEach(child => {
      if (child.type === 'comp') {
        pruneComponentUnusedBit(child as ComponentNode<'comp'>, index);
      } else {
        pruneViewParticleUnusedBit(child as ViewParticle, bitPositionToRemove);
      }
    });
  }
}

function pruneBitmap(depMask: Bitmap, bitPositionToRemove: number[]) {
  // turn the bitmap to binary string
  const binary = depMask.toString(2);
  // remove the bit
  binary
    .split('')
    .reverse()
    .filter((bit, index) => {
      return !bitPositionToRemove.includes(index);
    })
    .reverse()
    .join('');

  return parseInt(binary, 2);
}

function pruneViewParticleUnusedBit(particle: ViewParticle, bitPositionToRemove: number[]) {
  // dfs the view particle to prune the bitmap
  const stack: ViewParticle[] = [particle];
  while (stack.length) {
    const node = stack.pop()! as ViewParticle;
    if (node.type === 'template') {
      node.props.forEach(prop => {
        prop.depMask = pruneBitmap(prop.depMask, bitPositionToRemove);
      });
      stack.push(node.template);
    } else if (node.type === 'html') {
      for (const key in node.props) {
        node.props[key].depMask = pruneBitmap(node.props[key].depMask, bitPositionToRemove);
      }
      stack.push(...node.children);
    } else if (node.type === 'text') {
      node.content.depMask = pruneBitmap(node.content.depMask, bitPositionToRemove);
    } else if (node.type === 'for') {
      node.array.depMask = pruneBitmap(node.array.depMask, bitPositionToRemove);
      stack.push(...node.children);
    } else if (node.type === 'if') {
      node.branches.forEach(branch => {
        branch.condition.depMask = pruneBitmap(branch.condition.depMask, bitPositionToRemove);
        stack.push(...branch.children);
      });
    } else if (node.type === 'env') {
      for (const key in node.props) {
        node.props[key].depMask = pruneBitmap(node.props[key].depMask, bitPositionToRemove);
      }
      stack.push(...node.children);
    } else if (node.type === 'exp') {
      node.content.depMask = pruneBitmap(node.content.depMask, bitPositionToRemove);
      for (const key in node.props) {
        node.props[key].depMask = pruneBitmap(node.props[key].depMask, bitPositionToRemove);
      }
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

function removeBit(bitmap: number, bitPosition: number) {
  // 创建掩码,将目标位右边的位设置为 1,其他位设置为 0
  const rightMask = (1 << (bitPosition - 1)) - 1;

  // 创建掩码,将目标位左边的位设置为 1,其他位设置为 0
  const leftMask = ~rightMask << 1;

  // 提取右部分
  const rightPart = bitmap & rightMask;

  // 提取左部分并右移一位
  const leftPart = (bitmap & leftMask) >> 1;

  // 组合左部分和右部分
  return leftPart | rightPart;
}
