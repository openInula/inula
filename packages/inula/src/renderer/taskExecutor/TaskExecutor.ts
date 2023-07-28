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
 * 调度器的核心实现
 */

import { Node } from '../taskExecutor/TaskQueue';
import { requestBrowserCallback, isOverTime } from './BrowserAsync';

import { add, shift, first, remove } from './TaskQueue';

const ImmediatePriority = 1;
const NormalPriority = 10;

// 用于控制插入任务的顺序
let idCounter = 1;

// 正在执行task
let isProcessing = false;

// 调度中，等待浏览器回调
let isWaiting = false;

function callTasks() {
  isWaiting = false;
  isProcessing = true;

  let task: Node | null = null;
  try {
    task = first();

    // 循环执行task
    while (task !== null) {
      if (isOverTime()) {
        // 超过了deadline
        break;
      }

      const callback = task.callback;
      if (callback !== null) {
        task.callback = null;

        callback();

        if (task === first()) {
          shift();
        } else {
          // 执行任务中可能插入了新任务
          remove(task);
        }
      } else {
        shift();
      }

      task = first();
    }

    // 返回是否还有任务，如果有，说明是被中断了
    return task !== null;
  } finally {
    isProcessing = false;
  }
}

function runAsync(callback, priorityLevel = NormalPriority) {
  let increment;
  switch (priorityLevel) {
    case ImmediatePriority:
      increment = -1;
      break;
    case NormalPriority:
    default:
      increment = 10000;
      break;
  }

  const task = {
    id: idCounter++,
    callback,
    order: idCounter + increment,
  };

  add(task);

  if (!isWaiting && !isProcessing) {
    isWaiting = true;
    requestBrowserCallback(callTasks);
  }

  return task;
}

function cancelTask(task) {
  task.callback = null;
}

export { ImmediatePriority, NormalPriority, runAsync, cancelTask };
