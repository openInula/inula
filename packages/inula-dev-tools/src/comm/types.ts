/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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

/**
 * 消息来源标识
 */
export enum MessageSource {
  DevToolHook = 'INULA_DEV_HOOK',
  ContentScript = 'INULA_DEV_CONTENT_SCRIPT',
  DevToolsPanel = 'INULA_DEV_PANEL',
}

/**
 * 消息类型
 */
export enum MessageType {
  // 通用消息
  FrameworkDetected = 'framework-detected',
  VersionInfo = 'version-info',
  
  // 组件树相关
  RequestComponentTree = 'request-component-tree',
  ComponentTreeData = 'component-tree-data',
  
  // 组件属性相关
  RequestComponentAttrs = 'request-component-attrs',
  ComponentAttrsData = 'component-attrs-data',
  
  // 修改操作
  ModifyProps = 'modify-props',
  ModifyState = 'modify-state',
  ModifyHooks = 'modify-hooks',
  
  // 调试功能
  InspectElement = 'inspect-element',
  Highlight = 'highlight',
  RemoveHighlight = 'remove-highlight',
  PickElement = 'pick-element',
  StopPickElement = 'stop-pick-element',
  ViewSource = 'view-source',
  LogComponentData = 'log-component-data',
  CopyToConsole = 'copy-to-console',
  StorageValue = 'storage-value',
}

/**
 * 消息结构
 */
export interface DevToolMessage<T = any> {
  source: MessageSource;
  type: MessageType | string;
  data?: T;
  timestamp?: number;
}

/**
 * 消息处理器
 */
export type MessageHandler<T = any> = (data: T) => void | Promise<void>;

/**
 * 消息总线接口
 */
export interface MessageBus {
  /**
   * 发送消息
   */
  send<T = any>(type: MessageType | string, data?: T): void;
  
  /**
   * 监听消息
   */
  on<T = any>(type: MessageType | string, handler: MessageHandler<T>): () => void;
  
  /**
   * 移除监听
   */
  off<T = any>(type: MessageType | string, handler: MessageHandler<T>): void;
  
  /**
   * 清除所有监听
   */
  clear(): void;
}

