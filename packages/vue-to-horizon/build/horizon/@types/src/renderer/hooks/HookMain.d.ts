import type { VNode } from '../Types';
export declare function runFunctionWithHooks<Props extends Record<string, any>, Arg>(funcComp: (props: Props, arg: Arg) => any, props: Props, arg: Arg, processing: VNode): any;
