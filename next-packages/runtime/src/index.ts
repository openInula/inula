// DevTools 支持：在模块加载时就设置标记并通知 DevTools
if (typeof window !== 'undefined') {
  const win = window as any;
  
  // 标记为 Inula 2.0（用于 DevTools 检测）
  win.__INULA_V2__ = true;
  win.__INULA_NEXT__ = true;
  
  console.log('[Inula Next] Runtime loaded, version 2.0');
  
  // 主动通知 DevTools：2.0 运行时已加载
  // 发送自定义事件
  const event = new CustomEvent('__INULA_V2_LOADED__', {
    detail: { version: '2.0', timestamp: Date.now() }
  });
  window.dispatchEvent(event);
  
  // 也通过自定义事件通知（不需要用 DevTools 消息格式）
  setTimeout(() => {
    window.postMessage({
      type: '__INULA_V2_READY__',  // 这是自定义事件，不需要改
      version: '2.0',
      from: 'inula-runtime'
    }, '*');
  }, 0);
}

export * from './render';
export * from './Nodes';
export * from './types';
