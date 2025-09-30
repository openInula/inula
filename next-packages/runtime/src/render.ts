import { CompNode } from './Nodes/CompNode/node';
import { InulaHTMLNode } from './Nodes/HTMLNode/types';
import { insertNode } from './Nodes/HTMLNode';
import { runDidMount } from './lifecycle';

/**
 * @brief Render the component node to the container
 * @param compNode
 * @param container
 */
export const render = (compNode: CompNode | (() => CompNode), container: HTMLElement) => {
  if (container == null) {
    throw new Error('Render target is empty. Please provide a valid DOM element.');
  }
  
  // DevTools 支持：设置全局标记
  if (typeof window !== 'undefined') {
    const win = window as any;
    
    // 标记为 Inula 2.0
    if (!win.__INULA_V2__) {
      win.__INULA_V2__ = true;
      win.__INULA_NEXT__ = true;
    }
    
    // 设置 render 函数到 window，以便 DevTools 拦截
    if (!win.render) {
      win.render = render;
    }
    
    // 通知 DevTools 有新的渲染
    if (win.__INULA_DEV_TOOL_V2_HELPER__) {
      win.__INULA_DEV_TOOL_V2_HELPER__.registerCompNode(compNode);
      win.__INULA_DEV_TOOL_V2_HELPER__.rootCompNodes.push(compNode);
    }
  }
  
  container.innerHTML = '';
  if (typeof compNode === 'function') {
    compNode = compNode();
  }
  insertNode(container as InulaHTMLNode, compNode, 0);
  runDidMount();
  
  // 渲染完成后通知 DevTools
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.__INULA_DEV_TOOL_V2_HELPER__) {
      // 延迟发送，确保 DOM 已更新
      setTimeout(() => {
        const tree = win.__INULA_DEV_TOOL_V2_HELPER__.collectComponentTree();
        window.postMessage({
          type: 'DevTool_Msg_Label',  // 必须使用这个标签
          payload: {
            type: 'vNode trees infos',
            data: [tree],
          },
          from: 'dev tool hook',
        }, '*');
      }, 0);
    }
  }
};
