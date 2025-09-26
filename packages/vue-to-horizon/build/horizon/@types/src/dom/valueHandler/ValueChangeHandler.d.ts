/**
 * value值发生变化时，执行value的getter、setter。
 * 事件触发时，判断currentVal 和 input 的真实值是否一致，从而判断是否实际变更，
 * 只有发生变更了，事件处理才会生成一个change事件
 */
export declare function watchValueChange(dom: any): void;
export declare function updateInputHandlerIfChanged(dom: any): boolean;
