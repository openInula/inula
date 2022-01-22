/**
 * 任务列表的实现
 */

type Queue = Array<Node>;
type Node = {
  id: number;
  order: number;
};

// 任务队列
const taskQueue: Queue = [];

export function add(node: Node): void {
  // 查找第一个大于等于 value 的下标，都比 value 小则返回 -1
  const idx = getBiggerIdx(node);

  if (idx === -1) {
    taskQueue.push(node);
  } else {
    taskQueue.splice(idx, 0, node);
  }
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

  return (left < taskQueue.length) ? left : -1;
}

export function first(): Node | null {
  const val = taskQueue[0];
  return val !== undefined ? val : null;
}

export function shift(): Node | null {
  const val = taskQueue.shift();
  return val !== undefined ? val : null;
}

export function remove(node: Node) {
  taskQueue.splice(taskQueue.indexOf(node), 1);
}

function compare(a: Node, b: Node) {
  // 优先先用index排序，其次用id
  const diff = a.order - b.order;
  return diff !== 0 ? diff : a.id - b.id;
}
