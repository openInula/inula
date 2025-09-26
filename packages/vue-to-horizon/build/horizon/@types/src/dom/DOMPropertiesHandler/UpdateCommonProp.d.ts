/**
 * 给 dom 设置属性
 * attrName 指代码中属性设置的属性名称（如 class）
 * 多数情况 attrName 仅用作初始 DOM 节点对象使用，而 property 更多用于页面交互
 */
export declare function updateCommonProp(dom: Element, attrName: string, value: any, isNativeTag: boolean): void;
