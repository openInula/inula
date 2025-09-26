declare const ImmediatePriority = 1;
declare const NormalPriority = 10;
declare function runAsync(callback: any, priorityLevel?: number): {
    id: number;
    callback: any;
    order: any;
};
declare function cancelTask(task: any): void;
export { ImmediatePriority, NormalPriority, runAsync, cancelTask };
