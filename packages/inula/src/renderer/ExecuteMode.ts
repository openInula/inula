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

export const ByAsync = 'BY_ASYNC';
export const BySync = 'BY_SYNC';
export const InRender = 'IN_RENDER';
export const InEvent = 'IN_EVENT';

type RenderMode = typeof ByAsync | typeof BySync | typeof InRender | typeof InEvent;

// 当前执行模式标记
let executeMode = {
  [ByAsync]: false,
  [BySync]: false,
  [InRender]: false,
  [InEvent]: false,
};

export function changeMode(mode: RenderMode, state = true) {
  executeMode[mode] = state;
}

export function checkMode(mode: RenderMode) {
  return executeMode[mode];
}

export function isExecuting() {
  return executeMode[ByAsync] || executeMode[BySync] || executeMode[InRender] || executeMode[InEvent];
}

export function copyExecuteMode() {
  return { ...executeMode };
}

export function setExecuteMode(mode: typeof executeMode) {
  executeMode = mode;
}
