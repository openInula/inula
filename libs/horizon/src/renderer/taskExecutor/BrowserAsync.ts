/**
 * 浏览器相关实现
 */

export let now;

if (typeof performance === 'object' && typeof performance.now === 'function') {
  const localPerformance = performance;
  now = () => localPerformance.now();
} else {
  const localDate = Date;
  const initialTime = localDate.now();
  now = () => localDate.now() - initialTime;
}

let isMessageLoopRunning = false;
let browserCallback = null;

// 默认每次只运行5ms
const runTime = 5;
let deadline = 0;

export function isOverTime() {
  return now() >= deadline;
}

// 1、设置deadline；2、回调TaskExecutor传过来的browserCallback
const callRenderTasks = () => {
  if (browserCallback == null) {
    return;
  }

  const currentTime = now();
  // 计算deadline
  deadline = currentTime + runTime;
  try {
    // 执行callback
    const hasMoreTask = browserCallback(
      currentTime,
    );

    if (!hasMoreTask) { // 没有更多task
      isMessageLoopRunning = false;
      browserCallback = null;
    } else {
      // 还有task，继续调用
      port.postMessage(null);
    }
  } catch (error) {
    port.postMessage(null);
    throw error;
  }
};

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = callRenderTasks;

export function requestBrowserCallback(callback) {
  browserCallback = callback;

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}
