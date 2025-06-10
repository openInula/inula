import type { VNode } from '../renderer/Types';
export declare type Props = Record<string, any> & {
    autoFocus?: boolean;
    children?: any;
    dangerouslySetInnerHTML?: any;
    disabled?: boolean;
    hidden?: boolean;
    style?: {
        display?: string;
    };
};
export declare type Container = (Element & {
    _treeRoot?: VNode | null;
}) | (Document & {
    _treeRoot?: VNode | null;
});
export declare function getNSCtx(parentNS: string, type: string, dom?: Container): string;
export declare function prepareForSubmit(): void;
export declare function resetAfterSubmit(): void;
export declare function newDom(tagName: string, props: Props, parentNamespace: string, vNode: VNode): Element;
export declare function initDomProps(dom: Element, tagName: string, rawProps: Props): boolean;
export declare function getPropChangeList(dom: Element, type: string, lastRawProps: Props, nextRawProps: Props): Object;
export declare function isTextChild(type: string, props: Props): boolean;
export declare function newTextDom(text: string, processing: VNode): Text;
export declare function submitDomUpdate(tag: string, vNode: VNode): void;
export declare function clearText(dom: Element): void;
export declare function appendChildElement(parent: Element | Container, child: Element | Text): void;
export declare function insertDomBefore(parent: Element | Container, child: Element | Text, beforeChild: Element | Text): void;
export declare function removeChildDom(parent: Element | Container, child: Element | Text): void;
export declare function hideDom(tag: string, dom: Element | Text): void;
export declare function unHideDom(tag: string, dom: Element | Text, props: Props): void;
