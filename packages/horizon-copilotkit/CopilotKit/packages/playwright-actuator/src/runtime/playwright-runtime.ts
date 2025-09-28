/// <reference path="../types/global.d.ts" />
import type { TestResult, Logger } from '../../types/index.js';

interface TestContext {
  page: any; // TODO: Type this properly
}

interface TestFunction {
  (context: TestContext): Promise<void>;
}

interface TestDefinition {
  name: string;
  fn: TestFunction;
  run(): Promise<TestResult>;
}

/**
 * Playwright 运行时适配器
 * 模拟 @playwright/test 模块，让 Playwright 脚本能在浏览器中运行
 */
class PlaywrightRuntime {
  private logger: Logger;

  constructor() {
    this.logger = (typeof window !== 'undefined' && window.PlaywrightLogger) 
      ? new window.PlaywrightLogger() 
      : console as unknown as Logger;
    this.setupGlobalEnvironment();
  }

  /**
   * 设置全局环境
   */
  setupGlobalEnvironment(): void {
    // 模拟 @playwright/test 模块
    window.PlaywrightTest = {
      test: this.createTestFunction(),
      expect: window.PlaywrightExpect || this.createExpectFunction()
    };

    // 设置模块系统
    this.setupModuleSystem();
    
    this.logger.debug('Playwright 运行时环境初始化完成');
  }

  /**
   * 创建 test 函数
   */
  createTestFunction(): (name: string, testFn: TestFunction) => TestDefinition {
    const self = this;
    
    // 主 test 函数
    function test(name: string, testFn: TestFunction): TestDefinition {
      return {
        name,
        fn: testFn,
        run: async (): Promise<TestResult> => {
          const page = new window.PlaywrightPageAdapter!();
          const context: TestContext = { page };
          const startTime = Date.now();

          try {
            self.logger.info(`🧪 开始测试: ${name}`);
            
            await testFn(context);
            
            const duration = Date.now() - startTime;
            self.logger.success(`✅ 测试通过: ${name} (${duration}ms)`);
            return { success: true, duration, name };
          } catch (error) {
            const duration = Date.now() - startTime;
            self.logger.error(`❌ 测试失败: ${name} (${duration}ms)`, error);
            return { 
              success: false, 
              duration, 
              name, 
              error: error as Error 
            };
          }
        }
      };
    }

    // 为 test 函数添加方法
    (test as any).skip = function(name: string, testFn: TestFunction): TestDefinition {
      self.logger.info(`⏭️ 跳过测试: ${name}`);
      return {
        name,
        fn: testFn,
        run: async (): Promise<TestResult> => ({
          success: true,
          duration: 0,
          name: `${name} (跳过)`
        })
      };
    };

    (test as any).only = function(name: string, testFn: TestFunction): TestDefinition {
      // 在实际实现中，这会标记只运行这个测试
      self.logger.info(`🎯 仅运行测试: ${name}`);
      return test(name, testFn);
    };

    (test as any).fixme = function(name: string, testFn: TestFunction): TestDefinition {
      self.logger.info(`🔧 修复中的测试: ${name}`);
      return {
        name,
        fn: testFn,
        run: async (): Promise<TestResult> => ({
          success: true,
          duration: 0,
          name: `${name} (修复中)`
        })
      };
    };

    (test as any).describe = function(suiteName: string, suiteFn: () => void): void {
      self.logger.info(`📁 测试套件: ${suiteName}`);
      // 在实际实现中，这里会创建一个测试套件的作用域
      suiteFn();
    };

    return test;
  }

  /**
   * 创建 expect 函数（如果不存在）
   */
  createExpectFunction(): (target: any) => any {
    return function expect(target: any) {
      return new window.PlaywrightExpectAdapter!(target);
    };
  }

  /**
   * 设置模块系统
   */
  setupModuleSystem(): void {
    // 创建简单的模块加载器
    if (!window.require) {
      (window as any).require = (moduleName: string) => {
        switch (moduleName) {
          case '@playwright/test':
            return window.PlaywrightTest;
          case 'expect':
            return window.PlaywrightExpected || this.createExpectFunction();
          default:
            throw new Error(`模块 "${moduleName}" 未找到`);
        }
      };
    }

    // 设置导入/导出
    if (!window.importFrom) {
      const logger = this.logger;
      window.importFrom = (moduleName: string, imports: string[]) => {
        try {
          const module = window.require!(moduleName);
          const result: Record<string, any> = {};
          
          imports.forEach(importName => {
            if (module && module[importName] !== undefined) {
              result[importName] = module[importName];
            } else if (module && importName === 'default') {
              result[importName] = module;
            } else {
              logger.warn(`无法从模块 "${moduleName}" 找到导出 "${importName}"，使用默认值`);
              // 对于 @playwright/test，提供默认实现
              if (moduleName === '@playwright/test') {
                if (importName === 'test') {
                  result[importName] = window.PlaywrightTest?.test;
                } else if (importName === 'expect') {
                  result[importName] = window.PlaywrightTest?.expect;
                }
              }
            }
          });
          
          return result;
        } catch (error) {
          logger.error(`模块导入失败: ${moduleName}`, error);
          throw error;
        }
      };
    }

    this.logger.debug('模块系统设置完成');
  }

  /**
   * 预处理脚本内容，转换 ES6 import 语法
   */
  private preprocessScript(scriptContent: string): string {
    // 简单地移除 import 语句，因为我们通过 Function 参数提供了这些函数
    let processedContent = scriptContent.replace(
      /import\s*\{\s*[^}]+\s*\}\s*from\s*['"]@playwright\/test['"];?\s*\n?/g,
      ''
    );

    // 移除其他形式的 import 语句
    processedContent = processedContent.replace(
      /import\s*\*\s*as\s*\w+\s*from\s*['"]@playwright\/test['"];?\s*\n?/g,
      ''
    );

    processedContent = processedContent.replace(
      /import\s+\w+\s+from\s*['"]@playwright\/test['"];?\s*\n?/g,
      ''
    );

    return processedContent;
  }

  /**
   * 执行脚本代码
   */
  async executeScript(scriptContent: string, scriptName: string = 'inline'): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const tests: TestDefinition[] = [];

    try {
      // 保存原始的 test 函数
      const originalTest = window.PlaywrightTest?.test;
      
      // 重写 test 函数来收集测试
      if (window.PlaywrightTest) {
        window.PlaywrightTest.test = (name: string, testFn: TestFunction) => {
          const testDef = originalTest!(name, testFn);
          tests.push(testDef);
          return testDef;
        };
      }

      // 准备执行环境
      const context = this.createExecutionContext();
      
      // 执行脚本
      this.logger.info(`📄 执行脚本: ${scriptName}`);
      
      // 预处理脚本内容
      const processedContent = this.preprocessScript(scriptContent);
      
      // 使用 Function 构造器执行脚本，避免 eval 的作用域问题
      const scriptFunction = new Function(
        'test', 'expect', 'require', 'importFrom',
        processedContent
      );

      scriptFunction(
        window.PlaywrightTest?.test,
        window.PlaywrightTest?.expect,
        window.require,
        window.importFrom
      );

      // 恢复原始的 test 函数
      if (window.PlaywrightTest && originalTest) {
        window.PlaywrightTest.test = originalTest;
      }

      // 运行收集到的测试
      for (const test of tests) {
        const result = await test.run();
        results.push(result);
      }

      this.logger.info(`📊 脚本执行完成: ${tests.length} 个测试`);
      
    } catch (error) {
      this.logger.error(`❌ 脚本执行失败: ${scriptName}`, error);
      results.push({
        success: false,
        duration: 0,
        name: `脚本执行: ${scriptName}`,
        error: error as Error
      });
    }

    return results;
  }

  /**
   * 创建执行上下文
   */
  private createExecutionContext(): Record<string, any> {
    return {
      console,
      window,
      document,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Promise,
      fetch: window.fetch,
      // Playwright 相关
      test: window.PlaywrightTest?.test,
      expect: window.PlaywrightTest?.expect,
      require: window.require,
      importFrom: window.importFrom
    };
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    // 清理全局变量
    delete (window as any).PlaywrightTest;
    delete (window as any).require;
    delete window.importFrom;
    
    this.logger.debug('Playwright 运行时清理完成');
  }
}


// 导出给浏览器使用
if (typeof window !== 'undefined') {
  window.PlaywrightRuntime = PlaywrightRuntime;
}


// ES6 模块导出
export default PlaywrightRuntime;