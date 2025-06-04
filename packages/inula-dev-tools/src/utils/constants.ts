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

// panel 页面打开后初始化连接标志
export const InitDevToolPageConnection = 'init dev tool page connection';
// background 解析全部 root VNodes 标志
export const RequestAllVNodeTreeInfos = 'request all vNodes tree infos';
// vNodes 全部树解析结果标志
export const AllVNodeTreeInfos = 'vNode trees infos';
// 一棵树的解析
export const OneVNodeTreeInfos = 'one vNode tree';
// 获取组件属性
export const RequestComponentAttrs = 'get component attrs';
// 返回组件属性
export const ComponentAttrs = 'component attrs';

export const ModifyAttrs = 'modify attrs';

export const ModifyProps = 'modify props';

export const ModifyState = 'modify state';

export const ModifyHooks = 'modify hooks';

export const InspectDom = 'inspect component dom';

export const LogComponentData = 'log component data';

export const CopyComponentAttr = 'copy component attr';
// 传递消息来源标志
export const DevToolPanel = 'dev tool panel';

export const DevToolBackground = 'dev tool background';

export const DevToolContentScript = 'dev tool content script';

export const DevToolHook = 'dev tool hook';

export const GetStores = 'get stores';

// 高亮显示与消除
export const Highlight = 'highlight';
export const RemoveHighlight = 'remove highlight';

// 跳转元素代码位置
export const ViewSource = 'view source';

// 选择页面元素
export const PickElement = 'pick element';
export const StopPickElement = 'stop pick element';

// 复制和存为全局变量
export const CopyToConsole = 'copy to console';
export const StorageValue = 'storage value';
