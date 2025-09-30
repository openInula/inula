/**
 * 通信层类型定义
 * 支持 Inula 1.0 和 2.0 版本的消息传递
 */

// 消息来源
export type MessageSource = 
  | 'dev-tool-panel' 
  | 'dev-tool-background' 
  | 'dev-tool-content-script' 
  | 'dev-tool-hook';

// Inula 版本
export enum InulaVersion {
  V1 = '1.0',
  V2 = '2.0',
}

// 消息类型 - 1.0 版本
export enum MessageType_V1 {
  AllVNodeTreeInfos = 'all-vnode-tree-infos',
  ComponentAttrs = 'component-attrs',
  RequestAllVNodeTreeInfos = 'request-all-vnode-tree-infos',
  RequestComponentAttrs = 'request-component-attrs',
  ModifyAttrs = 'modify-attrs',
  InspectDom = 'inspect-dom',
  Highlight = 'highlight',
  RemoveHighlight = 'remove-highlight',
  PickElement = 'pick-element',
  StopPickElement = 'stop-pick-element',
  InulaX = 'inulax',
}

// 消息类型 - 2.0 版本
export enum MessageType_V2 {
  ComponentTree = 'component-tree',
  ComponentDetail = 'component-detail',
  RequestComponentTree = 'request-component-tree',
  RequestComponentDetail = 'request-component-detail',
  UpdateComponentProp = 'update-component-prop',
  InspectElement = 'inspect-element',
  HighlightComponent = 'highlight-component',
  UnhighlightComponent = 'unhighlight-component',
  SelectElement = 'select-element',
  StopSelectElement = 'stop-select-element',
}

// 统一消息格式
export interface DevToolMessage<T = any> {
  type: 'INULA_DEV_TOOLS';
  payload: {
    type: string;
    data?: T;
    tabId?: number;
    version?: InulaVersion;
  };
  from: MessageSource;
}

// 组件树节点 - 统一格式
export interface ComponentTreeNode {
  id: string | number;
  name: string;
  type: string;
  parentId?: string | number;
  children?: ComponentTreeNode[];
  version: InulaVersion;
  // 原始数据（用于特定版本的操作）
  rawData?: any;
}

// 组件详情 - 统一格式
export interface ComponentDetail {
  id: string | number;
  name: string;
  type: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  hooks?: any[];
  context?: Record<string, any>;
  version: InulaVersion;
  // 原始数据
  rawData?: any;
}
