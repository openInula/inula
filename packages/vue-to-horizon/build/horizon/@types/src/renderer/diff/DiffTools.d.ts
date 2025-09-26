import type { VNode, JSXElement } from '../Types';
export declare const isSameType: (vNode: VNode, ele: JSXElement) => boolean;
export declare function isTextType(newChild: any): boolean;
export declare function isIteratorType(newChild: any): any;
export declare function getIteratorFn(maybeIterable: any): () => Iterator<any>;
export declare function isObjectType(newChild: any): boolean;
