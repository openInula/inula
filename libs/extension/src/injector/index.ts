import parseTreeRoot, { clearVNode, queryVNode } from '../parser/parseVNode';
import { packagePayload, checkMessage } from './../utils/transferTool';
import {
  RequestAllVNodeTreeInfos,
  AllVNodeTreesInfos,
  RequestComponentAttrs,
  ComponentAttrs,
  DevToolHook,
  DevToolContentScript
} from './../utils/constants';
import { VNode } from './../../../horizon/src/renderer/vnode/VNode';
import { ClassComponent } from '../../../horizon/src/renderer/vnode/VNodeTags';
import { parseAttr } from '../parser/parseAttr';

const roots = [];

function addIfNotInclude(treeRoot: VNode) {
  if (!roots.includes(treeRoot)) {
    roots.push(treeRoot);
  }
}

function send() {
  const result = roots.reduce((pre, current) => {
    const info = parseTreeRoot(current);
    pre.push(info);
    return pre;
  }, []);
  postMessage(AllVNodeTreesInfos, result);
}

function deleteVNode(vNode: VNode) {
  // 开发工具中保存了 vNode 的引用，在清理 VNode 的时候需要一并删除
  clearVNode(vNode);
  const index = roots.indexOf(vNode);
  if (index !== -1) {
    roots.splice(index, 1);
  }
}

function postMessage(type: string, data) {
  window.postMessage(packagePayload({
    type: type,
    data: data,
  }, DevToolHook), '*');
}

function parseCompAttrs(id: number) {
  const vNode: VNode = queryVNode(id);
  const tag = vNode.tag;
  if (tag === ClassComponent) {
    const { props, state } = vNode;
    const parsedProps = parseAttr(props);
    const parsedState = parseAttr(state);
    postMessage(ComponentAttrs, {
      parsedProps,
      parsedState,
    });
  }
}

function injectHook() {
  if (window.__HORIZON_DEV_HOOK__) {
    return;
  }
  Object.defineProperty(window, '__HORIZON_DEV_HOOK__', {
    enumerable: false,
    value: {
      addIfNotInclude,
      send,
      deleteVNode,
    },
  });
  window.addEventListener('message', function (event) {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }
    const request = event.data;
    if (checkMessage(request, DevToolContentScript)) {
      const { payload } = request;
      const { type, data } = payload;
      if (type === RequestAllVNodeTreeInfos) {
        send();
      } else if (type === RequestComponentAttrs) {
        parseCompAttrs(data);
      }
    }
  });
}

injectHook();
