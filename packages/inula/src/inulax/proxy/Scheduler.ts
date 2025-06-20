/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { LowPriority, runAsync } from '../../renderer/taskExecutor/TaskExecutor';

const resolvedPromise = /*#__PURE__*/ Promise.resolve() as Promise<any>;
let currentFlushPromise: Promise<void> | null = null;

type SchedulerJob = () => void;

let isFlushing = false;
let isPending = false;
let jobQueue: SchedulerJob[] = [];
let flushIndex = 0;

export function flushJobs() {
  isPending = false;
  isFlushing = true;

  try {
    for (flushIndex = 0; flushIndex < jobQueue.length; flushIndex++) {
      const job = jobQueue[flushIndex];
      job();
    }
  } finally {
    isFlushing = false;
    flushIndex = 0;
    jobQueue = [];
    jobQueue.length = 0;
    currentFlushPromise = null;
  }
}

function queueFlush() {
  if (!isFlushing && !isPending) {
    isPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}

export function queueJob(job) {
  if (!jobQueue.length || !jobQueue.includes(job, isFlushing ? flushIndex + 1 : flushIndex)) {
    jobQueue.push(job);
    queueFlush();
  }
}

/**
 * 即依赖flushPromise，也要依赖Inula渲染机制中的异步机制runAsync，才能做到等待DOM渲染
 * @param this - 执行上下文
 * @param fn - 可选的回调函数
 * @returns Promise - 返回一个 Promise，当回调函行完成时 resolve
 */
export function nextTick<T = void, R = void>(this: T, fn?: (this: T) => R): Promise<R> {
  const flushPromise = currentFlushPromise || resolvedPromise;

  return new Promise(resolve => {
    flushPromise.then(() => {
      runAsync(() => {
        if (fn) {
          const result = fn.call(this);
          resolve(result);
        } else {
          resolve(undefined as R);
        }
      }, LowPriority);
    });
  });
}
