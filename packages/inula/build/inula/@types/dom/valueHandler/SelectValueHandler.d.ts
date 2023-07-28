import { InulaSelect, Props } from '../utils/Interface';
export declare function getSelectPropsWithoutValue(dom: InulaSelect, properties: Object): {
    value: any;
    constructor: Function;
    toString(): string;
    toLocaleString(): string;
    valueOf(): Object;
    hasOwnProperty(v: PropertyKey): boolean;
    isPrototypeOf(v: Object): boolean;
    propertyIsEnumerable(v: PropertyKey): boolean;
};
export declare function updateSelectValue(dom: InulaSelect, props: Props, isInit?: boolean): void;
