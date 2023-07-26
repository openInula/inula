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

/**
 * 任务列表的实现
 */

type Queue = Array<Node>;
export type Node = {
  id: number;
  order: number;
};

// 任务队列
const taskQueue: Queue = [];

function compare(a: Node, b: Node) {
  // 优先先用index排序，其次用id
  const diff = a.order - b.order;
  return diff !== 0 ? diff : a.id - b.id;
}

// 二分法查找第一个大于等于 value 的下标，都比 value 小则返回 -1，时间复杂度O(logn)
function getBiggerIdx(node: Node) {
  let left = 0;
  let right = taskQueue.length - 1;

  while (left <= right) {
    const middle = left + ((right - left) >> 1);

    if (compare(taskQueue[middle], node) > 0) {
      right = middle - 1;
    } else {
      left = middle + 1;
    }
  }

  return left < taskQueue.length ? left : -1;
}

export function add(node: Node): void {
  // 查找第一个大于等于 value 的下标，都比 value 小则返回 -1
  const idx = getBiggerIdx(node);

  if (idx === -1) {
    taskQueue.push(node);
  } else {
    taskQueue.splice(idx, 0, node);
  }
}

export function first(): Node | null {
  const val: Node | null | undefined = taskQueue[0];
  return val ?? null;
}

export function shift(): Node | null {
  const val = taskQueue.shift();
  return val ?? null;
}

export function remove(node: Node) {
  taskQueue.splice(taskQueue.indexOf(node), 1);
}
