/**
 * 对一些没有写单位的样式进行适配，例如：width: 10 => width: 10px
 * 对空值或布尔值进行适配，转为空字符串
 * 去掉多余空字符
 */
export declare function adjustStyleValue(name: any, value: any): any;
/**
 * 设置 DOM 节点的 style 属性
 */
export declare function setStyles(dom: any, styles: any): void;
