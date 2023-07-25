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
 * 浏览器相关实现
 */

let isMessageLoopRunning = false;
let browserCallback = null;
let port1 = null;
let port2 = null;
let isTestRuntime = false;

export function isOverTime() {
  return false;
}

function asyncCall() {
  if (isTestRuntime) {
    setTimeout(callRenderTasks, 0);
  } else {
    port2.postMessage(null);
  }
}

// 1、设置deadline；2、回调TaskExecutor传过来的browserCallback
const callRenderTasks = () => {
  if (browserCallback === null) {
    return;
  }

  try {
    // 执行callback
    const hasMoreTask = browserCallback();

    if (!hasMoreTask) {
      // 没有更多task
      isMessageLoopRunning = false;
      browserCallback = null;
    } else {
      // 还有task，继续调用
      asyncCall();
    }
  } catch (error) {
    asyncCall();
    throw error;
  }
};

if (typeof MessageChannel === 'function') {
  const mc = new MessageChannel();
  port1 = mc.port1;
  port1.onmessage = callRenderTasks;
  port2 = mc.port2;
} else {
  // 测试环境没有 MessageChannel
  isTestRuntime = true;
}

export function requestBrowserCallback(callback) {
  browserCallback = callback;

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    asyncCall();
  }
}

