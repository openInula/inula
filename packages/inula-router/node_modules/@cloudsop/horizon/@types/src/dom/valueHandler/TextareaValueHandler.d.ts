import { Props } from '../utils/Interface';
export declare function getTextareaPropsWithoutValue(dom: HTMLTextAreaElement, properties: Object): {
    value: any;
    constructor: Function;
    toString(): string;
    toLocaleString(): string;
    valueOf(): Object;
    hasOwnProperty(v: PropertyKey): boolean;
    isPrototypeOf(v: Object): boolean;
    propertyIsEnumerable(v: PropertyKey): boolean;
};
export declare function updateTextareaValue(dom: HTMLTextAreaElement, props: Props, isInit?: boolean): void;
