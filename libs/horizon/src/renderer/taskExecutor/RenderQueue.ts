/**
 * 利用TaskExecutor的异步任务，封装一个renderQueue来执行同步的渲染callback
 */

import {runAsync, cancelTask, ImmediatePriority} from './TaskExecutor';

type RenderCallback = () => RenderCallback | null;

let renderQueue: Array<RenderCallback> | null = null;
// 保存正在等待的异步Task，可以用于取消
let callingQueueTask: any | null = null;
// 防止重入
let isCallingRenderQueue = false;

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

export function callRenderQueueImmediate() {
  if (callingQueueTask !== null) {
    // 取消异步调度
    cancelTask(callingQueueTask);
    callingQueueTask = null;
  }

  callRenderQueue();
}

// 执行render回调
function callRenderQueue() {
  if (!isCallingRenderQueue && renderQueue !== null) {
    // 防止重入
    isCallingRenderQueue = true;

    let i = 0;
    try {
      for (; i < renderQueue.length; i++) {
        let callback = renderQueue[i];
        do {
          callback = callback();
        } while (callback !== null);
      }
      renderQueue = null;
    } catch (error) {
      // 如果有异常抛出，请将剩余的回调留在队列中
      if (renderQueue !== null) {
        renderQueue = renderQueue.slice(i + 1);
      }

      // 在下一个异步中再调用
      runAsync(callRenderQueueImmediate, ImmediatePriority);

      throw error;
    } finally {
      isCallingRenderQueue = false;
    }
  }
}
