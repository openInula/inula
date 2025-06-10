import { Hook } from '../renderer/hooks/HookType';
import { VNode } from '../renderer/vnode/VNode';
import { JSXElement } from '../renderer/Types';
export declare const helper: {
    travelVNodeTree: (rootVNode: any, fun: any, childFilter?: (node: VNode) => boolean) => void;
    getHookInfo: (hook: Hook<any, any>) => {
        name: string;
        hIndex: number;
        value: any;
    };
    updateProps: (vNode: VNode, props: any) => void;
    updateState: (vNode: VNode, nextState: any) => void;
    updateHooks: (vNode: VNode, hIndex: any, nextState: any) => void;
    getComponentInfo: (vNode: VNode) => any;
    getElementTag: (element: JSXElement) => string;
};
export declare function injectUpdater(): void;
