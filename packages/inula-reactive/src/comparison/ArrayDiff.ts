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

export enum Operation {
  // 数组长度不同
  Nop = 0,
  Insert = 1,
  Delete = 2,
}

export interface Diff {
  action: Operation;
  index: number;
}

export interface DiffOperator {
  isOnlyNop: boolean;
  opts: Diff[];
}

function longestCommonPrefix<T>(arr1: T[], arr2: T[]): number {
  if (!arr1.length || !arr2.length || arr1[0] !== arr1[0]) {
    return 0;
  }

  let low = 0;
  let start = 0;
  // 最短数组的长度
  let high = Math.min(arr1.length, arr2.length);
  while (low <= high) {
    const mid = (high + low) >> 1;
    if (isArrayEqual(arr1, arr2, start, mid)) {
      low = mid + 1;
      start = mid;
    } else {
      high = mid - 1;
    }
  }
  return low - 1;
}

function isArrayEqual<T>(str1: T[], str2: T[], start: number, end: number): boolean {
  for (let j = start; j < end; j++) {
    if (str1[j] !== str2[j]) {
      return false;
    }
  }
  return true;
}

/**
 * @param origin 原始数组
 * @param target 目标数组
 * @returns 返回一个 Diff 数组，表示从原始数组转换为目标数组需要进行的操作
 */
export function diffArray<T>(origin: T[], target: T[]): DiffOperator {
  // 使用二分查找计算共同前缀与后缀
  const prefixLen = longestCommonPrefix(origin, target);
  const suffixLen = longestCommonPrefix([...origin].reverse(), [...target].reverse());
  // 删除原数组与目标数组的共同前缀与后缀
  const optimizedOrigin = origin.slice(prefixLen, origin.length - suffixLen);
  const optimizedTarget = target.slice(prefixLen, target.length - suffixLen);

  const originLen = optimizedOrigin.length;
  const targetLen = optimizedTarget.length;

  const dp: number[][] = Array.from(Array(originLen + 1), () => {
    return Array(targetLen + 1).fill(0);
  });
  const pathMatrix: Operation[][] = Array.from(Array(originLen + 1), () => {
    return Array(targetLen + 1).fill('');
  });

  let diffs: Diff[] = [];

  // 计算最长公共子序列
  for (let i = 1; i < originLen + 1; i++) {
    for (let j = 1; j < targetLen + 1; j++) {
      if (optimizedOrigin[i - 1] === optimizedTarget[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        // 如果相等，则表示不需要进行任何操作
        pathMatrix[i][j] = Operation.Nop;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        dp[i][j] = dp[i - 1][j];
        // 如果不相等，则需要进行删除操作
        pathMatrix[i][j] = Operation.Delete;
      } else {
        dp[i][j] = dp[i][j - 1];
        // 如果不相等，则需要进行插入操作
        pathMatrix[i][j] = Operation.Insert;
      }
    }
  }

  let hasDelete = false;
  let hasInsert = false;

  // 计算操作序列
  function diff(oLen: number, tLen: number) {
    const stack: Record<string, number>[] = [{ i: oLen, j: tLen }];

    while (stack.length > 0) {
      const obj = stack.pop();
      const { i, j } = obj!;
      if (i === 0 || j === 0) {
        if (i !== 0) {
          diffs.unshift(
            ...optimizedOrigin.slice(0, i).map((item, idx) => ({
              action: Operation.Delete,
              index: idx,
            }))
          );
          hasDelete = true;
        }
        if (j !== 0) {
          diffs.unshift(
            ...optimizedTarget.slice(0, j).map((item, idx) => ({
              action: Operation.Insert,
              index: idx,
            }))
          );
          hasInsert = true;
        }
      }

      if (pathMatrix[i][j] === Operation.Nop) {
        stack.push({ i: i - 1, j: j - 1 });
        // 如果不需要进行任何操作，则表示是公共元素，将其添加到 diffs 中
        diffs.unshift({ action: Operation.Nop, index: i - 1 });
      } else if (pathMatrix[i][j] === Operation.Delete) {
        stack.push({ i: i - 1, j });
        // 如果需要进行删除操作，则将其添加到 diffs 中
        diffs.unshift({ action: Operation.Delete, index: i - 1 });
        hasDelete = true;
      } else if (pathMatrix[i][j] === Operation.Insert) {
        stack.push({ i, j: j - 1 });
        // 如果需要进行插入操作，则将其添加到 diffs 中
        diffs.unshift({ action: Operation.Insert, index: j - 1 });
        hasInsert = true;
      }
    }
  }

  // 计算操作序列
  diff(originLen, targetLen);

  diffs.map(i => (i.index += prefixLen));

  const prefixOpts = Array.from(Array(prefixLen), (_, index) => index).map(idx => ({
    action: Operation.Nop,
    index: idx,
  }));

  const suffixOpts = Array.from(Array(suffixLen), (_, index) => index).map(idx => ({
    action: Operation.Nop,
    index: origin.length - suffixLen + idx,
  }));

  diffs = prefixOpts.concat(diffs, suffixOpts);

  return {
    isOnlyNop: !hasDelete && !hasInsert,
    opts: diffs,
  };
}
