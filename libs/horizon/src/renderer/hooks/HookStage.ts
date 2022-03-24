// hooks阶段
export enum HookStage {
  Init = 1,
  Update = 2,
}

let hookStage: HookStage | null = null;

export function getHookStage() {
  return hookStage;
}

export function setHookStage(phase: HookStage | null) {
  hookStage = phase;
}
