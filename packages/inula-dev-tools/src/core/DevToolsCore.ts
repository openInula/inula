/**
 * DevTools 核心层
 * 提供统一的 API 接口和数据处理逻辑
 */

import { InulaVersion, ComponentTreeNode, ComponentDetail, MessageType_V1, MessageType_V2 } from '../comm/types';
import { adapterFactory } from '../adapters';
import { messageService } from '../comm/messageService';

export class DevToolsCore {
  private currentVersion: InulaVersion | null = null;
  private componentTreeCache: ComponentTreeNode[] = [];
  private componentDetailCache: Map<string | number, ComponentDetail> = new Map();

  /**
   * 设置当前版本
   */
  setVersion(version: InulaVersion): void {
    this.currentVersion = version;
  }

  /**
   * 获取当前版本
   */
  getVersion(): InulaVersion | null {
    return this.currentVersion;
  }

  /**
   * 检测 Inula 版本
   */
  detectVersion(): InulaVersion {
    // 检测全局对象
    if (typeof window !== 'undefined') {
      // 检查是否存在 2.0 版本的特征
      const win = window as any;
      
      // 2.0 版本会有特定的全局标记或 API
      if (win.__INULA_NEXT__ || win.__INULA_V2__) {
        this.currentVersion = InulaVersion.V2;
        return InulaVersion.V2;
      }

      // 1.0 版本的检测
      if (win.__INULA_DEV_TOOL_HELPER__) {
        this.currentVersion = InulaVersion.V1;
        return InulaVersion.V1;
      }
    }

    // 默认返回 1.0
    this.currentVersion = InulaVersion.V1;
    return InulaVersion.V1;
  }

  /**
   * 解析组件树数据
   */
  parseComponentTree(rawData: any, version?: InulaVersion): ComponentTreeNode[] {
    const ver = version || this.currentVersion || this.detectVersion();
    
    try {
      const nodes = adapterFactory.parseComponentTree(rawData, ver);
      const tree = adapterFactory.buildTree(nodes, ver);
      this.componentTreeCache = tree;
      return tree;
    } catch (error) {
      console.error('Failed to parse component tree:', error);
      return [];
    }
  }

  /**
   * 解析组件详情
   */
  parseComponentDetail(rawData: any, id: string | number, version?: InulaVersion): ComponentDetail | null {
    const ver = version || this.currentVersion || this.detectVersion();
    
    try {
      const detail = adapterFactory.parseComponentDetail(rawData, id, ver);
      this.componentDetailCache.set(id, detail);
      return detail;
    } catch (error) {
      console.error('Failed to parse component detail:', error);
      return null;
    }
  }

  /**
   * 获取缓存的组件树
   */
  getCachedComponentTree(): ComponentTreeNode[] {
    return this.componentTreeCache;
  }

  /**
   * 获取缓存的组件详情
   */
  getCachedComponentDetail(id: string | number): ComponentDetail | undefined {
    return this.componentDetailCache.get(id);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.componentTreeCache = [];
    this.componentDetailCache.clear();
  }

  /**
   * 请求组件树
   */
  requestComponentTree(tabId?: number): void {
    const version = this.currentVersion || this.detectVersion();
    const messageType = version === InulaVersion.V1 
      ? MessageType_V1.RequestAllVNodeTreeInfos 
      : MessageType_V2.RequestComponentTree;

    const message = messageService.createMessage(
      messageType,
      null,
      'dev-tool-panel',
      { tabId, version }
    );

    messageService.sendToBackground(message);
  }

  /**
   * 请求组件详情
   */
  requestComponentDetail(id: string | number, tabId?: number): void {
    const version = this.currentVersion || this.detectVersion();
    const messageType = version === InulaVersion.V1 
      ? MessageType_V1.RequestComponentAttrs 
      : MessageType_V2.RequestComponentDetail;

    const message = messageService.createMessage(
      messageType,
      { id },
      'dev-tool-panel',
      { tabId, version }
    );

    messageService.sendToBackground(message);
  }

  /**
   * 更新组件属性
   */
  updateComponentProp(id: string | number, propName: string, value: any, tabId?: number): void {
    const version = this.currentVersion || this.detectVersion();
    const messageType = version === InulaVersion.V1 
      ? MessageType_V1.ModifyAttrs 
      : MessageType_V2.UpdateComponentProp;

    const updateData = adapterFactory.formatUpdateData(id, propName, value);

    const message = messageService.createMessage(
      messageType,
      updateData,
      'dev-tool-panel',
      { tabId, version }
    );

    messageService.sendToBackground(message);
  }

  /**
   * 高亮组件
   */
  highlightComponent(id: string | number, tabId?: number): void {
    const version = this.currentVersion || this.detectVersion();
    const messageType = version === InulaVersion.V1 
      ? MessageType_V1.Highlight 
      : MessageType_V2.HighlightComponent;

    const message = messageService.createMessage(
      messageType,
      { id },
      'dev-tool-panel',
      { tabId, version }
    );

    messageService.sendToBackground(message);
  }

  /**
   * 取消高亮
   */
  unhighlightComponent(tabId?: number): void {
    const version = this.currentVersion || this.detectVersion();
    const messageType = version === InulaVersion.V1 
      ? MessageType_V1.RemoveHighlight 
      : MessageType_V2.UnhighlightComponent;

    const message = messageService.createMessage(
      messageType,
      null,
      'dev-tool-panel',
      { tabId, version }
    );

    messageService.sendToBackground(message);
  }

  /**
   * 开始选择元素
   */
  startPickElement(tabId?: number): void {
    const version = this.currentVersion || this.detectVersion();
    const messageType = version === InulaVersion.V1 
      ? MessageType_V1.PickElement 
      : MessageType_V2.SelectElement;

    const message = messageService.createMessage(
      messageType,
      null,
      'dev-tool-panel',
      { tabId, version }
    );

    messageService.sendToBackground(message);
  }

  /**
   * 停止选择元素
   */
  stopPickElement(tabId?: number): void {
    const version = this.currentVersion || this.detectVersion();
    const messageType = version === InulaVersion.V1 
      ? MessageType_V1.StopPickElement 
      : MessageType_V2.StopSelectElement;

    const message = messageService.createMessage(
      messageType,
      null,
      'dev-tool-panel',
      { tabId, version }
    );

    messageService.sendToBackground(message);
  }
}

export const devToolsCore = new DevToolsCore();
