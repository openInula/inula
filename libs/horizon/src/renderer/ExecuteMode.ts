
export const ByAsync = 'BY_ASYNC';
export const BySync = 'BY_SYNC';
export const InRender = 'IN_RENDER';

type RenderMode = typeof ByAsync | typeof BySync | typeof InRender;

// 当前执行阶段标记
let executeMode = {
  [ByAsync]: false,
  [BySync]: false,
  [InRender]: false,
};

export function changeMode(mode: RenderMode, state = true) {
  executeMode[mode] = state;
}

export function checkMode(mode: RenderMode) {
  return executeMode[mode];
}

export function isExecuting() {
  return executeMode[ByAsync] || executeMode[BySync] || executeMode[InRender];
}

export function copyExecuteMode() {
  return {...executeMode};
}

export function setExecuteMode(mode: typeof executeMode) {
  executeMode = mode;
}
