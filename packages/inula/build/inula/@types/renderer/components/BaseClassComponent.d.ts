import { Callback } from '../Types';
/**
 * Component的api setState和forceUpdate在实例生成阶段实现
 */
declare class Component<P, S, C> {
    props: P;
    context: C;
    state: S | null;
    refs: any;
    forceUpdate: any;
    isReactComponent: boolean;
    constructor(props: P, context: C);
    setState(state: S, callback?: Callback): void;
}
/**
 * 支持PureComponent
 */
declare class PureComponent<P, S, C> extends Component<P, S, C> {
    constructor(props: P, context: C);
}
export { Component, PureComponent };
