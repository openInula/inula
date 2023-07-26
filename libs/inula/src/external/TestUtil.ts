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


import {asyncUpdates} from '../renderer/TreeBuilder';
import {callRenderQueueImmediate} from '../renderer/taskExecutor/RenderQueue';
import {hasAsyncEffects, runAsyncEffects} from '../renderer/submit/HookEffectHandler';
import {isPromise} from '../renderer/ErrorHandler';

interface Thenable {
  then(resolve: (val?: any) => void, reject: (err: any) => void): void;
}

// 防止死循环
const LOOPING_LIMIT = 50;
let loopingCount = 0;
function callRenderQueue() {
  callRenderQueueImmediate();

  while (hasAsyncEffects() && loopingCount < LOOPING_LIMIT) {
    loopingCount++;
    runAsyncEffects();
    // effects可能产生刷新任务，这里再执行一次
    callRenderQueueImmediate();
  }
}

// act用于测试，作用是：如果fun触发了刷新（包含了异步刷新），可以保证在act后面的代码是在刷新完成后才执行。
function act(fun: () => void | Thenable): Thenable {
  const funRet = asyncUpdates(fun);

  callRenderQueue();

  // 如果fun返回的是Promise
  if (isPromise(funRet)) {
    // testing-library会返回Promise
    return {
      then(resolve, reject) {
        funRet.then(
          () => {
            if (typeof setImmediate === 'function') {
              // 通过setImmediate回调，用于等待业务的setTimeout完成
              setImmediate(() => {
                callRenderQueue();
                resolve();
              });
            } else {
              callRenderQueue();
              resolve();
            }
          },
          err => {
            reject(err);
          },
        );
      },
    };
  } else {
    return {
      then(resolve) {
        resolve();
      },
    };
  }
}

export {
  act
};
