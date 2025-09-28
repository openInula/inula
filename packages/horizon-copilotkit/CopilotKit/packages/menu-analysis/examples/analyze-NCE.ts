#!/usr/bin/env tsx

/**
 * 函数式菜单导航分析示例
 * 演示如何使用转换器和函数式页面打开功能
 */

// Import polyfills first
import '../polyfills.js';

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 使用 TypeScript 导入
import {
  createDefaultConfig,
  MenuAnalysisEngine,
  MenuItem,
  MenuFunctionality
} from '../src/index.js';
import { NCEMenuTransformer } from '../src/menu-transformers/index.js';
import { Page } from 'playwright';
import * as fs from 'fs-extra';

// 现在使用 NCEMenuTransformer
async function transformMenuConfig(filePath: string): Promise<MenuItem[]> {
  return await NCEMenuTransformer.transformFromJsonFile(filePath);
}

function filterWithEmit(menuItems: MenuItem[]): MenuItem[] {
  return NCEMenuTransformer.filterWithEmit(menuItems);
}

/**
 * 菜单打开回调函数 - 这是核心的函数式导航实现
 */
async function handleMenuOpen(page: Page, emit: string[], menuItem: MenuItem): Promise<void> {
  console.log(`📱 通过函数打开菜单: ${menuItem.text}`);
  console.log(`   Emit 动作: [${emit.map(e => `"${e}"`).join(', ')}]`);
  console.log(`   新窗口模式: ${menuItem.preferNewWindow ? '是' : '否'}`);

  try {
    // 先初始化，再执行跳转，预期会有导航发生
    await page.evaluate(({ emit }) => {
      console.log('into page.evaluate...');
      if (emit && emit.length) {
        // 初始化 PIU
        if (!(window as any).isInitPIU) {
          (window as any).Prel.define({ 'abc@1.0.0': { config: { base: '/invgrpwebsite' } } });
          (window as any).Prel.start('abc', '1.0.0', [], (piu, st) => {
            (window as any).abcPiu = piu;
            // 执行跳转（这会导致页面跳转和上下文销毁）
            (window as any).abcPiu.emit('userAction', ...emit);
          });
          (window as any).isInitPIU = true;
        } else {
          // 执行跳转（这会导致页面跳转和上下文销毁）
          (window as any).abcPiu.emit('userAction', ...emit);
        }
      }
    }, { emit });

  } catch (e) {
    // 预期的错误 - 执行上下文被销毁意味着跳转成功
    if (e.message.includes('Execution context was destroyed')) {
      console.log(`   🔄 页面正在跳转...`);
    } else {
      console.error('意外错误：', e);
    }
  }

  // 增加3秒等待，给页面跳转更充足的时间
  console.log(`   ⏰ 等待3秒...`);
  await page.waitForTimeout(3000);

  // 等待新页面加载完成
  console.log(`   ⏳ 等待新页面加载...`);
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log(`   ✅ 页面加载完成: ${page.url()}\n`);
  } catch (e) {
    console.log(`   ⚠️  页面加载超时，当前页面: ${page.url()}\n`);
  }
}

/**
 * 使用 MenuAnalysisEngine 完整分析所有菜单
 */
async function analyzeFullMenuTree(): Promise<MenuFunctionality[]> {
  try {
    console.log('🌳 完整菜单树分析示例...');

    // 加载菜单配置
    const configPath = path.join(__dirname, 'menus-config.json');
    const allMenuItems = await transformMenuConfig(configPath);
    const menuItemsWithEmit = filterWithEmit(allMenuItems);

    console.log(`📊 加载完成: ${allMenuItems.length} 个菜单项，${menuItemsWithEmit.length} 个有emit动作`);

    const selectedMenus = allMenuItems;

    // 创建分析配置
    const config = createDefaultConfig();

    // 配置爬虫参数（MenuCrawler需要MenuConfig类型的配置）
    config.crawler = {
      // MenuConfig 额外字段（通过 as any 传递）
      baseUrl: process.env.BASE_URL || '',
      loginConfig: {
        loginUrl: process.env.LOGIN_URL || '',
        usernameSelector: process.env.USERNAME_SELECTOR || '#username',
        passwordSelector: process.env.PASSWORD_SELECTOR || '#password',
        submitSelector: process.env.LOGIN_BUTTON_SELECTOR || 'button[type="submit"]',
        username: process.env.LOGIN_USERNAME || 'admin',
        password: process.env.LOGIN_PASSWORD || 'password'
      },
      // 登录后处理逻辑
      loginPost: async (page: Page) => {
        console.log('🔍 检查登录后页面...');
        const currentUrl = page.url();
        console.log(`   当前页面URL: ${currentUrl}`);
        
        if (currentUrl.includes('licenseChooseMenu.html')) {
          console.log('📄 检测到许可证选择页面，点击登录链接...');
          try {
            // 等待并点击 #loginLink 元素
            await page.waitForSelector('#loginLink', { timeout: 5000 });
            await page.click('#loginLink');
            console.log('✅ 成功点击 #loginLink');
            
            // 等待页面跳转完成
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            console.log(`✅ 跳转完成，新页面URL: ${page.url()}`);
          } catch (error) {
            console.warn(`⚠️ 点击 #loginLink 失败: ${error.message}`);
          }
        } else {
          console.log('ℹ️  页面不包含 licenseChooseMenu.html，跳过额外处理');
        }
      }
    } as any;

    // 配置函数式导航回调
    config.onMenuOpen = async (page: Page, emit: string[]): Promise<void> => {
      const currentMenuItem = (globalThis as any).currentAnalyzingMenuItem;
      if (currentMenuItem) {
        await handleMenuOpen(page, emit, currentMenuItem);
        return;
      }
      console.log(`  ⚠️ 未找到当前分析的菜单项`);
    };

    // 配置菜单关闭回调
    config.onMenuClose = async (page: Page): Promise<void> => {
      try {
        console.log('🔍 查找最后一个关闭按钮...');
        
        // 查找所有匹配的关闭按钮
        const closeButtons = await page.locator('#homepage-wrapper .ev_tab_header_normal div span.ev_tab_closeSpan').all();
        
        if (closeButtons.length > 0) {
          // 获取最后一个关闭按钮
          const lastCloseButton = closeButtons[closeButtons.length - 1];
          
          console.log(`📍 找到 ${closeButtons.length} 个关闭按钮，点击最后一个...`);
          
          // 点击最后一个关闭按钮
          await lastCloseButton.click();
          
          console.log('✅ 成功点击关闭按钮');
          
          // 等待一小段时间让界面更新
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ 未找到任何关闭按钮');
        }
      } catch (error) {
        console.error('❌ 点击关闭按钮失败:', error.message);
      }
    };

    // 配置自定义内容提取回调
    config.onExtractContent = async (page: Page, menuItem: any) => {
      let windowContent: any = { html: '', title: '', url: '' };

      // 检查第二个参数是否包含Action属性
      let useScreenshot = false;
      if (menuItem.emit && menuItem.emit.length > 1) {
        try {
          const correctedJson = menuItem.emit[1].replace(/'/g, '"');
          const secondParam = JSON.parse(correctedJson);
          if (secondParam && typeof secondParam === 'object' && ('Action' in secondParam) || ('CmdId' in secondParam)) {
            useScreenshot = true;
            console.log(`   📸 检测到Action或者CmdId属性，将使用截图方式: ${secondParam.Action} - ${secondParam.CmdId}`);
          }
        } catch (e) {
          // 如果解析失败，继续使用原有逻辑
          console.log(`   ⚠️ 第二个参数解析失败，使用默认处理方式`);
        }
      }

      if (useScreenshot) {
        // 使用截图方式处理
        try {
          console.log(`   📸 使用截图方式提取内容...`);

          // 确保截图目录存在
          const screenshotDir = path.join(__dirname, 'screenshots');
          await fs.ensureDir(screenshotDir);

          // 等待canvas元素出现
          // await page.waitForSelector('.internal-frames-wrapper canvas', { timeout: 5000 });
          await page.waitForTimeout(10000);

          // 使用Playwright截图功能获取canvas内容
          const canvasElement = page.locator('#root').last();
          const screenshotBuffer = await canvasElement.screenshot({ type: 'png' });

          // 将截图转换为dataURL格式
          const dataURL = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

          // 返回符合WindowContent接口的内容
          windowContent = {
            title: menuItem.text,
            html: `<div class="canvas-content"><h2>Canvas-based Menu Content</h2><p>Menu: ${menuItem.text}</p><p>Action: ${menuItem.emit[1]}</p></div>`,
            url: page.url(),
            type: 'screenshot' as const,
            dataURL: dataURL
          };

        } catch (e) {
          console.error(`   ❌ 截图处理失败:`, e.message);
          // 回退到原有逻辑
          useScreenshot = false;
        }
      } else {
        // 原有的内容提取逻辑
        if (menuItem.preferNewWindow) {
          await page.waitForSelector('iframe.spa_iframe');

          // Extract page content from spa iframe
          windowContent = await page.evaluate(() => {
            const spaIframes = document.querySelectorAll('iframe.spa_iframe');
            const lastSpaIframe = spaIframes[spaIframes.length - 1] as HTMLIFrameElement;

            if (lastSpaIframe && lastSpaIframe.contentDocument) {
              return {
                title: lastSpaIframe.contentDocument.title,
                html: lastSpaIframe.contentDocument.documentElement.outerHTML,
                url: lastSpaIframe.contentWindow?.location.href || '',
                type: 'html' as const
              };
            }

            return { title: '', html: '', url: '', type: 'html' as const };
          });
        } else {
          // Extract page content
          await page.waitForSelector('#webswing-root-container iframe');

          windowContent = await page.evaluate(() => {
            const container = document.querySelector('#webswing-root-container');
            const iframes = container?.querySelectorAll('iframe');
            const lastIframe = iframes?.[iframes.length - 1] as HTMLIFrameElement;

            if (lastIframe && lastIframe.contentDocument) {
              return {
                title: lastIframe.contentDocument.title,
                html: lastIframe.contentDocument.documentElement.outerHTML,
                url: lastIframe.contentWindow?.location.href || '',
                type: 'html' as const
              };
            }

            return { title: '', html: '', url: '', type: 'html' as const };
          });
        }
      }

      return windowContent;
    };

    // 创建分析引擎
    const engine = new MenuAnalysisEngine(config);

    console.log(`🚀 开始分析 ${selectedMenus.length} 个菜单功能...\n`);

    try {

      // MenuAnalysisEngine 会自动处理登录和初始化
      console.log('🔐 MenuAnalysisEngine 将自动处理登录流程...');

      console.log('📋 第三步：开始菜单功能分析...');
      console.log('='.repeat(50));

      const results: MenuFunctionality[] = [];

      for (const menuItem of selectedMenus) {
        console.log(`🔸 分析菜单: ${menuItem.text}`);
        console.log(`   ID: ${menuItem.id}`);
        console.log(`   Emit: [${menuItem.emit?.join(', ') || 'none'}]`);

        // MenuAnalysisEngine 会自动处理登录状态检查

        try {
          // 设置当前菜单项供回调使用
          (globalThis as any).currentAnalyzingMenuItem = menuItem;

          console.log(`   🔄 开始页面分析...`);

          // 直接传入完整的 menuItem，引擎会自动处理登录和导航
          const functionality = await engine.analyzeSingleMenu(menuItem);

          results.push(functionality);
          console.log(`   ✅ 分析完成: ${functionality.primaryFunction}`);
          console.log(`   📊 置信度: ${(functionality.confidence * 100).toFixed(1)}%`);

        } catch (error) {
          console.log(`   ❌ 分析失败: ${error.message}`);

          // 提供错误提示
          if (error.message.includes('login') || error.message.includes('auth')) {
            console.log(`   💡 提示: 检查 config.crawler.loginConfig 配置\n`);
          } else {
            console.log(`   💡 提示: 检查页面结构或网络连接\n`);
          }
        }
      }

      // 清理
      delete (globalThis as any).currentAnalyzingMenuItem;

      console.log('='.repeat(50));
      console.log(`🎉 分析完成！成功分析了 ${results.length} 个菜单功能`);
      console.log(`📊 分析成功率: ${((results.length / selectedMenus.length) * 100).toFixed(1)}%`);

      // 保存结果到文件
      const fs = require('fs-extra');
      const outputPath = path.join(__dirname, 'results', 'NCE-analysis.json');
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, results, { spaces: 2 });

      console.log(`📁 结果保存到: ${outputPath}`);

      return results;

    } catch (analysisError) {
      console.error('❌ 菜单分析过程失败:', analysisError);
      throw analysisError;
    } finally {
      // 确保清理引擎资源
      try {
        await engine.close();
        console.log('🧹 引擎资源已清理');
      } catch (cleanupError) {
        console.log('⚠️ 清理资源时出现警告:', cleanupError.message);
      }
    }

  } catch (error) {
    console.error('❌ 完整分析失败:', error);
    throw error;
  }
}

analyzeFullMenuTree().catch(console.error);
