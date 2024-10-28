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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { asyncUpdates, getFirstCustomElement, syncUpdates, startUpdate, createTreeRootVNode } from './Renderer';
import { createPortal } from './components/CreatePortal';
import type { Container, ElementType } from './Types';
import { isElement } from './utils/common';
import { findElementByClassInst } from './utils/InternalKeys';
import { listenSimulatedDelegatedEvents } from '../event/EventBinding';
import { Callback } from './Types';
import { InulaNode } from '../types';
import { EVENT_KEY } from './utils/InternalKeys';
import { InulaReconciler } from '.';

function createRoot(children: any, container: Container, callback?: Callback) {
  // 清空容器
  let child = container.lastChild;
  while (child) {
    container.removeChild(child);
    child = container.lastChild;
  }

  // 调度器创建根节点，并给容器dom赋vNode结构体
  const treeRoot = createTreeRootVNode(container);
  container._treeRoot = treeRoot;
  listenSimulatedDelegatedEvents(treeRoot);

  // 执行回调
  if (typeof callback === 'function') {
    const cb = callback;
    callback = function () {
      const instance = getFirstCustomElement(treeRoot);
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
  let treeRoot = container._treeRoot;

  if (!treeRoot) {
    treeRoot = createRoot(children, container, callback);
  } else {
    // container被render过
    if (typeof callback === 'function') {
      const cb = callback;
      callback = function () {
        const instance = getFirstCustomElement(treeRoot);
        cb.call(instance);
      };
    }
    // 执行更新操作
    startUpdate(children, treeRoot, callback);
  }

  return getFirstCustomElement(treeRoot);
}

function findNode(Ele?: Element): null | Element | Text {
  if (Ele === null || Ele === undefined) {
    return null;
  }

  // 普通节点
  if (isElement(Ele as ElementType)) {
    return Ele;
  }

  // class的实例
  return findElementByClassInst(Ele);
}

// 情况根节点监听器
function removeRootEventLister(container: Container) {
  const events = (container as any)[EVENT_KEY];
  if (events) {
    Object.keys(events).forEach(event => {
      const listener = events[event];

      if (listener) {
        InulaReconciler.hostConfig.removeEventListener(container, event, listener);
        events[event] = null;
      }
    });
  }
}

// 卸载入口
function destroy(container: Element | DocumentFragment | Document): boolean;
function destroy(container: Container): boolean {
  if (container._treeRoot) {
    syncUpdates(() => {
      executeRender(null, container, () => {
        removeRootEventLister(container);
        container._treeRoot = null;
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
  findNode,
  executeRender as render,
  createRootElement as createRoot,
  destroy as unmountComponentAtNode,
};
