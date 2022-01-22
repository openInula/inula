/**
 * 浏览器相关实现
 */

let isMessageLoopRunning = false;
let browserCallback = null;


export function isOverTime() {
  return false;
}

// 1、设置deadline；2、回调TaskExecutor传过来的browserCallback
const callRenderTasks = () => {
  if (browserCallback === null) {
    return;
  }

  try {
    // 执行callback
    const hasMoreTask = browserCallback();

    if (!hasMoreTask) { // 没有更多task
      isMessageLoopRunning = false;
      browserCallback = null;
    } else {
      // 还有task，继续调用
      port2.postMessage(null);
    }
  } catch (error) {
    port2.postMessage(null);
    throw error;
  }
};

const { port1, port2 } = new MessageChannel();
port1.onmessage = callRenderTasks;

export function requestBrowserCallback(callback) {
  browserCallback = callback;

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port2.postMessage(null);
  }
}
