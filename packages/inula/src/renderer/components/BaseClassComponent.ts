/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { Callback } from '../Types';
import type { ComponentLifecycle, KVObject, InulaNode, Context, CSSProperties } from '../../types';

/**
 * Component的api setState和forceUpdate在实例生成阶段实现
 */

// eslint-disable-next-line
interface Component<P = KVObject, S = KVObject, SS = any, C = any> extends ComponentLifecycle<P, S, SS> {
  forceUpdate(callback?: () => void): void;

  render(): InulaNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Component<P = KVObject, S = KVObject, SS = any, C = any> {
  static contextType?: Context<any> | undefined;
  context: C | undefined;

  readonly props: Readonly<P>;
  state: Readonly<S>;

  refs: {
    [key: string]: Component<any>;
  };
  isReactComponent: boolean;

  constructor(props: P, context?: C) {
    this.props = props;
    this.context = context;
  }

  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | Pick<S, K> | S | null,
    callback?: Callback
  ) {
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
class PureComponent<P, S, SS, C = any> extends Component<P, S, SS> {
  constructor(props: P, context: C) {
    super(props, context);
  }
}

export { Component, PureComponent };
