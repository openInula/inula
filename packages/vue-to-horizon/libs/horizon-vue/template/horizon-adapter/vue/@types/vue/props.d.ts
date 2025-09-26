import { ReactiveRet } from '@cloudsop/horizon';
export interface Data {
    [key: string]: any;
}
interface Option {
    default?: any | (() => any);
    type?: any;
}
export interface Options {
    [key: string]: Option;
}
/**
 * 自定义 Hook，用于处理响应式属性
 * @param rawProps 原始属性对象或 null
 * @param options 可选的配置对象，用于设置默认值
 * @returns 响应式处理后的属性对象
 */
export declare function useReactiveProps(rawProps: Data | null, options?: Options): ReactiveRet<Data>;
/**
 * 初始化属性对象
 * @param rawProps 原始属性对象或 null
 * @param options 配置对象，包含默认值
 * @returns 响应式处理后的属性对象
 */
export declare function initProps(rawProps: Data | null, options: Options): ReactiveRet<Data>;
/**
 * 更新属性对象
 * @param props 待更新的属性对象
 * @param rawProps 包含新值的原始属性对象或 null
 * @param options 属性配置对象，包含默认值等信息
 */
export declare function updateProps(props: Data, rawProps: Data | null, options: Options): void;
export {};
