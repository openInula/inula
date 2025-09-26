import { Source } from '../renderer/Types';
export declare function registerComponent(name: string, component: Function): void;
export declare function isComponentRegistered(name: string): boolean;
/**
 * vtype 节点的类型，这里固定是element
 * type 保存dom节点的名称或者组件的函数地址
 * key key属性
 * ref ref属性
 * props 其他常规属性
 */
export declare function JSXElement(type: any, key: any, ref: any, vNode: any, props: any, source: Source | null): {
    vtype: number;
    src: any;
    type: any;
    key: any;
    ref: any;
    props: any;
    belongClassVNode: any;
};
export declare function createElement(type: any, setting: any, ...children: any[]): any;
export declare function cloneElement(element: any, setting: any, ...children: any[]): any;
export declare function isValidElement(element: any): boolean;
export declare function jsx(type: any, setting: any, key: any): any;
