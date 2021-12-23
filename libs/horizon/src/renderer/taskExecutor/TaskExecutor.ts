/**
 * 调度器的核心实现
 */

import {
  requestBrowserCallback,
  isOverTime,
  now,
} from './BrowserAsync';

import {add, shift, first} from './TaskQueue';

const ImmediatePriority = 1;
const NormalPriority = 10;

// 用于控制插入任务的顺序
let idCounter = 1;

let currentPriorityLevel = NormalPriority;

// 正在执行task
let isProcessing = false;

// 调度中，等待浏览器回调
let isScheduling = false;

function runSync(callback, priorityLevel = NormalPriority) {
  const previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return callback();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

function runAsync(callback, priorityLevel= NormalPriority ) {
  let timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = -1;
      break;
    case NormalPriority:
    default:
      timeout = 5000;
      break;
  }

  const task = {
    id: idCounter++,
    callback,
    priorityLevel,
    expirationTime: now() + timeout,
  };

  add(task);

  if (!isScheduling && !isProcessing) {
    isScheduling = true;
    requestBrowserCallback(callTasks);
  }

  return task;
}

function callTasks(initialTime) {
  isScheduling = false;
  isProcessing = true;

  let task = null;
  const previousPriorityLevel = currentPriorityLevel;
  try {
    let currentTime = initialTime;
    task = first();

    // 循环执行task
    while (task !== null) {
      if (
        task.expirationTime > currentTime &&
        isOverTime()
      ) {
        // 没到deadline
        break;
      }

      const callback = task.callback;
      if (typeof callback === 'function') {
        task.callback = null;
        currentPriorityLevel = task.priorityLevel;
        const didUserCallbackTimeout = task.expirationTime <= currentTime;

        const continuationCallback = callback(didUserCallbackTimeout);
        currentTime = now();
        // 执行callback返回函数，重置callback
        if (typeof continuationCallback === 'function') {
          task.callback = continuationCallback;
        } else {
          if (task === first()) {
            shift();
          }
        }
      } else {
        shift();
      }

      task = first();
    }

    // 返回是否还有任务，如果有，说明是被中断了
    return task !== null;
  } finally {
    task = null;
    currentPriorityLevel = previousPriorityLevel;
    isProcessing = false;
  }
}

function cancelTask(task) {
  task.callback = null;
}

function getCurrentPriorityLevel() {
  return currentPriorityLevel;
}

export {
  ImmediatePriority,
  NormalPriority,
  runSync,
  runAsync,
  cancelTask,
  getCurrentPriorityLevel,
  now,
};
