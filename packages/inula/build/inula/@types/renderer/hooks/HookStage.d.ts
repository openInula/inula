export declare enum HookStage {
    Init = 1,
    Update = 2
}
export declare function getHookStage(): HookStage;
export declare function setHookStage(phase: HookStage | null): void;
