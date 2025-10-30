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
 * V2 适配器 - 适配 @next-packages/ (CompNode架构)
 */
export class V2Adapter extends BaseAdapter {
  private hook: any;
  private compNodeToIdMap: Map<any, number>;
  private idToCompNodeMap: Map<number, any>;
  private nextId: number = 1;

  constructor() {
    super();
    this.hook = window.__INULA_NEXT_DEV_HOOK__;
    this.compNodeToIdMap = new Map();
    this.idToCompNodeMap = new Map();
  }

  /**
   * 初始化适配器
   */
  initialize(): void {
    if (!this.hook) {
      console.warn('V2Adapter: __INULA_NEXT_DEV_HOOK__ not found');
      return;
    }

    // 监听树的变化
    this.hook.subscribe?.('treeUpdate', () => {
      this.notifyTreeUpdate();
    });

    console.log('V2Adapter initialized');
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.compNodeToIdMap.clear();
    this.idToCompNodeMap.clear();
    this.treeUpdateCallbacks = [];
  }

  /**
   * 获取或创建 CompNode 的 ID
   */
  private getCompNodeId(compNode: any): number {
    if (!this.compNodeToIdMap.has(compNode)) {
      const id = this.nextId++;
      this.compNodeToIdMap.set(compNode, id);
      this.idToCompNodeMap.set(id, compNode);
    }
    return this.compNodeToIdMap.get(compNode)!;
  }

  /**
   * 通过 ID 查找 CompNode
   */
  private queryCompNode(id: number): any {
    return this.idToCompNodeMap.get(id);
  }

  /**
   * 清理 CompNode
   */
  private clearCompNode(compNode: any): void {
    const id = this.compNodeToIdMap.get(compNode);
    if (id !== undefined) {
      this.compNodeToIdMap.delete(compNode);
      this.idToCompNodeMap.delete(id);
    }
  }

  /**
   * 解析 CompNode 树
   */
  private parseCompNodeTree(compNode: any): ComponentTreeNode | null {
    if (!compNode) return null;

    const id = this.getCompNodeId(compNode);
    const name = this.getComponentName(compNode);
    const type = this.getNodeType(compNode);

    const node: ComponentTreeNode = {
      id,
      name,
      type,
    };

    // 解析子组件
    const children: ComponentTreeNode[] = [];
    
    // 解析 subComponents
    if (compNode.subComponents && Array.isArray(compNode.subComponents)) {
      compNode.subComponents.forEach((child: any) => {
        const childNode = this.parseCompNodeTree(child);
        if (childNode) {
          children.push(childNode);
        }
      });
    }

    // 解析 slices (children)
    if (compNode.slices && Array.isArray(compNode.slices)) {
      compNode.slices.forEach((slice: any) => {
        if (slice && slice.inulaType === 0) { // InulaNodeType.Comp
          const childNode = this.parseCompNodeTree(slice);
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
  private getComponentName(compNode: any): string {
    if (compNode.type) {
      if (typeof compNode.type === 'function') {
        return compNode.type.displayName || compNode.type.name || 'Component';
      }
    }

    // 根据 inulaType 判断
    if (compNode.inulaType === 0) {
      return compNode.type?.name || 'Component';
    } else if (compNode.inulaType === 1) {
      return compNode.tag || 'Element';
    } else if (compNode.inulaType === 2) {
      return 'Text';
    }

    return 'Unknown';
  }

  /**
   * 获取节点类型
   */
  private getNodeType(compNode: any): NodeType {
    // 根据 InulaNodeType 判断
    if (compNode.inulaType === 0) {
      // CompNode
      return NodeType.Component;
    } else if (compNode.inulaType === 1) {
      // HTMLNode
      return NodeType.Element;
    } else if (compNode.inulaType === 2) {
      // TextNode
      return NodeType.Text;
    }

    return NodeType.Component;
  }

  /**
   * 获取组件树
   */
  getComponentTree(): ComponentTreeNode[] {
    if (!this.hook) {
      return [];
    }

    // 从 hook 中获取所有根组件节点
    const roots = [];

    if (this.hook.roots) {
      roots.push(...this.hook.roots);
    } else if (this.hook.getRoot) {
      const root = this.hook.getRoot();
      if (root) roots.push(root);
    }

    return roots
      .map((root: any) => this.parseCompNodeTree(root))
      .filter((node: ComponentTreeNode | null): node is ComponentTreeNode => node !== null);
  }

  /**
   * 获取组件属性
   */
  getComponentAttributes(id: number | string): ComponentAttributes | null {
    const compNode = this.queryCompNode(Number(id));
    if (!compNode) {
      return null;
    }

    const attrs: ComponentAttributes = {
      id,
    };

    // Props
    if (compNode.props && Object.keys(compNode.props).length > 0) {
      attrs.props = { ...compNode.props };
    }

    // CompNode 使用响应式状态，可以通过 computations 访问
    // 这里简化处理，直接显示 props
    
    // 如果有 updatePropMap，显示可更新的属性
    if (compNode.updatePropMap) {
      if (!attrs.props) attrs.props = {};
      Object.keys(compNode.updatePropMap).forEach(key => {
        if (!attrs.props![key]) {
          attrs.props![key] = compNode.props?.[key];
        }
      });
    }

    return attrs;
  }

  /**
   * 修改组件属性
   */
  modifyComponentAttribute(request: ModifyRequest): boolean {
    const compNode = this.queryCompNode(Number(request.id));
    if (!compNode) {
      return false;
    }

    try {
      if (request.type === 'props') {
        // 对于 V2，我们需要触发 wave 来更新
        const propName = request.path[0] as string;
        if (compNode.updatePropMap && compNode.updatePropMap[propName]) {
          const [updateFunc, waveBits] = compNode.updatePropMap[propName];
          const newValue = this.calculateNextValue(
            compNode.props?.[propName],
            request.value,
            request.path.slice(1)
          );
          compNode.wave(updateFunc(newValue), waveBits);
          return true;
        } else {
          // 直接更新 props
          if (!compNode.props) compNode.props = {};
          this.setValueByPath(compNode.props, request.path, request.value);
          // 触发更新
          if (compNode.update) {
            compNode.update();
          }
          return true;
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
    if (path.length === 0) {
      return value;
    }

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
   * 通过路径设置值
   */
  private setValueByPath(obj: any, path: (string | number)[], value: any): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  /**
   * 高亮组件
   */
  highlightComponent(id: number | string): HighlightInfo | null {
    const compNode = this.queryCompNode(Number(id));
    if (!compNode) {
      return null;
    }

    // 查找对应的 DOM 元素
    const element = this.findDOMElement(compNode);
    if (element) {
      return {
        id,
        bounds: element.getBoundingClientRect(),
      };
    }

    return { id };
  }

  /**
   * 查找 CompNode 对应的 DOM 元素
   */
  private findDOMElement(compNode: any): HTMLElement | null {
    // 如果是 HTMLNode，直接返回
    if (compNode.inulaType === 1 && compNode.node) {
      return compNode.node as HTMLElement;
    }

    // 递归查找第一个 HTMLNode
    if (compNode.nodes && Array.isArray(compNode.nodes)) {
      for (const node of compNode.nodes) {
        const element = this.findDOMElement(node);
        if (element) return element;
      }
    }

    if (compNode.slices && Array.isArray(compNode.slices)) {
      for (const slice of compNode.slices) {
        const element = this.findDOMElement(slice);
        if (element) return element;
      }
    }

    return null;
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
    const compNode = this.queryCompNode(Number(id));
    if (compNode) {
      (globalThis as any).$type = compNode.type;
    }
  }

  /**
   * 打印组件数据
   */
  logComponentData(id: number | string): void {
    const compNode = this.queryCompNode(Number(id));
    if (compNode) {
      console.log('CompNode:', compNode);
      console.log('Props:', compNode.props);
      console.log('SubComponents:', compNode.subComponents);
    }
  }

  /**
   * 复制到控制台
   */
  copyToConsole(id: number | string, path: (string | number)[], attrName: string): void {
    const compNode = this.queryCompNode(Number(id));
    if (!compNode) {
      console.warn(`Could not find compNode with id "${id}"`);
      return;
    }

    const value = this.getValueByPath(compNode, path, attrName);
    console.log(`${path[path.length - 1]}:`, value);
  }

  /**
   * 存储为全局变量
   */
  storeAsGlobal(id: number | string, path: (string | number)[], attrName: string): void {
    const compNode = this.queryCompNode(Number(id));
    if (!compNode) {
      console.warn(`Could not find compNode with id "${id}"`);
      return;
    }

    const value = this.getValueByPath(compNode, path, attrName);
    const key = `$InulaTemp${Date.now()}`;
    (window as any)[key] = value;
    console.log(key);
    console.log(value);
  }

  /**
   * 通过路径获取值
   */
  private getValueByPath(compNode: any, path: (string | number)[], attrName: string): any {
    if (attrName === 'Props') {
      return path.reduce((prev, curr) => prev?.[curr], compNode.props);
    }
    return undefined;
  }
}

