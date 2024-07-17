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

import parseTreeRoot, { clearVNode, queryVNode, VNodeToIdMap } from '../parser/parseVNode';
import { packagePayload, checkMessage } from '../utils/transferUtils';
import {
  RequestAllVNodeTreeInfos,
  AllVNodeTreeInfos,
  RequestComponentAttrs,
  ComponentAttrs,
  DevToolHook,
  DevToolContentScript,
  ModifyAttrs,
  ModifyHooks,
  ModifyState,
  ModifyProps,
  InspectDom,
  LogComponentData,
  Highlight,
  RemoveHighlight,
  ViewSource,
  PickElement,
  StopPickElement,
  CopyToConsole,
  StorageValue,
} from '../utils/constants';
import { VNode } from '../../../inula/src/renderer/vnode/VNode';
import { parseVNodeAttrs } from '../parser/parseAttr';
import { showHighlight, hideHighlight } from '../highlight';
import {
  FunctionComponent,
  ClassComponent,
  IncompleteClassComponent,
  ForwardRef,
  MemoComponent,
} from '../../../inula/src/renderer/vnode/VNodeTags';
import { pickElement } from './pickElement';

const roots = [];
let storeDataCount = 0;

function addIfNotInclude(treeRoot: VNode) {
  if (!roots.includes(treeRoot)) {
    roots.push(treeRoot);
  }
}

function send() {
  const result = roots.reduce((pre, current) => {
    const info = parseTreeRoot(helper.travelVNodeTree, current);
    pre.push(info);
    return pre;
  }, []);
  postMessage(AllVNodeTreeInfos, result);
}

function deleteVNode(vNode: VNode) {
  // 开发工具中保存了 vNode 的引用，在清理 vNode 的时候需要一并删除
  clearVNode(vNode);
  const index = roots.indexOf(vNode);
  if (index !== -1) {
    roots.splice(index, 1);
  }
}

export function postMessage(type: string, data) {
  window.postMessage(
    packagePayload(
      {
        type: type,
        data: data,
      },
      DevToolHook
    ),
    '*'
  );
}

function parseCompAttrs(id: number) {
  const vNode = queryVNode(id);
  if (!vNode) {
    console.error('Do not find match vNode, this is a bug, please report us.');
    return;
  }
  const parsedAttrs = parseVNodeAttrs(vNode, helper.getHookInfo);
  postMessage(ComponentAttrs, parsedAttrs);
}

function calculateNextValue(editValue, value, attrPath) {
  let nextState;
  const editValueType = typeof editValue;
  if (editValueType === 'string' || editValueType === 'undefined' || editValueType === 'boolean') {
    nextState = value;
  } else if (editValueType === 'number') {
    const numValue = Number(value);
    nextState = isNaN(numValue) ? value : numValue; // 如果能转为数字，转数字，不能转数字旧用原值
  } else if (editValueType === 'object') {
    if (editValue === null) {
      nextState = value;
    } else {
      const newValue = Array.isArray(editValue) ? [...editValue] : { ...editValue };
      // 遍历读取到直接指向需要修改值的对象
      let attr = newValue;
      for (let i = 0; i < attrPath.length - 1; i++) {
        attr = attr[attrPath[i]];
      }
      // 修改对象上的值
      attr[attrPath[attrPath.length - 1]] = value;
      nextState = newValue;
    }
  } else {
    console.error('The dev tools tried to edit a non-editable value, this is a bug, please report.', editValue);
  }
  return nextState;
}

function modifyVNodeAttrs(data) {
  const { type, id, value, path } = data;
  const vNode = queryVNode(id);
  if (!vNode) {
    console.error('Do not find match vNode, this is a bug, please report us.');
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
      // path 的第一个指向 hIndex，从第二个值才开始指向具体属性访问路径
      const nextState = calculateNextValue(editValue, value, path.slice(1));
      helper.updateHooks(vNode, path[0], nextState);
    } else {
      console.error('The dev tools tried to edit a non-editable hook, this is a bug, please report.', hooks);
    }
  } else if (type === ModifyState) {
    const oldState = vNode.state || {};
    const nextState = { ...oldState };
    let accessRef = nextState;
    for (let i = 0; i < path.length - 1; i++) {
      accessRef = accessRef[path[i]];
    }
    accessRef[path[path.length - 1]] = value;
    helper.updateState(vNode, nextState);
  }
}

function logComponentData(id: number) {
  const vNode = queryVNode(id);
  if (vNode == null) {
    console.warn(`Could not find vNode with id "${id}"`);
    return null;
  }
  if (vNode) {
    const info = helper.getComponentInfo(vNode);
    console.log('vNode: ', vNode);
    console.log('Component Info: ', info);
  }
}

/**
 * 通过 path 在 vNode 拿到对应的值
 *
 * @param {VNode} vNode dom 节点
 * @param {Array<string | number>} path 路径
 * @param {string} attrsName 值的类型（props 或者 hooks）
 */
const getValueByPath = (vNode: VNode, path: Array<string | number>, attrsName: string) => {
  if (attrsName === 'Props') {
    return path.reduce((previousValue, currentValue) => {
      return previousValue[currentValue];
    }, vNode.props);
  } else {
    // attrsName 为 Hooks
    if (path.length > 1) {
      return path.reduce((previousValue, currentValue) => {
        return previousValue[currentValue];
      }, vNode.hooks);
    }
    return vNode.hooks[path[0]];
  }
};

/**
 * 通过 path 在 vNode 拿到对应的值，并且在控制台打印出来
 *
 * @param {number} id idToVNodeMap 的 key 值，通过 id 拿到 VNode
 * @param {string} itemName 打印出来值的名称
 * @param {Array<string | number>} path 值的路径
 * @param {string} attrsName 值的类型
 */
function logDataWithPath(id: number, itemName: string, path: Array<string | number>, attrsName: string) {
  const vNode = queryVNode(id);
  if (vNode === null) {
    console.warn(`Could not find vNode with id "${id}"`);
    return null;
  }
  if (vNode) {
    const value = getValueByPath(vNode, path, attrsName);
    if (attrsName === 'Hooks') {
      console.log(itemName, value);
    } else {
      console.log(`${path[path.length - 1]}`, value);
    }
  }
}

/**
 * 通过 path 在 vNode 拿到对应的值，并且存为全局变量
 *
 * @param {number} id idToVNodeMap 的 key 值，通过 id 拿到 VNode
 * @param {Array<string |number>} path 值的路径
 * @param {string} attrsName 值的类型
 */
function storeDataWithPath(id: number, path: Array<string | number>, attrsName: string) {
  const vNode = queryVNode(id);
  if (vNode === null) {
    console.warn(`Could not find vNode with id "${id}"`);
    return null;
  }
  if (vNode) {
    const value = getValueByPath(vNode, path, attrsName);
    const key = `$InulaTemp${storeDataCount++}`;

    window[key] = value;
    console.log(key);
    console.log(value);
  }
}

export let helper;

function init(inulaHelper) {
  helper = inulaHelper;
  (window as any).__INULA_DEV_HOOK__.isInit = true;
}

export function getElement(travelVNodeTree, treeRoot: VNode) {
  const result: any[] = [];
  travelVNodeTree(
    treeRoot,
    (node: VNode) => {
      if (node.realNode) {
        if (Object.keys(node.realNode).length > 0 || node.realNode.size > 0) {
          result.push(node);
        }
      }
    },
    (node: VNode) => node.realNode != null && (Object.keys(node.realNode).length > 0 || node.realNode.size > 0)
  );
  return result;
}

// dev tools 点击眼睛图标功能
const inspectDom = data => {
  const { id } = data;
  const vNode = queryVNode(id);
  if (vNode == null) {
    console.warn(`Could not find vNode with id "${id}"`);
    return null;
  }
  const info = getElement(helper.travelVNodeTree, vNode);
  if (info) {
    showHighlight(info);
    (window as any).__INULA_DEV_HOOK__.$0 = info[0];
  }
};

const picker = pickElement(window);

const actions = new Map([
  // 请求左树所有数据
  [
    RequestAllVNodeTreeInfos,
    () => {
      send();
    },
  ],
  // 请求某个节点的 props，hooks
  [
    RequestComponentAttrs,
    data => {
      parseCompAttrs(data);
    },
  ],
  // 修改 props，hooks
  [
    ModifyAttrs,
    data => {
      modifyVNodeAttrs(data);
    },
  ],
  // 找到节点对应 element
  [
    InspectDom,
    data => {
      inspectDom(data);
    },
  ],
  // 打印节点数据
  [
    LogComponentData,
    data => {
      logComponentData(data);
    },
  ],
  // 高亮
  [
    Highlight,
    data => {
      const node = queryVNode(data.id);
      if (node == null) {
        console.warn(`Could not find vNode with id "${data.id}"`);
        return null;
      }
      const info = getElement(helper.travelVNodeTree, node);
      showHighlight(info);
    },
  ],
  // 移出高亮
  [
    RemoveHighlight,
    () => {
      hideHighlight();
    },
  ],
  // 查看节点源代码位置
  [
    ViewSource,
    data => {
      const node = queryVNode(data.id);
      if (node == null) {
        console.warn(`Could not find vNode with id "${data.id}"`);
        return null;
      }
      showSource(node);
    },
  ],
  // 选中页面元素对应 dev tools 节点
  [
    PickElement,
    () => {
      picker.startPick();
    },
  ],
  [
    StopPickElement,
    () => {
      picker.stopPick();
    },
  ],
  // 在控制台打印 Props Hooks State 值
  [
    CopyToConsole,
    data => {
      const node = queryVNode(data.id);
      if (node == null) {
        console.warn(`Could not find vNode with id "${data.id}"`);
        return null;
      }
      logDataWithPath(data.id, data.itemName, data.path, data.attrsName);
    },
  ],
  // 把 Props Hooks State 值存为全局变量
  [
    StorageValue,
    data => {
      const node = queryVNode(data.id);
      if (node == null) {
        console.warn(`Could not find vNode with id "${data.id}"`);
        return null;
      }
      storeDataWithPath(data.id, data.path, data.attrsName);
    },
  ],
]);

const showSource = (node: VNode) => {
  switch (node.tag) {
    case ClassComponent:
    case IncompleteClassComponent:
    case FunctionComponent:
      global.$type = node.type;
      break;
    case ForwardRef:
      global.$type = node.type.render;
      break;
    case MemoComponent:
      global.$type = node.type.type;
      break;
    default:
      global.$type = null;
      break;
  }
};

const handleRequest = (type: string, data) => {
  const action = actions.get(type);
  if (action) {
    action.call(this, data);
    return null;
  }
  console.warn('unknown command', type);
};

function injectHook() {
  if ((window as any).__INULA_DEV_HOOK__) {
    return;
  }
  Object.defineProperty(window, '__INULA_DEV_HOOK__', {
    enumerable: false,
    value: {
      $0: null,
      init,
      isInit: false,
      addIfNotInclude,
      send,
      deleteVNode,
      // inulaX 使用
      getVNodeId: vNode => {
        return VNodeToIdMap.get(vNode);
      },
    },
  });

  window.addEventListener('message', function (event) {
    // 只接收我们自己的消息
    if (event.source !== window) {
      return;
    }
    const request = event.data;
    if (checkMessage(request, DevToolContentScript)) {
      const { payload } = request;
      const { type, data } = payload;

      // 忽略 inulaX 的 actions
      if (type.startsWith('inulax')) {
        return;
      }
      handleRequest(type, data);
    }
  });
}

injectHook();
