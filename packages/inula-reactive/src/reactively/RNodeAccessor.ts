/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import { RNode } from './RNode';
import { isFunction } from '../reactive/Utils';
import { isObject } from './Utils';
import { isArray } from '../inulax/CommonUtils';
import { arrayDiff, DiffOperator, Operation } from '../reactive/DiffUtils';
import { ArrayState } from '../reactive/types';
import { getOrCreateChildRNode } from './RNodeCreator';

export function getRNodeVal(node: RNode<any>): any {
  let currentNode = node;
  const keys: (string | symbol)[] = [];
  while (currentNode.key !== null && currentNode.parent !== null) {
    keys.push(currentNode.key);
    currentNode = currentNode.parent;
  }

  let rawObj = node.root?.$;
  for (let i = keys.length - 1; i >= 0; i--) {
    if (keys[i] !== undefined && rawObj) {
      rawObj = rawObj[keys[i]];
    }
  }

  return rawObj;
}

export function setRNodeVal(rNode: RNode<any>, value: unknown): void {
  const parent = rNode.parent;
  const key = rNode.key!;
  const isRoot = parent === null;
  let prevValue: unknown;
  let newValue: unknown;

  if (isRoot) {
    prevValue = rNode.root!.$;
    newValue = isFunction<(...prev: any) => any>(value) ? value(prevValue) : value;
    rNode.root!.$ = newValue;
  } else {
    const parentVal = getRNodeVal(parent!);
    prevValue = parentVal[key];
    newValue = isFunction<(...prev: any) => any>(value) ? value(prevValue) : value;
    parentVal[key] = newValue;
  }
}

// 递归触发依赖这reactive数据的所有RContext
export function preciseCompare(rNode: RNode<any>, value: any, prevValue: any, isFromArrModify?: boolean) {
  preciseCompareChildren(rNode, value, prevValue, isFromArrModify);

  // 触发父数据的RContext，不希望触发组件刷新（只触发computed和watch）
  // TODO 暂时删除
  // triggerParents(reactive.parent);
}

// 当value和prevValue都是对象或数组时，才触发
function preciseCompareChildren(rNode: RNode, value: any, prevValue: any, isFromArrModify?: boolean): boolean {
  // 可以精准更新
  let canPreciseUpdate = true;

  const isArr = isArray(value);
  const isPrevArr = isArray(prevValue);

  // 1、变化来自数组的Modify方法（某些行可能完全不变）
  if (isFromArrModify) {
    // // 获取数组间差异，RNode只能增删不能修改，修改会导致Effect不会随数据的位置变化
    // const diffOperator = arrayDiff(prevValue, value);
    // const states: ArrayState[] = [];
    //
    // let childIndex = 0;
    //
    // for (const opt of diffOperator.opts) {
    //   const idx = String(opt.index);
    //   switch (opt.action) {
    //     // 从已有RNode中取值
    //     case Operation.Nop: {
    //       const childRNode = rNode.children?.get(idx);
    //
    //       // children没有使用时，可以为undefined或没有该child
    //       if (childRNode !== undefined) {
    //         childRNode.key = String(childIndex);
    //         states.push(ArrayState.Fresh);
    //         childIndex++;
    //
    //         // 删除旧的，重设新值。处理场景：元素还在，但是在数组中的位置变化了。
    //         rNode.children?.delete(String(opt.index));
    //         rNode.children?.set(childRNode.key, childRNode);
    //       }
    //       break;
    //     }
    //     // 从Value中新建RNode
    //     case Operation.Insert: {
    //       getOrCreateChildRNode(rNode, idx);
    //       states.push(ArrayState.NotFresh);
    //       childIndex++;
    //       break;
    //     }
    //     case Operation.Delete: {
    //       rNode.children?.delete(idx);
    //       break;
    //     }
    //   }
    // }
    //
    // rNode.diffOperator = diffOperator;
    // if (!rNode.diffOperators) {
    //   rNode.diffOperators = [];
    // }
    // rNode.diffOperators.push(diffOperator);
    // // 记录：新数据，哪些需要处理，哪些不需要
    // rNode.states = states;
    // // 数组长度不同，确定会产生变化，调用callDependents一次
    // callRContexts(rNode);
    //
    // return canPreciseUpdate;
  }

  // 2、都是数组
  if (isArr && isPrevArr) {
    const minLen = Math.min(value.length, prevValue.length);

    // 遍历数组或对象，触发子数据的Effects
    const canPreciseUpdates = updateSameLengthArray(rNode, value, prevValue, minLen);

    const maxLen = Math.max(value.length, prevValue.length);
    if (maxLen !== minLen || canPreciseUpdates.includes(false)) {
      canPreciseUpdate = false;
    }

    // 在reactive中保存opts
    const diffOperator: DiffOperator = {
      isOnlyNop: false,
      opts: [],
    };
    const states: ArrayState[] = [];

    // 相同长度的部分
    for (let i = 0; i < minLen; i++) {
      diffOperator.opts.push({ action: Operation.Nop, index: i });
      // 如果该行数据无法精准更新，设置为NotFresh
      states.push(canPreciseUpdates[i] ? ArrayState.Fresh : ArrayState.NotFresh);
    }

    // 超出部分：新增
    if (value.length > prevValue.length) {
      for (let i = minLen; i < maxLen; i++) {
        diffOperator.opts.push({ action: Operation.Insert, index: i });
        states.push(ArrayState.NotFresh);
        getOrCreateChildRNode(rNode, String(i));
      }
    } else if (value.length < prevValue.length) {
      // 减少部分：删除
      for (let i = minLen; i < maxLen; i++) {
        diffOperator.opts.push({ action: Operation.Delete, index: i });
        states.push(ArrayState.NotFresh);
      }
    }

    diffOperator.isOnlyNop = !states.includes(ArrayState.NotFresh);
    rNode.diffOperator = diffOperator;
    rNode.states = states;

    return canPreciseUpdate;
  }

  // 都是对象
  if (!isArr && !isPrevArr) {
    const keys = Object.keys(value);
    const prevKeys = Object.keys(prevValue);

    // 合并keys和prevKeys
    const keySet = new Set(keys.concat(prevKeys));

    keySet.forEach(key => {
      const val = value[key];
      const prevVal = prevValue[key];
      const isChanged = val !== prevVal;

      // 如果数据有变化，就触发Effects
      if (isChanged) {
        const childRNode = rNode.children?.get(key);

        const isObj = isObject(val);
        const isPrevObj = isObject(prevVal);
        // val和prevVal都是对象或数组
        if (isObj) {
          // 1、如果上一个属性无法精准更新，就不再递归下一个属性了
          // 2、如果childRNode为空，说明这个数据未被引用过，也不需要调用RContexts
          if (canPreciseUpdate && childRNode !== undefined) {
            canPreciseUpdate = preciseCompareChildren(childRNode as RNode, val, prevVal);
          }
        } else if (!isObj && !isPrevObj) {
          // val和prevVal都不是对象或数组
          canPreciseUpdate = true;
        } else {
          // 类型不同（一个是对象或数组，另外一个不是）
          canPreciseUpdate = false;
        }

        // 有childRNode，说明这个数据被使引用过
        if (childRNode) {
          childRNode.setDirty();
        }
      }
    });

    return canPreciseUpdate;
  }

  // 一个是对象，一个是数组
  canPreciseUpdate = false;

  return canPreciseUpdate;
}

// 对于数组的变更，尽量尝试精准更新，会记录每行数据是否能够精准更新
function updateSameLengthArray(rNode: RNode, value: any, prevValue: any, len: number): boolean[] {
  const canPreciseUpdates: boolean[] = [];

  // 遍历数组或对象，触发子数据的RContexts
  for (let i = 0; i < len; i++) {
    const val = value[i];
    const prevVal = prevValue[i];
    const isChanged = val !== prevVal;

    // 如果数据有变化，就触发RContexts
    if (isChanged) {
      const childRNode = rNode.children?.get(String(i));

      const isObj = isObject(val);
      const isPrevObj = isObject(prevVal);
      // val和prevVal都是对象或数组时
      if (isObj && isPrevObj) {
        // 如果childRNode为空，说明这个数据未被引用过，也不需要调用RContexts
        if (childRNode !== undefined) {
          canPreciseUpdates[i] = preciseCompareChildren(childRNode, val, prevVal);
        }
      } else if (!isObj && !isPrevObj) {
        // val和prevVal都不是对象或数组
        canPreciseUpdates[i] = true;
      } else {
        // 类型不同（一个是对象或数组，另外一个不是）
        canPreciseUpdates[i] = false;
      }

      // 有childRNode，说明这个数据被使引用过
      if (childRNode) {
        childRNode.setDirty();
      }
    } else {
      canPreciseUpdates[i] = true;
    }
  }

  return canPreciseUpdates;
}
