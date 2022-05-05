import parseTreeRoot, { clearVNode, queryVNode } from '../parser/parseVNode';
import { packagePayload, checkMessage } from '../utils/transferTool';
import {
  RequestAllVNodeTreeInfos,
  AllVNodeTreesInfos,
  RequestComponentAttrs,
  ComponentAttrs,
  DevToolHook,
  DevToolContentScript, ModifyAttrs, ModifyHooks, ModifyState,
} from '../utils/constants';
import { VNode } from '../../../horizon/src/renderer/vnode/VNode';
import { parseVNodeAttrs } from '../parser/parseAttr';
import { Reducer } from '../../../horizon/src/renderer/hooks/HookType';

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
  const vNode = queryVNode(id);
  if (!vNode) {
    console.error('Do not find match vNode, this is a bug, please report us');
    return;
  }
  const parsedAttrs = parseVNodeAttrs(vNode);
  postMessage(ComponentAttrs, parsedAttrs);
}

function modifyVNodeAttrs(data) {
  const {type, id, value, path} = data;
  const vNode = queryVNode(id);
  if (!vNode) {
    console.error('Do not find match vNode, this is a bug, please report us');
    return;
  }
  if (type === ModifyHooks) {
    const hooks = vNode.hooks;
    const editHook = hooks[path[0]];
    if ((editHook.state as Reducer<any, any>).trigger) {
      const editState = editHook.state as Reducer<any, any>;
      const editValue = editState.stateValue;
      const editValueType = typeof editValue;
      if (editValueType === 'string') {
        editState.trigger(value);
      } else if (editValueType === 'number') {
        const numValue = Number(value);
        const targetValue = isNaN(numValue) ? value : numValue; // 如果能转为数字，转数字，不能转数字，用原值
        editState.trigger(targetValue);
      } else if(editValueType === 'object') {
        if (editValue === null) {
          editState.trigger(value);
        } else {
          const newValue = {...editValue};
          // 遍历读取到直接指向需要修改值的对象
          const attrPath = path.slice(1);
          let attr = newValue;
          for(let i = 0; i < attrPath.length - 1; i++) {
            attr = attr[attrPath[i]];
          }
          // 修改对象上的值
          attr[attrPath[attrPath.length - 1]] = value;
          editState.trigger(newValue);
        }
      }
    }
  } else if (type === ModifyState) {
    const instance = vNode.realNode;
    const oldState = instance.state || {};
    const nextState = Object.assign({}, oldState);
    let accessRef = nextState;
    for(let i = 0; i < path.length - 1; i++) {
      accessRef = accessRef[path[i]];
    }
    accessRef[path[path.length - 1]] = value;
    instance.setState(nextState);
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
      } else if (type === ModifyAttrs) {
        modifyVNodeAttrs(data);
      }
    }
  });
}

injectHook();
