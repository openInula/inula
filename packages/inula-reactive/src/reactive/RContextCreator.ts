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

import { launchUpdateFromVNode } from '../renderer/TreeBuilder';
import { bindReactiveWithContext, cleanupRContext, RContext } from './RContext';
import { For } from './components/For';
import { VNode } from '../renderer/Types';
import { RContextParam, Reactive, RNode } from './types';
import { getRNodeVal } from './RNode';
import { getVNode } from '../dom/DOMInternalKeys';
import { updateInputValue } from '../dom/valueHandler/InputValueHandler';
import { updateTextareaValue } from '../dom/valueHandler/TextareaValueHandler';
import { setDomProps } from '../dom/DOMPropertiesHandler/DOMPropertiesHandler';
import { getRNodeFromProxy, isAtom, isReactiveProxy } from './Utils';
import { isReactively } from '../reactively/utils';
import { reactively } from '../reactively/Reactively';

const vNodeEffectMap = new WeakMap<VNode, RContext>();

/**
 * 创建组件（函数组件或Class组件）级别Dependent
 * @param renderFn 函数组件 或 Class的render
 * @param vNode
 */
export function createComponentDependent<T>(renderFn: () => T, vNode: VNode): T {
  let compRContext = vNode.compRContext;

  if (!compRContext) {
    compRContext = new RContext(
      (params, reactive) => {
        vNode.isStoreChange = true;

        // 如果是For组件
        if (For === vNode.type && reactive.diffOperator) {
          // 如果Reactive的For组件
          const { isOnlyNop } = reactive.diffOperator;

          // 如果没有需要处理
          if (isOnlyNop) {
            return;
          }
        }

        // 同步刷新
        // syncUpdates(() =>{
        //   // 触发vNode更新
        //   launchUpdateFromVNode(vNode);
        // });

        // 触发vNode更新
        launchUpdateFromVNode(vNode);
      },
      { vNode }
    );

    vNode.compRContext = compRContext;
  }

  const endRContext = compRContext.start();

  const result = renderFn();

  endRContext();

  return result;
}

/**
 * 订阅DOM的属性（props或children），创建一个专门更新该属性的上下文，当响应式数据变化就触发该上下文的callback
 * @param dom DOM元素
 * @param propName 属性名字
 * @param propVal 属性值，是响应式数据
 * @param styleName style里面的某个属性
 */
function subscribeAttr(dom: Element, propName: string, propVal: Reactive, styleName?: string) {
  const attrRContext = new RContext(
    params => {
      let changeList;
      if (propName === 'style' && styleName) {
        changeList = {
          style: {
            [styleName]: getRNodeVal(params.reactive!),
          },
        };
      } else {
        changeList = {
          [propName]: getRNodeVal(params.reactive!),
        };
      }

      const type = getVNode(dom)?.type;
      if (type === 'input' && propName === 'value') {
        updateInputValue(dom as HTMLInputElement, changeList);
      } else if (type === 'textarea' && propName === 'value') {
        updateTextareaValue(dom as HTMLTextAreaElement, changeList);
      } else {
        setDomProps(dom, changeList, true, false);
      }
    },
    { reactive: propVal }
  );

  bindReactiveWithContext(propVal, attrRContext);

  // vNode保存RContext，用于cleanup
  const vNode = getVNode(dom);
  saveAttrRContexts(vNode, attrRContext);
}

/**
 * 订阅DOM的属性（props或children），创建一个专门更新该属性的上下文，当响应式数据变化就触发该上下文的callback
 * @param dom DOM元素
 * @param propName 属性名字
 * @param propVal 属性值，是响应式数据
 * @param styleName style里面的某个属性
 */
function subscribeAttrForReactively(dom: Element, propName: string, propVal, styleName?: string) {
  const attrRContext = reactively.watch(
    () => {
      let changeList;
      if (propName === 'style' && styleName) {
        changeList = {
          style: {
            [styleName]: propVal.get(),
          },
        };
      } else {
        changeList = {
          [propName]: propVal.get(),
        };
      }

      const type = getVNode(dom)?.type;
      if (type === 'input' && propName === 'value') {
        updateInputValue(dom as HTMLInputElement, changeList);
      } else if (type === 'textarea' && propName === 'value') {
        updateTextareaValue(dom as HTMLTextAreaElement, changeList);
      } else {
        setDomProps(dom, changeList, true, false);
      }
    },
  );

  // bindReactiveWithContext(propVal, attrRContext);
  //
  // // vNode保存RContext，用于cleanup
  // const vNode = getVNode(dom);
  // saveAttrRContexts(vNode, attrRContext);
}

export function handleReactiveProp(dom: Element, propName: string, propVal: any, styleName?: string): any {
  let rawVal = propVal;
  const isA = isAtom(propVal);
  const isProxy = isReactiveProxy(propVal);
  const isRy = isReactively(propVal);

  if (isA || isProxy) {
    let reactive = propVal;
    if (isProxy) {
      reactive = getRNodeFromProxy(propVal);
    }
    rawVal = getRNodeVal(reactive as Reactive);
    subscribeAttr(dom, propName, reactive, styleName);
  }

  if (isRy) {
    subscribeAttrForReactively(dom, propName, propVal, styleName);
    rawVal = propVal.get();
  }

  return rawVal;
}

/**
 * 创建DOM Key Dependent
 * @param callback 用于修改VNode的key
 * @param params Effect调用所需要的参数
 */
export function createKeyDependent(callback: (params: RContextParam) => void, params?: RContextParam) {
  return new RContext(callback, params);
}

/**
 * 处理 <div>Count: {_rObj}</div>
 * @param textDom 用于修改VNode的key
 * @param rText Effect调用所需要的参数
 */
export function subscribeReactiveComponent(textDom: Element, rText: Reactive) {
  const textContext = new RContext(
    params => {
      textDom.textContent = getRNodeVal(params.reactive as Reactive);
    },
    { reactive: rText }
  );

  bindReactiveWithContext(rText, textContext);

  // vNode保存RContext，用于cleanup
  const vNode = getVNode(textDom);
  saveAttrRContexts(vNode, textContext);
}

// TODO 删除
export function cleanupVNodeEffect(vNode: VNode) {
  const effect = vNodeEffectMap.get(vNode);
  if (effect) {
    cleanupRContext(effect);
    vNodeEffectMap.delete(vNode);
  }
}

/**
 * 创建DOM Key Dependent
 * @param vNode
 * @param rKey
 */
export function subscribeKeyEffect(vNode: VNode, rKey: RNode) {
  const keyContext = new RContext(
    params => {
      vNode.key = getRNodeVal(rKey);
    },
    { reactive: rKey }
  );

  bindReactiveWithContext(rKey, keyContext);

  // vNode保存RContext，用于cleanup
  saveAttrRContexts(vNode, keyContext);
}

// vNode保存RContext，用于cleanup
function saveAttrRContexts(vNode: VNode | null, rContext: RContext) {
  if (vNode) {
    if (!vNode.attrRContexts) {
      vNode.attrRContexts = new Set();
    }
    vNode.attrRContexts.add(rContext);
  }
}
