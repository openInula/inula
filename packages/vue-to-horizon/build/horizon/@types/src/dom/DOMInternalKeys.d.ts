/**
 * 文件整体功能：给dom节点赋 VNode 的结构体和事件初始化标记
 */
import type { VNode } from '../renderer/Types';
import type { Container, Props } from './DOMOperator';
export declare function getDom(vNode: VNode): Element | Text | null;
export declare function saveVNode(vNode: VNode, dom: Element | Text | Container): void;
export declare function getVNode(dom: Node | Container): VNode | null;
export declare function getNearestVNode(dom: Node): null | VNode;
export declare function getVNodeProps(dom: Element | Text): Props | null;
export declare function updateVNodeProps(dom: Element | Text, props: Props): void;
export declare function getNonDelegatedListenerMap(dom: Element | Text): Map<string, EventListener>;
