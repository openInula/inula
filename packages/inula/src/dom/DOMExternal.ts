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

import { asyncUpdates, getFirstCustomDom, syncUpdates, startUpdate, createTreeRootVNode } from '../renderer/Renderer';
import { createPortal } from '../renderer/components/CreatePortal';
import type { Container } from './DOMOperator';
import { isElement } from './utils/Common';
import { findDOMByClassInst } from '../renderer/vnode/VNodeUtils';
import { listenSimulatedDelegatedEvents } from '../event/EventBinding';
import { Callback } from '../renderer/Types';
import { InulaNode } from '../types';
import { EVENT_KEY, ROOT_CONTAINER } from './DOMInternalKeys';

function createRoot(children: any, container: Container, callback?: Callback) {
  // 清空容器
  let child = container.lastChild;
  while (child) {
    container.removeChild(child);
    child = container.lastChild;
  }

  // 调度器创建根节点，并给容器dom赋vNode结构体
  const treeRoot = createTreeRootVNode(container);
  container[ROOT_CONTAINER] = treeRoot;
  listenSimulatedDelegatedEvents(treeRoot);

  // 执行回调
  if (typeof callback === 'function') {
    const cb = callback;
    callback = function () {
      const instance = getFirstCustomDom(treeRoot);
      cb.call(instance);
    };
  }

  // 建VNode树，启动页面绘制
  syncUpdates(() => {
    startUpdate(children, treeRoot, callback);
  });

  return treeRoot;
}

function executeRender(children: any, container: Container, callback?: Callback) {
  let treeRoot = container[ROOT_CONTAINER];

  if (!treeRoot) {
    treeRoot = createRoot(children, container, callback);
  } else {
    // container被render过
    if (typeof callback === 'function') {
      const cb = callback;
      callback = function () {
        const instance = getFirstCustomDom(treeRoot);
        cb.call(instance);
      };
    }
    // 执行更新操作
    startUpdate(children, treeRoot, callback);
  }

  return getFirstCustomDom(treeRoot);
}

function findDOMNode(domOrEle?: Element): null | Element | Text {
  if (domOrEle === null || domOrEle === undefined) {
    return null;
  }

  // 普通节点
  if (isElement(domOrEle)) {
    return domOrEle;
  }

  // class的实例
  return findDOMByClassInst(domOrEle);
}

// 情况根节点监听器
function removeRootEventLister(container: Container) {
  const events = (container as any)[EVENT_KEY];
  if (events) {
    Object.keys(events).forEach(event => {
      const listener = events[event];

      if (listener) {
        container.removeEventListener(event, listener);
        events[event] = null;
      }
    });
  }
}

// 卸载入口
function destroy(container: Element | DocumentFragment | Document): boolean;
function destroy(container: Container): boolean {
  if (container[ROOT_CONTAINER]) {
    syncUpdates(() => {
      executeRender(null, container, () => {
        removeRootEventLister(container);
        container[ROOT_CONTAINER] = null;
      });
    });

    return true;
  }

  return false;
}

interface RootElement {
  render(component: InulaNode): void;

  unmount(): void;
}

function createRootElement(container: Container, option?: Record<string, any>): RootElement {
  return {
    render(component: InulaNode) {
      executeRender(component, container);
    },
    unmount(): void {
      destroy(container);
    },
  };
}

export {
  createPortal,
  asyncUpdates as unstable_batchedUpdates,
  findDOMNode,
  executeRender as render,
  createRootElement as createRoot,
  destroy as unmountComponentAtNode,
};
