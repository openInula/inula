/**
 * Inula 2.0 版本的调试钩子
 * 注入到页面中，收集组件信息并发送给 DevTools
 */

import { InulaVersion } from '../comm/types';

export class V2Hook {
  private compNodes: Map<string, any> = new Map();
  private rootNodes: any[] = [];
  private idCounter = 0;

  /**
   * 初始化钩子
   */
  init(): void {
    if (typeof window === 'undefined') return;

    const win = window as any;

    // 标记为 2.0 版本
    win.__INULA_V2__ = true;
    win.__INULA_COMP_NODES__ = this.compNodes;

    // 拦截 CompNode 的创建
    this.hookCompNodeCreation();

    // 拦截 render 函数
    this.hookRender();

    console.log('[Inula DevTools] V2 Hook initialized');
  }

  /**
   * 拦截 CompNode 创建
   */
  private hookCompNodeCreation(): void {
    const win = window as any;
    
    // 尝试拦截 compBuilder 函数
    if (win.compBuilder) {
      const originalCompBuilder = win.compBuilder;
      win.compBuilder = (...args: any[]) => {
        const comp = originalCompBuilder(...args);
        this.registerCompNode(comp);
        return comp;
      };
    }

    // 尝试拦截 createCompNode 函数
    if (win.createCompNode) {
      const originalCreateCompNode = win.createCompNode;
      win.createCompNode = (...args: any[]) => {
        const comp = originalCreateCompNode(...args);
        this.registerCompNode(comp);
        return comp;
      };
    }
  }

  /**
   * 拦截 render 函数
   */
  private hookRender(): void {
    const win = window as any;
    
    if (win.render) {
      const originalRender = win.render;
      win.render = (compNode: any, container: HTMLElement) => {
        // 记录根节点
        this.rootNodes.push(compNode);
        this.registerCompNode(compNode);
        
        const result = originalRender(compNode, container);
        
        // 渲染完成后发送组件树信息
        this.sendComponentTree();
        
        return result;
      };
    }
  }

  /**
   * 注册组件节点
   */
  private registerCompNode(comp: any): void {
    if (!comp) return;

    // 为组件生成唯一 ID
    if (!comp._devToolsId) {
      comp._devToolsId = `comp_${this.idCounter++}`;
    }

    this.compNodes.set(comp._devToolsId, comp);

    // 递归注册子组件
    if (comp.subComponents && Array.isArray(comp.subComponents)) {
      comp.subComponents.forEach((child: any) => {
        this.registerCompNode(child);
      });
    }
  }

  /**
   * 收集组件树信息
   */
  private collectComponentTree(): any[] {
    const result: any[] = [];

    const traverse = (node: any, parentId?: string) => {
      if (!node) return;

      const nodeInfo = {
        id: node._devToolsId,
        type: 'comp',
        name: this.getComponentName(node),
        parentId,
        props: node.props || {},
        state: this.extractState(node),
        hooks: this.extractHooks(node),
        children: [] as any[],
      };

      result.push(nodeInfo);

      // 递归处理子组件
      if (node.subComponents && Array.isArray(node.subComponents)) {
        node.subComponents.forEach((child: any) => {
          traverse(child, node._devToolsId);
        });
      }
    };

    this.rootNodes.forEach(root => traverse(root));
    return result;
  }

  /**
   * 获取组件名称
   */
  private getComponentName(node: any): string {
    if (node.name) return node.name;
    if (node.type?.name) return node.type.name;
    if (node.fnNode) {
      const match = node.fnNode.match(/function\s+(\w+)/);
      if (match) return match[1];
    }
    return 'Anonymous';
  }

  /**
   * 提取状态
   */
  private extractState(node: any): Record<string, any> {
    const state: Record<string, any> = {};
    
    if (node.scope?.reactiveMap) {
      Object.entries(node.scope.reactiveMap).forEach(([key, value]) => {
        state[key] = value;
      });
    }

    return state;
  }

  /**
   * 提取 Hooks
   */
  private extractHooks(node: any): any[] {
    const hooks: any[] = [];

    if (node.computations && Array.isArray(node.computations)) {
      node.computations.forEach((comp: any, index: number) => {
        if (comp.length === 1) {
          hooks.push({
            index,
            type: 'Hook',
          });
        }
      });
    }

    return hooks;
  }

  /**
   * 发送组件树到 DevTools
   */
  sendComponentTree(): void {
    const tree = this.collectComponentTree();
    
    window.postMessage({
      type: 'INULA_DEV_TOOLS',
      payload: {
        type: 'component-tree',
        data: tree,
        version: InulaVersion.V2,
      },
      from: 'dev-tool-hook',
    }, '*');
  }

  /**
   * 获取组件详情
   */
  getComponentDetail(id: string): any {
    const comp = this.compNodes.get(id);
    if (!comp) return null;

    return {
      id,
      name: this.getComponentName(comp),
      props: comp.props || {},
      state: this.extractState(comp),
      hooks: this.extractHooks(comp),
      rawData: comp,
    };
  }

  /**
   * 更新组件属性
   */
  updateComponentProp(id: string, propName: string, value: any): void {
    const comp = this.compNodes.get(id);
    if (!comp) return;

    if (comp.props) {
      comp.props[propName] = value;
      // 触发组件更新
      if (comp.wave) {
        comp.wave(null, 0b1111111111111111);
      }
    }
  }

  /**
   * 获取组件对应的 DOM 元素
   */
  getComponentDOM(id: string): HTMLElement | null {
    const comp = this.compNodes.get(id);
    if (!comp || !comp.nodes || comp.nodes.length === 0) return null;

    // 尝试从 nodes 中找到 DOM 元素
    const findDOM = (node: any): HTMLElement | null => {
      if (node instanceof HTMLElement) {
        return node;
      }
      if (node.nodes && Array.isArray(node.nodes)) {
        for (const child of node.nodes) {
          const dom = findDOM(child);
          if (dom) return dom;
        }
      }
      return null;
    };

    for (const node of comp.nodes) {
      const dom = findDOM(node);
      if (dom) return dom;
    }

    return null;
  }
}

// 创建并导出全局实例
export const v2Hook = new V2Hook();

// 自动初始化
if (typeof window !== 'undefined') {
  (window as any).__INULA_DEV_TOOL_V2_HOOK__ = v2Hook;
}
