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

/**
 * 浏览器相关实现
 */

let isMessageLoopRunning = false;
let browserCallback = null;
const { port1, port2 } = new MessageChannel();


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


port1.onmessage = callRenderTasks;

export function requestBrowserCallback(callback) {
  browserCallback = callback;

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port2.postMessage(null);
  }
}
