import { ChildrenType } from '@cloudsop/horizon';
type StringRegexList = String | RegExp | (String | RegExp)[];
interface KeepAliveProps {
    children?: ChildrenType;
    max?: number;
    include?: StringRegexList;
    exclude?: StringRegexList;
}
export declare function onActivated(listener: () => void): () => void;
export declare function onDeactivated(listener: () => void): () => void;
export declare const KeepAlivePro: ({ children, max, include, exclude }: KeepAliveProps) => any;
export {};
