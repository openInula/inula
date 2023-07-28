import { InulaDom } from './Interface';
import { Props } from '../DOMOperator';
/**
 * 获取当前聚焦的 input 或者 textarea 元素
 * @param doc 指定 document
 */
export declare function getFocusedDom(doc?: Document): InulaDom | null;
export declare function getIFrameFocusedDom(): InulaDom;
export declare function isElement(dom: any): boolean;
export declare function isText(dom: any): boolean;
export declare function isComment(dom: any): boolean;
export declare function isDocument(dom: any): boolean;
export declare function isDocumentFragment(dom: any): boolean;
export declare function getDomTag(dom: any): any;
export declare function isInputElement(dom: Element): dom is HTMLInputElement;
export declare function shouldAutoFocus(tagName: string, props: Props): boolean;
export declare function isNotNull(object: any): boolean;
