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

import { VersionDetector } from './VersionDetector';
import { FrameworkVersion, FrameworkInfo } from './types';
import { IFrameworkAdapter } from '../adapters/BaseAdapter';
import { V1Adapter } from '../adapters/V1Adapter';
import { V2Adapter } from '../adapters/V2Adapter';
import {
  ComponentTreeNode,
  ComponentAttributes,
  ModifyRequest,
  HighlightInfo,
  PickElementInfo,
} from './types';

/**
 * DevTools 核心类
 * 负责管理版本检测、适配器选择和统一 API
 */
export class DevToolsCore {
  private versionDetector: VersionDetector;
  private adapters: Map<FrameworkVersion, IFrameworkAdapter>;
  private activeAdapter: IFrameworkAdapter | null = null;
  private treeUpdateCallbacks: (() => void)[] = [];

  constructor() {
    this.versionDetector = new VersionDetector();
    this.adapters = new Map();
    this.initialize();
  }

  /**
   * 初始化核心
   */
  private initialize(): void {
    // 监听版本检测
    this.versionDetector.addVersionListener((info: FrameworkInfo) => {
      this.onFrameworkDetected(info);
    });

    // 如果已经检测到版本，立即初始化适配器
    const detectedVersions = this.versionDetector.getDetectedVersions();
    if (detectedVersions.length > 0) {
      this.selectPrimaryAdapter();
    }
  }

  /**
   * 当检测到框架时的处理
   */
  private onFrameworkDetected(info: FrameworkInfo): void {
    console.log(`Framework detected: ${info.version} (${info.versionString})`);

    // 创建对应的适配器
    this.createAdapter(info.version);

    // 如果还没有激活的适配器，选择一个
    if (!this.activeAdapter) {
      this.selectPrimaryAdapter();
    }
  }

  /**
   * 创建适配器
   */
  private createAdapter(version: FrameworkVersion): void {
    if (this.adapters.has(version)) {
      return; // 已存在
    }

    let adapter: IFrameworkAdapter | null = null;

    switch (version) {
      case FrameworkVersion.V1:
        adapter = new V1Adapter();
        break;
      case FrameworkVersion.V2:
        adapter = new V2Adapter();
        break;
      default:
        console.warn(`Unknown framework version: ${version}`);
        return;
    }

    if (adapter) {
      adapter.initialize();
      
      // 监听树更新
      adapter.onTreeUpdate(() => {
        this.notifyTreeUpdate();
      });

      this.adapters.set(version, adapter);
    }
  }

  /**
   * 选择主要适配器
   */
  private selectPrimaryAdapter(): void {
    const primaryVersion = this.versionDetector.getPrimaryVersion();
    const adapter = this.adapters.get(primaryVersion);
    
    if (adapter) {
      this.activeAdapter = adapter;
      console.log(`Active adapter set to: ${primaryVersion}`);
    }
  }

  /**
   * 获取当前激活的适配器
   */
  private getActiveAdapter(): IFrameworkAdapter {
    if (!this.activeAdapter) {
      throw new Error('No active adapter. Framework not detected.');
    }
    return this.activeAdapter;
  }

  /**
   * 切换适配器
   */
  public switchAdapter(version: FrameworkVersion): boolean {
    const adapter = this.adapters.get(version);
    if (adapter) {
      this.activeAdapter = adapter;
      this.notifyTreeUpdate();
      return true;
    }
    return false;
  }

  /**
   * 获取检测到的框架版本列表
   */
  public getDetectedVersions(): FrameworkVersion[] {
    return this.versionDetector.getDetectedVersions();
  }

  /**
   * 获取当前使用的版本
   */
  public getCurrentVersion(): FrameworkVersion {
    return this.versionDetector.getPrimaryVersion();
  }

  /**
   * 获取组件树
   */
  public getComponentTree(): ComponentTreeNode[] {
    try {
      return this.getActiveAdapter().getComponentTree();
    } catch (error) {
      console.error('Failed to get component tree:', error);
      return [];
    }
  }

  /**
   * 获取组件属性
   */
  public getComponentAttributes(id: number | string): ComponentAttributes | null {
    try {
      return this.getActiveAdapter().getComponentAttributes(id);
    } catch (error) {
      console.error('Failed to get component attributes:', error);
      return null;
    }
  }

  /**
   * 修改组件属性
   */
  public modifyComponentAttribute(request: ModifyRequest): boolean {
    try {
      return this.getActiveAdapter().modifyComponentAttribute(request);
    } catch (error) {
      console.error('Failed to modify component attribute:', error);
      return false;
    }
  }

  /**
   * 高亮组件
   */
  public highlightComponent(id: number | string): HighlightInfo | null {
    try {
      return this.getActiveAdapter().highlightComponent(id);
    } catch (error) {
      console.error('Failed to highlight component:', error);
      return null;
    }
  }

  /**
   * 移除高亮
   */
  public removeHighlight(): void {
    try {
      this.getActiveAdapter().removeHighlight();
    } catch (error) {
      console.error('Failed to remove highlight:', error);
    }
  }

  /**
   * 开始选择元素
   */
  public startPickElement(callback: (info: PickElementInfo) => void): void {
    try {
      this.getActiveAdapter().startPickElement(callback);
    } catch (error) {
      console.error('Failed to start pick element:', error);
    }
  }

  /**
   * 停止选择元素
   */
  public stopPickElement(): void {
    try {
      this.getActiveAdapter().stopPickElement();
    } catch (error) {
      console.error('Failed to stop pick element:', error);
    }
  }

  /**
   * 查看组件源代码
   */
  public viewComponentSource(id: number | string): void {
    try {
      this.getActiveAdapter().viewComponentSource(id);
    } catch (error) {
      console.error('Failed to view component source:', error);
    }
  }

  /**
   * 打印组件数据
   */
  public logComponentData(id: number | string): void {
    try {
      this.getActiveAdapter().logComponentData(id);
    } catch (error) {
      console.error('Failed to log component data:', error);
    }
  }

  /**
   * 复制到控制台
   */
  public copyToConsole(id: number | string, path: (string | number)[], attrName: string): void {
    try {
      this.getActiveAdapter().copyToConsole(id, path, attrName);
    } catch (error) {
      console.error('Failed to copy to console:', error);
    }
  }

  /**
   * 存储为全局变量
   */
  public storeAsGlobal(id: number | string, path: (string | number)[], attrName: string): void {
    try {
      this.getActiveAdapter().storeAsGlobal(id, path, attrName);
    } catch (error) {
      console.error('Failed to store as global:', error);
    }
  }

  /**
   * 监听组件树更新
   */
  public onTreeUpdate(callback: () => void): () => void {
    this.treeUpdateCallbacks.push(callback);
    return () => {
      const index = this.treeUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.treeUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 通知树更新
   */
  private notifyTreeUpdate(): void {
    this.treeUpdateCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in tree update callback:', error);
      }
    });
  }

  /**
   * 销毁核心
   */
  public destroy(): void {
    this.adapters.forEach(adapter => adapter.destroy());
    this.adapters.clear();
    this.activeAdapter = null;
    this.treeUpdateCallbacks = [];
  }
}

