
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
  return {...executeMode};
}

export function setExecuteMode(mode: typeof executeMode) {
  executeMode = mode;
}
