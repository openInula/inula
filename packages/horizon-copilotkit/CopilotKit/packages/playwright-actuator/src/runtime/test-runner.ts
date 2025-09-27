/// <reference path="../types/global.d.ts" />

import type { Logger } from '../types/global.js';

interface TestRunnerOptions {
  timeout?: number;
  retries?: number;
  [key: string]: any;
}

interface TestResult {
  success: boolean;
  skipped?: boolean;
  [key: string]: any;
}

interface ScriptExecutionResult {
  scriptName: string;
  duration: number;
  results: TestResult[];
  success: boolean;
  error?: Error;
}

interface BatchStats {
  scripts: {
    total: number;
    passed: number;
    failed: number;
  };
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  duration: number;
}

interface GlobalHooks {
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
}


export default class TestRunner {
  private runtime: any;
  private logger: any;
  private options: TestRunnerOptions;

  constructor(options: TestRunnerOptions = {}) {
    this.runtime = new (window.PlaywrightRuntime || (globalThis as any).PlaywrightRuntime)();
    this.logger = (typeof window !== 'undefined' && window.PlaywrightLogger) 
      ? new window.PlaywrightLogger() 
      : console as unknown as Logger;
    this.options = {
      timeout: 30000,
      retries: 0,
      ...options
    };
  }

  /**
   * 从文件加载并执行脚本
   */
  async loadAndRun(scriptPath: string): Promise<ScriptExecutionResult> {
    try {
      this.logger.info(`📂 加载脚本: ${scriptPath}`);
      const response = await fetch(scriptPath);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const scriptContent = await response.text();
      return await this.runScript(scriptContent, scriptPath);
    } catch (error) {
      this.logger.error(`脚本加载失败: ${scriptPath}`, error);
      throw error;
    }
  }

  /**
   * 直接执行脚本字符串
   */
  async runScript(scriptContent: string, scriptName: string = 'inline-script'): Promise<ScriptExecutionResult> {
    try {
      this.logger.info(`🚀 执行脚本: ${scriptName}`);
      const startTime = Date.now();
      
      const results: TestResult[] = await this.runtime.executeScript(scriptContent);
      
      const duration = Date.now() - startTime;
      this.logger.success(`✅ 脚本执行完成: ${scriptName} (${duration}ms)`);
      
      return {
        scriptName,
        duration,
        results,
        success: results.every(r => r.success || r.skipped)
      };
    } catch (error) {
      this.logger.error(`脚本执行失败: ${scriptName}`, error);
      return {
        scriptName,
        duration: 0,
        results: [],
        success: false,
        error: error as Error
      };
    }
  }

  /**
   * 执行多个脚本文件
   */
  async runScripts(scriptPaths: string[]): Promise<ScriptExecutionResult[]> {
    const allResults: ScriptExecutionResult[] = [];
    
    this.logger.info(`📦 批量执行 ${scriptPaths.length} 个脚本`);
    
    for (const path of scriptPaths) {
      try {
        const result = await this.loadAndRun(path);
        allResults.push(result);
      } catch (error) {
        allResults.push({
          scriptName: path,
          duration: 0,
          results: [],
          success: false,
          error: error as Error
        });
      }
    }
    
    // 输出批量执行总结
    this.printBatchSummary(allResults);
    
    return allResults;
  }

  /**
   * 从目录批量加载脚本
   */
  async runScriptsFromPattern(pattern: string): Promise<never> {
    // 浏览器环境中无法直接读取文件系统
    // 这里提供一个基础实现，需要服务器支持
    this.logger.warn('浏览器环境中无法直接扫描文件系统，请使用 runScripts() 方法');
    throw new Error('浏览器环境不支持文件系统扫描');
  }

  /**
   * 设置全局钩子
   */
  setGlobalHooks(hooks: GlobalHooks): void {
    const { beforeAll, afterAll, beforeEach, afterEach } = hooks;
    const test = window.PlaywrightTest?.test;
    
    if (!test) {
      throw new Error('PlaywrightTest.test 未找到');
    }
    
    if (beforeAll) test.beforeAll(beforeAll);
    if (afterAll) test.afterAll(afterAll);
    if (beforeEach) test.beforeEach(beforeEach);
    if (afterEach) test.afterEach(afterEach);
    
    this.logger.debug('全局钩子设置完成');
  }

  /**
   * 设置全局配置
   */
  configure(config: Partial<TestRunnerOptions>): void {
    this.options = { ...this.options, ...config };
    this.logger.debug('测试配置更新:', this.options);
  }

  /**
   * 打印批量执行总结
   */
  printBatchSummary(results: ScriptExecutionResult[]): void {
    const totalScripts = results.length;
    const successfulScripts = results.filter(r => r.success).length;
    const failedScripts = results.filter(r => !r.success).length;
    
    const totalTests = results.reduce((sum, r) => sum + r.results.length, 0);
    const passedTests = results.reduce((sum, r) => 
      sum + r.results.filter(test => test.success).length, 0
    );
    const failedTests = results.reduce((sum, r) => 
      sum + r.results.filter(test => !test.success && !test.skipped).length, 0
    );
    const skippedTests = results.reduce((sum, r) => 
      sum + r.results.filter(test => test.skipped).length, 0
    );
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    
    this.logger.info(`
🎯 批量执行总结:
📄 脚本统计:
   ✅ 成功: ${successfulScripts}/${totalScripts}
   ❌ 失败: ${failedScripts}/${totalScripts}

🧪 测试统计:
   ✅ 通过: ${passedTests}
   ❌ 失败: ${failedTests}
   ⏭️ 跳过: ${skippedTests}
   📊 总计: ${totalTests}

⏱️ 总耗时: ${totalDuration}ms
    `);
    
    if (failedScripts > 0) {
      this.logger.error('失败的脚本:');
      results.filter(r => !r.success).forEach(r => {
        this.logger.error(`  - ${r.scriptName}: ${r.error?.message || '未知错误'}`);
      });
    }
  }

  /**
   * 获取执行统计
   */
  getStats(results: ScriptExecutionResult[] | ScriptExecutionResult): BatchStats | Omit<BatchStats, 'scripts'> {
    if (Array.isArray(results) && results[0]?.results) {
      // 批量执行结果
      return {
        scripts: {
          total: results.length,
          passed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        tests: {
          total: results.reduce((sum, r) => sum + r.results.length, 0),
          passed: results.reduce((sum, r) => 
            sum + r.results.filter(test => test.success).length, 0
          ),
          failed: results.reduce((sum, r) => 
            sum + r.results.filter(test => !test.success && !test.skipped).length, 0
          ),
          skipped: results.reduce((sum, r) => 
            sum + r.results.filter(test => test.skipped).length, 0
          )
        },
        duration: results.reduce((sum, r) => sum + r.duration, 0)
      };
    } else {
      // 单个脚本执行结果
      const singleResult = results as ScriptExecutionResult;
      return {
        tests: {
          total: singleResult.results?.length || 0,
          passed: singleResult.results?.filter(test => test.success).length || 0,
          failed: singleResult.results?.filter(test => !test.success && !test.skipped).length || 0,
          skipped: singleResult.results?.filter(test => test.skipped).length || 0
        },
        duration: singleResult.duration || 0
      };
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    // 清理全局钩子
    const test = window.PlaywrightTest?.test;
    if (test) {
      test._beforeAllHooks = [];
      test._afterAllHooks = [];
      test._beforeEachHooks = [];
      test._afterEachHooks = [];
    }
    
    this.logger.debug('测试运行器清理完成');
  }
}

// 导出给浏览器使用
if (typeof window !== 'undefined') {
  (window as any).PlaywrightTestRunner = TestRunner;
}