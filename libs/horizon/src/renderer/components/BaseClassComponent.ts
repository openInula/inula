/**
 * Component的api setState和forceUpdate在实例生成阶段实现
 */

class Component<P,S,C> {
  props: P;
  context: C;
  state: S | null;
  refs: any;
  forceUpdate: any;

  constructor(props: P, context: C) {
    this.props = props;
    this.context = context;
  }

  setState(state: S) {
    console.error('Cant not call `this.setState` in the constructor of class component, it will do nothing')
  }
}

// 兼容三方件 react-lifecycles-compat，它会读取 isReactComponent 属性值，不添加会导致 eview-ui 官网白屏
Component.prototype.isReactComponent = true;
/**
 * 支持PureComponent
 */
class PureComponent<P, S, C> extends Component<P, S, C> {
  constructor(props: P, context: C) {
    super(props, context);
  }
}

export { Component, PureComponent };
