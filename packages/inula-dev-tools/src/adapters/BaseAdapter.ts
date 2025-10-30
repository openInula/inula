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

import {
  ComponentTreeNode,
  ComponentAttributes,
  ModifyRequest,
  HighlightInfo,
  PickElementInfo,
} from '../core/types';

/**
 * 适配器基类
 * 定义了所有版本适配器必须实现的接口
 */
export interface IFrameworkAdapter {
  /**
   * 初始化适配器
   */
  initialize(): void;

  /**
   * 销毁适配器
   */
  destroy(): void;

  /**
   * 获取组件树
   */
  getComponentTree(): ComponentTreeNode[];

  /**
   * 获取组件属性
   */
  getComponentAttributes(id: number | string): ComponentAttributes | null;

  /**
   * 修改组件属性
   */
  modifyComponentAttribute(request: ModifyRequest): boolean;

  /**
   * 高亮组件对应的 DOM 元素
   */
  highlightComponent(id: number | string): HighlightInfo | null;

  /**
   * 移除高亮
   */
  removeHighlight(): void;

  /**
   * 开始选择元素
   */
  startPickElement(callback: (info: PickElementInfo) => void): void;

  /**
   * 停止选择元素
   */
  stopPickElement(): void;

  /**
   * 查看组件源代码
   */
  viewComponentSource(id: number | string): void;

  /**
   * 打印组件数据到控制台
   */
  logComponentData(id: number | string): void;

  /**
   * 复制值到控制台
   */
  copyToConsole(id: number | string, path: (string | number)[], attrName: string): void;

  /**
   * 存储值为全局变量
   */
  storeAsGlobal(id: number | string, path: (string | number)[], attrName: string): void;

  /**
   * 监听组件树更新
   */
  onTreeUpdate(callback: () => void): () => void;
}

/**
 * 适配器基类实现
 */
export abstract class BaseAdapter implements IFrameworkAdapter {
  protected treeUpdateCallbacks: (() => void)[] = [];

  abstract initialize(): void;
  abstract destroy(): void;
  abstract getComponentTree(): ComponentTreeNode[];
  abstract getComponentAttributes(id: number | string): ComponentAttributes | null;
  abstract modifyComponentAttribute(request: ModifyRequest): boolean;
  abstract highlightComponent(id: number | string): HighlightInfo | null;
  abstract removeHighlight(): void;
  abstract startPickElement(callback: (info: PickElementInfo) => void): void;
  abstract stopPickElement(): void;
  abstract viewComponentSource(id: number | string): void;
  abstract logComponentData(id: number | string): void;
  abstract copyToConsole(id: number | string, path: (string | number)[], attrName: string): void;
  abstract storeAsGlobal(id: number | string, path: (string | number)[], attrName: string): void;

  /**
   * 监听组件树更新
   */
  onTreeUpdate(callback: () => void): () => void {
    this.treeUpdateCallbacks.push(callback);
    return () => {
      const index = this.treeUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.treeUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 触发组件树更新
   */
  protected notifyTreeUpdate(): void {
    this.treeUpdateCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in tree update callback:', error);
      }
    });
  }
}

