/**
 * Component的api setState和forceUpdate在实例生成阶段实现
 */
class Component {
  props;
  context;

  constructor(props, context) {
    this.props = props;
    this.context = context;
  }
}

// 兼容三方件 react-lifecycles-compat，它会读取 isReactComponent 属性值，不添加会导致 eview-ui 官网白屏
Component.prototype.isReactComponent = true;
/**
 * 支持PureComponent
 */
class PureComponent extends Component {
  constructor(props, context) {
    super(props, context);
  }
}

export { Component, PureComponent };
