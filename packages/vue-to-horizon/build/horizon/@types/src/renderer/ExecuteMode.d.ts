export declare const ByAsync = "BY_ASYNC";
export declare const BySync = "BY_SYNC";
export declare const InRender = "IN_RENDER";
export declare const InEvent = "IN_EVENT";
declare type RenderMode = typeof ByAsync | typeof BySync | typeof InRender | typeof InEvent;
declare let executeMode: {
    BY_ASYNC: boolean;
    BY_SYNC: boolean;
    IN_RENDER: boolean;
    IN_EVENT: boolean;
};
export declare function changeMode(mode: RenderMode, state?: boolean): void;
export declare function checkMode(mode: RenderMode): boolean;
export declare function isExecuting(): boolean;
export declare function copyExecuteMode(): {
    BY_ASYNC: boolean;
    BY_SYNC: boolean;
    IN_RENDER: boolean;
    IN_EVENT: boolean;
};
export declare function setExecuteMode(mode: typeof executeMode): void;
export {};
