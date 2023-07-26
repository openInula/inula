/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import {Callback} from '../Types';

/**
 * Component的api setState和forceUpdate在实例生成阶段实现
 */
class Component<P, S, C> {
  props: P;
  context: C;
  state: S | null;
  refs: any;
  forceUpdate: any;
  isReactComponent: boolean;

  constructor(props: P, context: C) {
    this.props = props;
    this.context = context;
  }

  setState(state: S, callback?: Callback) {
    if (isDev) {
      console.error('Can not call `this.setState` in the constructor of class component, it will do nothing');
    }
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
