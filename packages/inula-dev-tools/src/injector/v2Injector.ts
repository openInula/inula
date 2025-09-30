/**
 * Inula 2.0 版本注入器
 * 注入调试钩子并收集组件信息
 */

import { InulaVersion } from '../comm/types';
import { createMessage } from '../utils/transferUtils';
import { DevToolHook } from '../utils/constants';

// 本地定义 sendToContentScript，避免循环依赖
function sendToContentScript(type: string, data?: unknown) {
  window.postMessage(createMessage({ type, data }, DevToolHook), '*');
}

// 组件节点映射
const compNodeMap = new Map<string, any>();
const rootCompNodes: any[] = [];
let compIdCounter = 0;

/**
 * 为组件节点生成唯一 ID
 */
function generateCompId(comp: any): string {
  if (!comp._devToolsId) {
    comp._devToolsId = `comp_${compIdCounter++}`;
  }
  return comp._devToolsId;
}

/**
 * 注册组件节点
 */
function registerCompNode(comp: any, parentId?: string): void {
  if (!comp) return;

  const id = generateCompId(comp);
  compNodeMap.set(id, comp);

  // 保存父节点关系
  if (parentId) {
    comp._devToolsParentId = parentId;
  }

  // 递归注册子组件
  if (comp.subComponents && Array.isArray(comp.subComponents)) {
    comp.subComponents.forEach((child: any) => {
      registerCompNode(child, id);
    });
  }

  // 处理 nodes 中的组件
  if (comp.nodes && Array.isArray(comp.nodes)) {
    comp.nodes.forEach((node: any) => {
      if (isCompNode(node)) {
        registerCompNode(node, id);
      }
    });
  }
}

/**
 * 判断是否为组件节点
 */
function isCompNode(node: any): boolean {
  return node && (
    node.inulaType === 0 || // CompNode
    node.subComponents !== undefined ||
    node.type?.toString().includes('compBuilder')
  );
}

/**
 * 获取组件名称
 */
function getCompName(comp: any): string {
  if (comp.name) return comp.name;
  if (comp.type?.name) return comp.type.name;
  
  // 尝试从 fnNode 提取
  if (comp.fnNode) {
    const match = comp.fnNode.match(/function\s+(\w+)/);
    if (match) return match[1];
  }
  
  return 'Anonymous';
}

/**
 * 收集组件树信息
 */
function collectComponentTree(): any[] {
  const result: any[] = [];

  const traverse = (comp: any) => {
    if (!comp) return;

    const id = comp._devToolsId;
    const parentId = comp._devToolsParentId;

    // 收集组件信息
    const compInfo = {
      id,
      name: getCompName(comp),
      type: getCompType(comp),
      parentId: parentId || '',
      key: comp.key || '',
      props: comp.props || {},
      state: extractState(comp),
    };

    result.push(compInfo);

    // 递归子组件
    if (comp.subComponents && Array.isArray(comp.subComponents)) {
      comp.subComponents.forEach((child: any) => {
        traverse(child);
      });
    }
  };

  rootCompNodes.forEach(root => traverse(root));
  return result;
}

/**
 * 获取组件类型
 */
function getCompType(comp: any): string {
  if (comp.inulaType !== undefined) {
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
    return typeMap[comp.inulaType] || 'Component';
  }
  return 'Component';
}

/**
 * 提取状态
 */
function extractState(comp: any): Record<string, any> {
  const state: Record<string, any> = {};
  
  if (comp.scope?.reactiveMap) {
    Object.entries(comp.scope.reactiveMap).forEach(([key, value]) => {
      state[key] = value;
    });
  }

  return state;
}

/**
 * 提取组件属性详情
 */
function parseCompAttrs(id: string): any {
  const comp = compNodeMap.get(id);
  if (!comp) {
    console.error('Component not found:', id);
    return null;
  }

  return {
    id,
    name: getCompName(comp),
    type: getCompType(comp),
    parsedProps: formatAttrs(comp.props),
    parsedState: formatAttrs(extractState(comp)),
    parsedHooks: extractHooks(comp),
    src: comp.source || null,
  };
}

/**
 * 格式化属性为数组形式（兼容 V1 格式）
 */
function formatAttrs(attrs: Record<string, any>): any[] {
  if (!attrs) return [];
  
  return Object.entries(attrs).map(([key, value]) => ({
    itemName: key,
    value,
    editable: true,
  }));
}

/**
 * 提取 Hooks
 */
function extractHooks(comp: any): any[] {
  const hooks: any[] = [];

  if (comp.computations && Array.isArray(comp.computations)) {
    comp.computations.forEach((computation: any, index: number) => {
      if (computation.length === 1) {
        hooks.push({
          itemName: `Hook ${index}`,
          type: 'Hook',
          index,
        });
      }
    });
  }

  return hooks;
}

/**
 * 查找组件对应的 DOM 元素
 */
function findCompDOM(comp: any): HTMLElement | null {
  if (!comp || !comp.nodes || comp.nodes.length === 0) {
    return null;
  }

  const traverse = (node: any): HTMLElement | null => {
    // 如果是 DOM 元素直接返回
    if (node instanceof HTMLElement) {
      return node;
    }

    // 如果有 nodes 属性，递归查找
    if (node.nodes && Array.isArray(node.nodes)) {
      for (const child of node.nodes) {
        const dom = traverse(child);
        if (dom) return dom;
      }
    }

    return null;
  };

  for (const node of comp.nodes) {
    const dom = traverse(node);
    if (dom) return dom;
  }

  return null;
}

/**
 * 安装 V2 调试钩子
 */
export function installV2DevToolHook(): void {
  const win = window as any;

  // 标记版本（重要：用于 main/index.ts 检测）
  win.__INULA_V2__ = true;
  win.__INULA_NEXT__ = true;
  win.__INULA_DEV_TOOLS_ACTIVE__ = true;
  
  // 设置 __INULA_DEV_HOOK__ 标记，使得插件图标激活
  if (!win.__INULA_DEV_HOOK__) {
    win.__INULA_DEV_HOOK__ = {
      version: '2.0',
      active: true,
    };
  }

  // 创建辅助对象
  const v2Helper = {
    compNodeMap,
    rootCompNodes,
    registerCompNode,
    collectComponentTree,
    parseCompAttrs,
    findCompDOM,
    getCompById: (id: string) => compNodeMap.get(id),
  };

  win.__INULA_DEV_TOOL_V2_HELPER__ = v2Helper;

  // 拦截现有的 render 函数
  hookRenderFunction();

  // 监听组件更新
  setupUpdateMonitor();

  console.log('[Inula DevTools] V2 Hook installed successfully');
  console.log('[Inula DevTools] Markers set:', {
    __INULA_V2__: win.__INULA_V2__,
    __INULA_NEXT__: win.__INULA_NEXT__,
    __INULA_DEV_HOOK__: !!win.__INULA_DEV_HOOK__,
  });
  
  // 激活插件图标
  sendToContentScript('openInula-framework-detected');
  console.log('[Inula DevTools] Icon activation message sent');
}

/**
 * 拦截 render 函数
 */
function hookRenderFunction(): void {
  const win = window as any;

  // 使用 Object.defineProperty 拦截 render 的设置
  let originalRender: any = win.render;
  
  // 如果 render 已存在，立即拦截
  if (originalRender) {
    setupRenderHook(originalRender);
  } else {
    // 如果还不存在，等待它被设置
    let renderDescriptor = Object.getOwnPropertyDescriptor(win, 'render');
    
    Object.defineProperty(win, 'render', {
      get() {
        return originalRender;
      },
      set(newRender) {
        if (!originalRender) {
          // 第一次设置 render 函数时拦截它
          console.log('[Inula DevTools] Render function detected, installing hook');
          setupRenderHook(newRender);
        }
        originalRender = newRender;
      },
      configurable: true,
      enumerable: true,
    });
  }
  
  function setupRenderHook(renderFn: any): void {
    win.render = function(compNode: any, container: HTMLElement) {
      console.log('[Inula DevTools] Render called with:', compNode);
      
      // 注册根组件
      rootCompNodes.push(compNode);
      registerCompNode(compNode);

      // 调用原始 render
      const result = renderFn(compNode, container);

      // 渲染完成后发送组件树
      setTimeout(() => {
        console.log('[Inula DevTools] Sending component tree');
        sendComponentTree();
      }, 100);

      return result;
    };
  }
}

/**
 * 设置更新监听
 */
function setupUpdateMonitor(): void {
  // 定期检查组件更新
  let lastTreeState = '';
  
  setInterval(() => {
    const currentTree = collectComponentTree();
    const currentState = JSON.stringify(currentTree.map(c => ({ id: c.id, name: c.name })));
    
    if (currentState !== lastTreeState) {
      lastTreeState = currentState;
      sendComponentTree();
    }
  }, 1000);
}

/**
 * 发送组件树
 */
function sendComponentTree(): void {
  const tree = collectComponentTree();
  // 使用正确的消息类型（连字符格式）
  sendToContentScript('vNode trees infos', [tree]);
}

/**
 * V2 版本的操作函数
 */
export const v2Actions = {
  // 请求所有组件树
  requestAllComponentTree: () => {
    sendComponentTree();
  },

  // 请求组件属性
  requestComponentAttrs: (id: string) => {
    const attrs = parseCompAttrs(id);
    if (attrs) {
      sendToContentScript('component-attrs', attrs);
    }
  },

  // 修改组件属性
  modifyComponentProp: (data: { id: string; itemName: string; path: string[]; value: any }) => {
    const comp = compNodeMap.get(data.id);
    if (!comp) return;

    if (comp.props && comp.props[data.itemName] !== undefined) {
      comp.props[data.itemName] = data.value;
      
      // 触发组件更新
      if (comp.wave) {
        comp.wave(null, 0b1111111111111111);
      }
    }
  },

  // 高亮组件
  highlightComponent: (id: string) => {
    const comp = compNodeMap.get(id);
    if (!comp) return;

    const dom = findCompDOM(comp);
    if (dom) {
      const { showHighlight } = require('./highLightElement');
      showHighlight({ element: dom, name: getCompName(comp) });
    }
  },

  // 取消高亮
  unhighlightComponent: () => {
    const { hideHighlight } = require('./highLightElement');
    hideHighlight();
  },
};
