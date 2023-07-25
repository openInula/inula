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
 * 利用TaskExecutor的异步任务，封装一个renderQueue来执行同步的渲染callback
 */

import { runAsync, cancelTask, ImmediatePriority } from './TaskExecutor';

type RenderCallback = () => RenderCallback | null;

let renderQueue: Array<RenderCallback> | null = null;
// 保存正在等待的异步Task，可以用于取消
let callingQueueTask: any | null = null;
// 防止重入
let isCallingRenderQueue = false;

// 执行render回调
function callRenderQueue() {
  if (!isCallingRenderQueue && renderQueue !== null) {
    // 防止重入
    isCallingRenderQueue = true;

    try {
      let callback;
      while (callback = renderQueue.shift()) {
        callback();
      }

      renderQueue = null;
    } catch (error) {
      throw error;
    } finally {
      isCallingRenderQueue = false;
    }
  }
}

export function callRenderQueueImmediate() {
  if (callingQueueTask !== null) {
    // 取消异步调度
    cancelTask(callingQueueTask);
    callingQueueTask = null;
  }

  callRenderQueue();
}

export function pushRenderCallback(callback: RenderCallback) {
  if (renderQueue === null) {
    renderQueue = [callback];
    // 高优先级的异步调度
    callingQueueTask = runAsync(callRenderQueue, ImmediatePriority);
  } else {
    // 不需要调度，在syncQueue创建的时候已经调度了
    renderQueue.push(callback);
  }

  // 返回一个空对象，用于区别null
  return {};
}
