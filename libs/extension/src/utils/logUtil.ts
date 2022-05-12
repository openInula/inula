// chrome 通过 iframe 的方式将 panel 页面嵌入到开发者工具中，如果有报错是无法感知到的
// 同时也无法在运行时打断点，需要适当的日志辅助开发和问题定位

interface loggerType {
  error: typeof console.error,
  info: typeof console.info,
  log: typeof console.log,
  warn: typeof console.warn,
}

export function createLogger(id: string): loggerType {
  return ['error', 'info', 'log', 'warn'].reduce((pre, current) => {
    const prefix = `[horizon_dev_tool][${id}] `;
    pre[current] = (...data) => {
      console[current](prefix, ...data);
    };
    return pre;
  }, {} as loggerType);
}
