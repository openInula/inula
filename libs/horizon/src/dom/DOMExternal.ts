import {
  asyncUpdates, getFirstCustomDom,
  syncUpdates, startUpdate,
  createTreeRootVNode,
} from '../renderer/Renderer';
import {createPortal} from '../renderer/components/CreatePortal';
import type {Container} from './DOMOperator';
import {isElement} from './utils/Common';
import {listenDelegatedEvents} from '../event/EventBinding';
import {findDOMByClassInst} from '../renderer/vnode/VNodeUtils';
import {Callback} from '../renderer/UpdateHandler';

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

  // 根节点挂接全量事件
  // listenDelegatedEvents(container as Element);

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

function executeRender(
  children: any,
  container: Container,
  callback?: Callback,
) {
  let treeRoot = container._treeRoot;

  if (!treeRoot) {
    treeRoot = createRoot(children, container, callback);
  } else { // container被render过
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
  if (domOrEle == null) {
    return null;
  }

  // 普通节点
  if (isElement(domOrEle)) {
    return domOrEle;
  }

  // class的实例
  return findDOMByClassInst(domOrEle);
}

// 卸载入口
function destroy(container: Container) {
  if (container._treeRoot) {
    syncUpdates(() => {
      executeRender(null, container, () => {
        container._treeRoot = null;
      });
    });

    return true;
  }

  return false;
}

export {
  createPortal,
  asyncUpdates as unstable_batchedUpdates,
  findDOMNode,
  executeRender as render,
  destroy as unmountComponentAtNode,
};
