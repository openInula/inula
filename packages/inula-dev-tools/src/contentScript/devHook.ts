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

import { contentScriptMessageHandler, installDevToolHook } from '../injector';
import { VersionDetector } from '../core/versionDetector';
import { InulaVersion } from '../comm/types';
import { createMessage } from '../utils/transferUtils';
import { DevToolHook } from '../utils/constants';

// 直接在这里定义 V2 Hook 安装函数，避免循环依赖和动态导入问题
function installV2DevToolHook(): void {
  const win = window as any;
  
  console.log('[Inula DevTools] 开始安装 V2 Hook...');
  
  // 标记版本
  win.__INULA_V2__ = true;
  win.__INULA_NEXT__ = true;
  win.__INULA_DEV_TOOLS_ACTIVE__ = true;
  
  // 设置 __INULA_DEV_HOOK__
  if (!win.__INULA_DEV_HOOK__) {
    win.__INULA_DEV_HOOK__ = {
      version: '2.0',
      active: true,
    };
  }
  
  // 创建 V2 Helper
  const compNodeMap = new Map();
  const rootCompNodes: any[] = [];
  let compIdCounter = 0;
  
  function generateCompId(comp: any): string {
    if (!comp._devToolsId) {
      comp._devToolsId = `comp_${compIdCounter++}`;
    }
    return comp._devToolsId;
  }
  
  function getCompName(comp: any): string {
    if (comp?.name) return comp.name;
    if (comp?.type?.name) return comp.type.name;
    return 'Anonymous';
  }
  
  function registerCompNode(comp: any, parentId?: string): void {
    if (!comp) return;
    const id = generateCompId(comp);
    compNodeMap.set(id, comp);
    if (parentId) comp._devToolsParentId = parentId;
    
    if (comp.subComponents && Array.isArray(comp.subComponents)) {
      comp.subComponents.forEach((child: any) => registerCompNode(child, id));
    }
  }
  
  function collectComponentTree(): any[] {
    const result: any[] = [];
    
    function traverse(comp: any) {
      if (!comp) return;
      const id = comp._devToolsId || generateCompId(comp);
      const parentId = comp._devToolsParentId;
      
      result.push(
        id,
        { itemName: getCompName(comp), badge: [] },
        parentId || '',
        comp.key || ''
      );
      
      if (comp.subComponents && Array.isArray(comp.subComponents)) {
        comp.subComponents.forEach((child: any) => traverse(child));
      }
    }
    
    rootCompNodes.forEach(root => traverse(root));
    return result;
  }
  
  function parseCompAttrs(id: string): any {
    const comp = compNodeMap.get(id);
    if (!comp) return null;
    return {
      id,
      name: getCompName(comp),
      parsedProps: Object.entries(comp.props || {}).map(([k, v]) => ({
        itemName: k,
        value: v,
        editable: true
      })),
      parsedState: [],
      parsedHooks: [],
    };
  }
  
  const v2Helper = {
    compNodeMap,
    rootCompNodes,
    registerCompNode,
    collectComponentTree,
    parseCompAttrs,
    findCompDOM: () => null,
    getCompById: (id: string) => compNodeMap.get(id),
  };
  
  win.__INULA_DEV_TOOL_V2_HELPER__ = v2Helper;
  
  // 发送激活消息
  window.postMessage(createMessage({ type: 'openInula-framework-detected' }, DevToolHook), '*');
  
  console.log('[Inula DevTools] V2 Hook 安装成功');
  console.log('[Inula DevTools] Markers:', {
    __INULA_V2__: win.__INULA_V2__,
    __INULA_NEXT__: win.__INULA_NEXT__,
    __INULA_DEV_HOOK__: !!win.__INULA_DEV_HOOK__,
    __INULA_DEV_TOOL_V2_HELPER__: !!win.__INULA_DEV_TOOL_V2_HELPER__,
  });
}

if (!window.__INULA_DEV_HOOK__) {
  let hookInstalled = false;

  // 接受contentScript的消息
  window.addEventListener('message', contentScriptMessageHandler);

  const detectAndInstall = () => {
    if (hookInstalled) return;

    const version = VersionDetector.detect();
    
    if (version === InulaVersion.V2) {
      console.log('[Inula DevTools] 检测到 Inula 2.0，安装 V2 钩子');
      try {
        installV2DevToolHook();
        hookInstalled = true;
      } catch(e) {
        console.error('[Inula DevTools] V2 Hook 安装失败:', e);
      }
    } else if (version === InulaVersion.V1) {
      console.log('[Inula DevTools] 检测到 Inula 1.0，安装 V1 钩子');
      installDevToolHook();
      hookInstalled = true;
    }
  };

  // 监听 2.0 运行时加载事件（优先级最高）
  window.addEventListener('__INULA_V2_LOADED__', () => {
    console.log('[Inula DevTools] 收到 2.0 运行时加载通知');
    if (!hookInstalled) {
      try {
        installV2DevToolHook();
        hookInstalled = true;
      } catch(e) {
        console.error('[Inula DevTools] V2 Hook 安装失败:', e);
      }
    }
  });

  // 监听 postMessage 通知
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === '__INULA_V2_READY__' && !hookInstalled) {
      console.log('[Inula DevTools] 通过 postMessage 检测到 2.0 运行时');
      try {
        installV2DevToolHook();
        hookInstalled = true;
      } catch(e) {
        console.error('[Inula DevTools] V2 Hook 安装失败:', e);
      }
    }
  });

  // 立即尝试检测（可能 2.0 运行时已经加载）
  detectAndInstall();

  // 如果还没安装钩子，延迟重试
  if (!hookInstalled) {
    setTimeout(() => {
      if (!hookInstalled) {
        console.log('[Inula DevTools] 延迟检测...');
        detectAndInstall();
      }
    }, 1000);

    // 再次延迟重试（应对慢速网络）
    setTimeout(() => {
      if (!hookInstalled) {
        console.log('[Inula DevTools] 最终检测...');
        detectAndInstall();
      }
    }, 3000);
  }
}