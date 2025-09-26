declare type RenderCallback = () => RenderCallback | null;
export declare function callRenderQueueImmediate(): void;
export declare function pushRenderCallback(callback: RenderCallback): {};
export {};
