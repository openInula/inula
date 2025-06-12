/**
 * <input> <textarea> <select> <option> 对 value 做了特殊处理
 * 处理组件被代理和不被代理情况下的不同逻辑
 */
import { HorizonDom, Props } from '../utils/Interface';
declare function getPropsWithoutValue(type: string, dom: HorizonDom, props: Props): Props;
declare function setInitValue(type: string, dom: HorizonDom, props: Props): void;
declare function updateValue(type: string, dom: HorizonDom, props: Props): void;
export { getPropsWithoutValue, setInitValue, updateValue };
