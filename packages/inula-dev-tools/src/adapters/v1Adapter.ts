/**
 * Inula 1.0 版本适配器
 * 将 1.0 版本的数据格式转换为统一格式
 */

import { ComponentTreeNode, ComponentDetail, InulaVersion } from '../comm/types';

export class V1Adapter {
  /**
   * 将 1.0 版本的 VNode 树转换为统一的组件树格式
   */
  parseComponentTree(vNodeData: any[]): ComponentTreeNode[] {
    const result: ComponentTreeNode[] = [];
    
    // 1.0 版本的数据格式：[id, nameObj, parentId, key, ...]
    for (let i = 0; i < vNodeData.length; i += 4) {
      const id = vNodeData[i];
      const nameObj = vNodeData[i + 1];
      const parentId = vNodeData[i + 2];
      const key = vNodeData[i + 3];

      const node: ComponentTreeNode = {
        id,
        name: typeof nameObj === 'object' ? nameObj.itemName : nameObj,
        type: typeof nameObj === 'object' && nameObj.badge?.length > 0 
          ? nameObj.badge[0] 
          : 'Component',
        parentId: parentId || undefined,
        version: InulaVersion.V1,
        rawData: {
          id,
          nameObj,
          parentId,
          key,
        },
      };

      result.push(node);
    }

    return result;
  }

  /**
   * 构建树形结构
   */
  buildTree(nodes: ComponentTreeNode[]): ComponentTreeNode[] {
    const nodeMap = new Map<string | number, ComponentTreeNode>();
    const roots: ComponentTreeNode[] = [];

    // 创建节点映射
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // 构建父子关系
    nodes.forEach(node => {
      const currentNode = nodeMap.get(node.id)!;
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(currentNode);
        } else {
          roots.push(currentNode);
        }
      } else {
        roots.push(currentNode);
      }
    });

    return roots;
  }

  /**
   * 将 1.0 版本的组件属性转换为统一格式
   */
  parseComponentDetail(attrs: any, id: string | number): ComponentDetail {
    return {
      id,
      name: attrs.name || 'Unknown',
      type: attrs.type || 'Component',
      props: this.parseAttrs(attrs.parsedProps),
      state: this.parseAttrs(attrs.parsedState),
      hooks: attrs.parsedHooks,
      version: InulaVersion.V1,
      rawData: attrs,
    };
  }

  /**
   * 解析属性数组
   */
  private parseAttrs(attrs: any[]): Record<string, any> {
    if (!attrs || !Array.isArray(attrs)) {
      return {};
    }

    const result: Record<string, any> = {};
    attrs.forEach(attr => {
      if (attr && attr.itemName) {
        result[attr.itemName] = attr.value;
      }
    });

    return result;
  }

  /**
   * 将统一格式的属性值转换回 1.0 格式用于更新
   */
  formatUpdateData(id: string | number, attrName: string, path: string[], value: any): any {
    return {
      id,
      itemName: attrName,
      path,
      value,
    };
  }
}
