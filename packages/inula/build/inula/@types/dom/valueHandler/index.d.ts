/**
 * <input> <textarea> <select> <option> 对 value 做了特殊处理
 * 处理组件被代理和不被代理情况下的不同逻辑
 */
import { InulaDom, Props } from '../utils/Interface';
declare function getPropsWithoutValue(type: string, dom: InulaDom, props: Props): Props;
declare function setInitValue(type: string, dom: InulaDom, props: Props): void;
declare function updateValue(type: string, dom: InulaDom, props: Props): void;
export { getPropsWithoutValue, setInitValue, updateValue };
