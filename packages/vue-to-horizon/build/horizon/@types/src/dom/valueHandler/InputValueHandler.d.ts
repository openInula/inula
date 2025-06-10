import { Props } from '../utils/Interface';
export declare function getInputPropsWithoutValue(dom: HTMLInputElement, props: Props): {
    value: any;
    defaultValue: any;
    defaultChecked: any;
    checked: any;
};
export declare function updateInputValue(dom: HTMLInputElement, props: Props): void;
export declare function setInitInputValue(dom: HTMLInputElement, props: Props): void;
