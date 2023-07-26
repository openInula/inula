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

import type { VNode } from '../Types';

import { FlagUtils } from '../vnode/VNodeFlags';
import { getLazyVNodeTag } from '../vnode/VNodeCreator';
import { ClassComponent, ForwardRef, FunctionComponent, MemoComponent } from '../vnode/VNodeTags';
import { throwIfTrue } from '../utils/throwIfTrue';
import { captureFunctionComponent } from './FunctionComponent';
import { captureRender as captureClassComponent } from './ClassComponent';
import { captureMemoComponent } from './MemoComponent';

export function bubbleRender() {}

const LazyRendererMap = {
  [FunctionComponent]: captureFunctionComponent,
  [ClassComponent]: captureClassComponent,
  [ForwardRef]: captureFunctionComponent,
  [MemoComponent]: captureMemoComponent,
};

export function mergeDefaultProps(Component: any, props: object): object {
  if (Component && Component.defaultProps) {
    const clonedProps = { ...props };
    const defaultProps = Component.defaultProps;
    Object.keys(defaultProps).forEach(key => {
      if (clonedProps[key] === undefined) {
        clonedProps[key] = defaultProps[key];
      }
    });
    return clonedProps;
  }
  return props;
}

function captureLazyComponent(processing, lazyComponent, shouldUpdate) {
  if (!processing.isCreated) {
    // 每次加载lazy都当作mount来处理
    processing.isCreated = true;
    FlagUtils.markAddition(processing);
  }

  const Component = lazyComponent._load(lazyComponent._content);

  // ======================loaded===============================
  // 加载得到的Component存在type中
  processing.type = Component;

  const lazyVNodeTag = getLazyVNodeTag(Component);
  processing.tag = lazyVNodeTag;
  const lazyVNodeProps = mergeDefaultProps(Component, processing.props);

  const lazyRender = LazyRendererMap[lazyVNodeTag];
  if (lazyRender) {
    if (lazyVNodeTag === MemoComponent) {
      // Memo要特殊处理
      processing.effectList = null;
      const memoVNodeProps = mergeDefaultProps(Component.type, lazyVNodeProps); // 需要整合defaultProps
      return lazyRender(processing, Component, memoVNodeProps, shouldUpdate);
    } else {
      return lazyRender(processing, Component, lazyVNodeProps, false);
    }
  } else {
    // lazy加载的组件类型未受支持
    throwIfTrue(
      true,
      'Element type is invalid. Received a promise that resolves to: %s. ' +
        'Lazy element type must resolve to a class or function.%s',
      Component,
      ''
    );
    return null;
  }
}

export function captureRender(processing: VNode, shouldUpdate: boolean): VNode | null {
  return captureLazyComponent(processing, processing.type, shouldUpdate);
}
