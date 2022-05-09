import parseTreeRoot, { clearVNode, queryVNode } from '../parser/parseVNode';
import { packagePayload, checkMessage } from '../utils/transferTool';
import {
  RequestAllVNodeTreeInfos,
  AllVNodeTreesInfos,
  RequestComponentAttrs,
  ComponentAttrs,
  DevToolHook,
  DevToolContentScript,
  ModifyAttrs,
  ModifyHooks,
  ModifyState,
  ModifyProps,
} from '../utils/constants';
import { VNode } from '../../../horizon/src/renderer/vnode/VNode';
import { parseVNodeAttrs } from '../parser/parseAttr';

const roots = [];

function addIfNotInclude(treeRoot: VNode) {
  if (!roots.includes(treeRoot)) {
    roots.push(treeRoot);
  }
}

function send() {
  const result = roots.reduce((pre, current) => {
    const info = parseTreeRoot(helper.travelVNodeTree ,current);
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

function calculateNextValue(editValue, value, attrPath) {
  let nextState;
  const editValueType = typeof editValue;
  if (editValueType === 'string' || editValueType === 'undefined' || editValueType === 'boolean') {
    nextState = value;
  } else if (editValueType === 'number') {
    const numValue = Number(value);
    nextState = isNaN(numValue) ? value : numValue; // 如果能转为数字，转数字，不能转数字，用原值
  } else if(editValueType === 'object') {
    if (editValue === null) {
      nextState = value;
    } else {
      const newValue = Array.isArray(editValue) ? [...editValue] : {...editValue};
      // 遍历读取到直接指向需要修改值的对象
      let attr = newValue;
      for(let i = 0; i < attrPath.length - 1; i++) {
        attr = attr[attrPath[i]];
      }
      // 修改对象上的值
      attr[attrPath[attrPath.length - 1]] = value;
      nextState = newValue;
    }
  } else {
    console.error('The devTool tried to edit a non-editable value, this is a bug, please report', editValue);
  }
  return nextState;
}

function modifyVNodeAttrs(data) {
  const {type, id, value, path} = data;
  const vNode = queryVNode(id);
  if (!vNode) {
    console.error('Do not find match vNode, this is a bug, please report us');
    return;
  }
  if (type === ModifyProps) {
    const nextProps = calculateNextValue(vNode.props, value, path);
    helper.updateProps(vNode, nextProps);
  } else if (type === ModifyHooks) {
    const hooks = vNode.hooks;
    const editHook = hooks[path[0]];
    const hookInfo = helper.getHookInfo(editHook);
    if (hookInfo) {
      const editValue = hookInfo.value;
      // path 的第一个值指向 hIndex，从第二个值才开始指向具体属性访问路径
      const nextState = calculateNextValue(editValue, value, path.slice(1));
      helper.updateHooks(vNode, path[0], nextState);
    } else {
      console.error('The devTool tried to edit a non-editable hook, this is a bug, please report', hooks);
    }
  } else if (type === ModifyState) {
    const oldState = vNode.state || {};
    const nextState = {...oldState};
    let accessRef = nextState;
    for(let i = 0; i < path.length - 1; i++) {
      accessRef = accessRef[path[i]];
    }
    accessRef[path[path.length - 1]] = value;
    helper.updateState(vNode, nextState);
  }
}

let helper;

function init(horizonHelper) {
  helper = horizonHelper;
}

function injectHook() {
  if (window.__HORIZON_DEV_HOOK__) {
    return;
  }
  Object.defineProperty(window, '__HORIZON_DEV_HOOK__', {
    enumerable: false,
    value: {
      init,
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
