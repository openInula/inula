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

import { BaseAdapter } from './BaseAdapter';
import {
  ComponentTreeNode,
  ComponentAttributes,
  ModifyRequest,
  HighlightInfo,
  PickElementInfo,
  NodeType,
  HookInfo,
} from '../core/types';

/**
 * V1 适配器 - 适配 @inula/ (VNode架构)
 */
export class V1Adapter extends BaseAdapter {
  private hook: any;
  private VNodeToIdMap: Map<any, number>;
  private idToVNodeMap: Map<number, any>;
  private helper: any;
  private nextId: number = 1;

  constructor() {
    super();
    this.hook = window.__INULA_DEV_HOOK__;
    this.VNodeToIdMap = new Map();
    this.idToVNodeMap = new Map();
  }

  /**
   * 初始化适配器
   */
  initialize(): void {
    if (!this.hook) {
      console.warn('V1Adapter: __INULA_DEV_HOOK__ not found');
      return;
    }

    // 获取 helper (在 inula 框架内部注册的)
    const renderers = this.hook.renders;
    if (renderers && Object.keys(renderers).length > 0) {
      const rendererId = Object.keys(renderers)[0];
      this.helper = renderers[rendererId];
    }

    // 监听树的变化
    this.hook.subscribe?.('treeUpdate', () => {
      this.notifyTreeUpdate();
    });
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.VNodeToIdMap.clear();
    this.idToVNodeMap.clear();
    this.treeUpdateCallbacks = [];
  }

  /**
   * 获取或创建 VNode 的 ID
   */
  private getVNodeId(vNode: any): number {
    if (!this.VNodeToIdMap.has(vNode)) {
      const id = this.nextId++;
      this.VNodeToIdMap.set(vNode, id);
      this.idToVNodeMap.set(id, vNode);
    }
    return this.VNodeToIdMap.get(vNode)!;
  }

  /**
   * 通过 ID 查找 VNode
   */
  private queryVNode(id: number): any {
    return this.idToVNodeMap.get(id);
  }

  /**
   * 清理 VNode
   */
  private clearVNode(vNode: any): void {
    const id = this.VNodeToIdMap.get(vNode);
    if (id !== undefined) {
      this.VNodeToIdMap.delete(vNode);
      this.idToVNodeMap.delete(id);
    }
  }

  /**
   * 解析 VNode 树
   */
  private parseVNodeTree(vNode: any): ComponentTreeNode | null {
    if (!vNode) return null;

    const id = this.getVNodeId(vNode);
    const name = this.getComponentName(vNode);
    const type = this.getNodeType(vNode);

    const node: ComponentTreeNode = {
      id,
      name,
      type,
      key: vNode.key,
    };

    // 解析子节点
    const children: ComponentTreeNode[] = [];
    if (this.helper?.travelVNodeTree) {
      this.helper.travelVNodeTree(vNode, (childVNode: any) => {
        if (childVNode !== vNode && this.isValidVNode(childVNode)) {
          const childNode = this.parseVNodeTree(childVNode);
          if (childNode) {
            children.push(childNode);
          }
        }
      });
    }

    if (children.length > 0) {
      node.children = children;
    }

    return node;
  }

  /**
   * 获取组件名称
   */
  private getComponentName(vNode: any): string {
    if (vNode.type) {
      if (typeof vNode.type === 'string') {
        return vNode.type;
      }
      if (typeof vNode.type === 'function') {
        return vNode.type.displayName || vNode.type.name || 'Component';
      }
      if (typeof vNode.type === 'object') {
        return vNode.type.displayName || vNode.type.name || 'Component';
      }
    }
    return 'Unknown';
  }

  /**
   * 获取节点类型
   */
  private getNodeType(vNode: any): NodeType {
    const tag = vNode.tag;
    
    // 根据 VNodeTags 判断类型
    if (tag === 0 || tag === 1 || tag === 2) {
      // FunctionComponent, ClassComponent, IncompleteClassComponent
      return NodeType.Component;
    } else if (tag === 3) {
      // DomComponent
      return NodeType.Element;
    } else if (tag === 4) {
      // TextComponent
      return NodeType.Text;
    } else if (tag === 11) {
      // Fragment
      return NodeType.Fragment;
    } else if (tag === 10) {
      // Portal
      return NodeType.Portal;
    } else if (tag === 7) {
      // ContextProvider
      return NodeType.Context;
    } else if (tag === 9) {
      // MemoComponent
      return NodeType.Memo;
    } else if (tag === 8) {
      // ForwardRef
      return NodeType.ForwardRef;
    }
    
    return NodeType.Component;
  }

  /**
   * 验证 VNode 是否有效
   */
  private isValidVNode(vNode: any): boolean {
    return vNode && typeof vNode === 'object';
  }

  /**
   * 获取组件树
   */
  getComponentTree(): ComponentTreeNode[] {
    if (!this.hook) {
      return [];
    }

    // 从 hook 中获取所有根节点
    const roots = [];
    
    // 尝试通过不同的方式获取根节点
    if (this.hook.roots) {
      roots.push(...this.hook.roots);
    } else if (this.hook.getRoot) {
      const root = this.hook.getRoot();
      if (root) roots.push(root);
    }

    return roots
      .map((root: any) => this.parseVNodeTree(root))
      .filter((node: ComponentTreeNode | null): node is ComponentTreeNode => node !== null);
  }

  /**
   * 获取组件属性
   */
  getComponentAttributes(id: number | string): ComponentAttributes | null {
    const vNode = this.queryVNode(Number(id));
    if (!vNode) {
      return null;
    }

    const attrs: ComponentAttributes = {
      id,
    };

    // Props
    if (vNode.props && Object.keys(vNode.props).length > 0) {
      attrs.props = { ...vNode.props };
    }

    // State (类组件)
    if (vNode.state && Object.keys(vNode.state).length > 0) {
      attrs.state = { ...vNode.state };
    }

    // Hooks (函数组件)
    if (vNode.hooks && Array.isArray(vNode.hooks) && vNode.hooks.length > 0) {
      attrs.hooks = this.parseHooks(vNode.hooks);
    }

    return attrs;
  }

  /**
   * 解析 Hooks
   */
  private parseHooks(hooks: any[]): HookInfo[] {
    if (!this.helper?.getHookInfo) {
      return [];
    }

    const hookInfos: HookInfo[] = [];
    hooks.forEach((hook, index) => {
      const info = this.helper.getHookInfo(hook);
      if (info) {
        hookInfos.push({
          name: info.name,
          index: info.hIndex ?? index,
          value: info.value,
        });
      }
    });

    return hookInfos;
  }

  /**
   * 修改组件属性
   */
  modifyComponentAttribute(request: ModifyRequest): boolean {
    const vNode = this.queryVNode(Number(request.id));
    if (!vNode || !this.helper) {
      return false;
    }

    try {
      if (request.type === 'props') {
        const nextProps = this.calculateNextValue(vNode.props, request.value, request.path);
        this.helper.updateProps(vNode, nextProps);
        return true;
      } else if (request.type === 'state') {
        const nextState = this.calculateNextValue(vNode.state, request.value, request.path);
        this.helper.updateState(vNode, nextState);
        return true;
      } else if (request.type === 'hooks') {
        const hIndex = request.path[0];
        const hook = vNode.hooks?.[hIndex];
        if (hook) {
          const hookInfo = this.helper.getHookInfo(hook);
          if (hookInfo) {
            const nextValue = this.calculateNextValue(
              hookInfo.value,
              request.value,
              request.path.slice(1)
            );
            this.helper.updateHooks(vNode, hIndex, nextValue);
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Failed to modify component attribute:', error);
    }

    return false;
  }

  /**
   * 计算下一个值
   */
  private calculateNextValue(editValue: any, value: any, path: (string | number)[]): any {
    const editValueType = typeof editValue;

    if (
      editValueType === 'string' ||
      editValueType === 'undefined' ||
      editValueType === 'boolean'
    ) {
      return value;
    } else if (editValueType === 'number') {
      const numValue = Number(value);
      return isNaN(numValue) ? value : numValue;
    } else if (editValueType === 'object') {
      if (editValue === null) {
        return value;
      } else {
        const newValue = Array.isArray(editValue) ? [...editValue] : { ...editValue };
        let attr = newValue;
        for (let i = 0; i < path.length - 1; i++) {
          attr = attr[path[i]];
        }
        attr[path[path.length - 1]] = value;
        return newValue;
      }
    }

    return value;
  }

  /**
   * 高亮组件
   */
  highlightComponent(id: number | string): HighlightInfo | null {
    // V1 的高亮功能由 injector 中的 showHighlight 实现
    // 这里只返回信息，实际高亮操作通过消息传递
    return { id };
  }

  /**
   * 移除高亮
   */
  removeHighlight(): void {
    // 通过消息传递实现
  }

  /**
   * 开始选择元素
   */
  startPickElement(callback: (info: PickElementInfo) => void): void {
    // 通过消息传递实现
  }

  /**
   * 停止选择元素
   */
  stopPickElement(): void {
    // 通过消息传递实现
  }

  /**
   * 查看组件源代码
   */
  viewComponentSource(id: number | string): void {
    const vNode = this.queryVNode(Number(id));
    if (vNode) {
      (globalThis as any).$type = vNode.type;
    }
  }

  /**
   * 打印组件数据
   */
  logComponentData(id: number | string): void {
    const vNode = this.queryVNode(Number(id));
    if (vNode && this.helper?.getComponentInfo) {
      const info = this.helper.getComponentInfo(vNode);
      console.log('vNode:', vNode);
      console.log('Component Info:', info);
    }
  }

  /**
   * 复制到控制台
   */
  copyToConsole(id: number | string, path: (string | number)[], attrName: string): void {
    const vNode = this.queryVNode(Number(id));
    if (!vNode) {
      console.warn(`Could not find vNode with id "${id}"`);
      return;
    }

    const value = this.getValueByPath(vNode, path, attrName);
    if (attrName === 'Hooks') {
      console.log(`Hook ${path[0]}:`, value);
    } else {
      console.log(`${path[path.length - 1]}:`, value);
    }
  }

  /**
   * 存储为全局变量
   */
  storeAsGlobal(id: number | string, path: (string | number)[], attrName: string): void {
    const vNode = this.queryVNode(Number(id));
    if (!vNode) {
      console.warn(`Could not find vNode with id "${id}"`);
      return;
    }

    const value = this.getValueByPath(vNode, path, attrName);
    const key = `$InulaTemp${Date.now()}`;
    (window as any)[key] = value;
    console.log(key);
    console.log(value);
  }

  /**
   * 通过路径获取值
   */
  private getValueByPath(vNode: any, path: (string | number)[], attrName: string): any {
    if (attrName === 'Props') {
      return path.reduce((prev, curr) => prev?.[curr], vNode.props);
    } else if (attrName === 'Hooks') {
      if (path.length > 1) {
        return path.reduce((prev, curr) => prev?.[curr], vNode.hooks);
      }
      return vNode.hooks?.[path[0]];
    } else if (attrName === 'State') {
      return path.reduce((prev, curr) => prev?.[curr], vNode.state);
    }
    return undefined;
  }
}

