/**
 * Inula 2.0 版本适配器
 * 将 2.0 版本的数据格式转换为统一格式
 */

import { ComponentTreeNode, ComponentDetail, InulaVersion } from '../comm/types';

export class V2Adapter {
  /**
   * 将 2.0 版本的 CompNode 树转换为统一的组件树格式
   */
  parseComponentTree(compNodes: any[]): ComponentTreeNode[] {
    const result: ComponentTreeNode[] = [];
    let idCounter = 0;

    const traverse = (node: any, parentId?: string | number) => {
      if (!node) return;

      // 为节点生成唯一 ID
      const nodeId = node._devToolsId || `comp_${idCounter++}`;
      
      // 获取组件名称
      const name = this.getComponentName(node);
      const type = this.getComponentType(node);

      const treeNode: ComponentTreeNode = {
        id: nodeId,
        name,
        type,
        parentId,
        version: InulaVersion.V2,
        rawData: node,
      };

      result.push(treeNode);

      // 递归处理子组件
      if (node.subComponents && Array.isArray(node.subComponents)) {
        node.subComponents.forEach((child: any) => {
          traverse(child, nodeId);
        });
      }

      // 处理节点中的其他子节点
      if (node.nodes && Array.isArray(node.nodes)) {
        node.nodes.forEach((child: any) => {
          if (this.isComponentNode(child)) {
            traverse(child, nodeId);
          }
        });
      }
    };

    compNodes.forEach(node => traverse(node));
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
   * 将 2.0 版本的组件详情转换为统一格式
   */
  parseComponentDetail(compNode: any, id: string | number): ComponentDetail {
    return {
      id,
      name: this.getComponentName(compNode),
      type: this.getComponentType(compNode),
      props: compNode.props || {},
      state: this.extractState(compNode),
      hooks: this.extractHooks(compNode),
      context: this.extractContext(compNode),
      version: InulaVersion.V2,
      rawData: compNode,
    };
  }

  /**
   * 获取组件名称
   */
  private getComponentName(node: any): string {
    // 尝试从不同位置获取组件名称
    if (node.name) return node.name;
    if (node.type?.name) return node.type.name;
    if (node.fnNode) {
      // 从函数代码中提取名称
      const match = node.fnNode.match(/function\s+(\w+)/);
      if (match) return match[1];
    }
    return 'Anonymous';
  }

  /**
   * 获取组件类型
   */
  private getComponentType(node: any): string {
    if (node.type === 'comp') return 'Component';
    if (node.inulaType !== undefined) {
      // 根据 InulaNodeType 枚举判断
      const typeMap: Record<number, string> = {
        0: 'Component',
        1: 'For',
        2: 'Conditional',
        3: 'Expression',
        4: 'Hook',
        5: 'Context',
        6: 'Children',
        7: 'Fragment',
        8: 'Portal',
        9: 'Suspense',
      };
      return typeMap[node.inulaType] || 'Unknown';
    }
    return 'Component';
  }

  /**
   * 判断是否为组件节点
   */
  private isComponentNode(node: any): boolean {
    return node && (
      node.inulaType === 0 || // CompNode
      node.type === 'comp' ||
      node.subComponents !== undefined
    );
  }

  /**
   * 提取状态信息
   */
  private extractState(compNode: any): Record<string, any> {
    const state: Record<string, any> = {};
    
    // 从 scope 中提取响应式数据
    if (compNode.scope?.reactiveMap) {
      Object.entries(compNode.scope.reactiveMap).forEach(([key, value]) => {
        state[key] = value;
      });
    }

    return state;
  }

  /**
   * 提取 Hooks 信息
   */
  private extractHooks(compNode: any): any[] {
    const hooks: any[] = [];

    // 检查 computations 中的 hook
    if (compNode.computations && Array.isArray(compNode.computations)) {
      compNode.computations.forEach((comp: any, index: number) => {
        if (comp.length === 1) {
          // 这可能是一个 hook
          hooks.push({
            index,
            type: 'Hook',
            value: comp,
          });
        }
      });
    }

    return hooks;
  }

  /**
   * 提取 Context 信息
   */
  private extractContext(compNode: any): Record<string, any> {
    const context: Record<string, any> = {};

    if (compNode.updateContextMap) {
      Object.entries(compNode.updateContextMap).forEach(([key, value]) => {
        context[key] = value;
      });
    }

    return context;
  }

  /**
   * 将统一格式的属性值转换回 2.0 格式用于更新
   */
  formatUpdateData(id: string | number, propName: string, value: any): any {
    return {
      id,
      propName,
      value,
    };
  }
}
