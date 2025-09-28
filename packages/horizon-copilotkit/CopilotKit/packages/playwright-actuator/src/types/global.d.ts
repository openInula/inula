// 全局类型声明文件
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
  setLevel(level: string): void;
  getLevel(): string;
}

// Window 接口扩展 - 统一在这里声明
declare global {
  interface Window {
    PlaywrightLogger?: any;
    PlaywrightWaitManager?: any;
    PlaywrightEventSimulator?: any;
    PlaywrightLocatorAdapter?: any;
    PlaywrightPageAdapter?: any;
    PlaywrightExpectAdapter?: any;
    PlaywrightRuntime?: any;
    PlaywrightTestRunner?: any;
    PlaywrightTest?: any;
    PlaywrightExpected?: any;
    PlaywrightExpect?: any;
    require?: any;
    importFrom?: any;
    PlaywrightExecutionEngine?: any;
    PWEngine?: any;
    runPlaywrightScript?: any;
    loadPlaywrightScript?: any;
    // Frame 相关组件
    PlaywrightFrameLocatorAdapter?: any;
    PlaywrightContentFrameAdapter?: any;
    PlaywrightFrameAdapter?: any;
    // 新增的全局实例
    page?: any;
    expect?: any;
    test?: any;
  }
}