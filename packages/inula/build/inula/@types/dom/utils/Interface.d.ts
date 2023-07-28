export interface Props {
    [propName: string]: any;
}
export interface InulaSelect extends HTMLSelectElement {
    _multiple?: boolean;
}
export declare type InulaDom = Element | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
