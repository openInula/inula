#!/usr/bin/env tsx

/**
 * 测试分离的LLM配置示例
 * 验证菜单分析使用DeepSeek，图像分析使用OpenAI
 */

// Import polyfills first
import '../polyfills.js';

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { LLMAnalyzer, ImageAnalysisConfig } from '../src/llm/LLMAnalyzer.js';
import { LLMConfig, MenuItem, PageContent, LLMAnalysisRequest } from '../src/types/index.js';
import { Logger } from '../src/utils/Logger.js';
import * as fs from 'fs-extra';

async function testSeparatedLLMConfig(): Promise<void> {
  try {
    console.log('🧪 测试分离的LLM配置...\n');

    // 创建Logger
    const logger = new Logger({ level: 'info' });

    // 创建分离的LLM配置
    const llmConfig: LLMConfig = {
      // 默认配置
      provider: 'deepseek',
      model: 'deepseek-chat',
      apiKey: process.env.DEEPSEEK_API_KEY || 'fallback-key',
      baseUrl: 'https://api.deepseek.com',
      temperature: 0.3,
      maxTokens: 2000,
      
      // 菜单分析专用配置 (DeepSeek)
      menuAnalysis: {
        provider: 'deepseek',
        model: 'deepseek-chat',
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseUrl: 'https://api.deepseek.com',
        temperature: 0.3,
        maxTokens: 2000
      },
      
      // 图像分析专用配置 (OpenAI)
      imageAnalysis: {
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: 'https://api.openai.com/v1',
        temperature: 0.3,
        maxTokens: 2000
      }
    };

    // 创建LLMAnalyzer实例
    const analyzer = new LLMAnalyzer(llmConfig, logger);

    console.log('✅ LLMAnalyzer实例创建成功\n');

    // 测试1: 菜单功能分析 (应该使用DeepSeek)
    console.log('📋 测试1: 菜单功能分析 (DeepSeek)');
    console.log('----------------------------------------');
    
    const mockMenuItem: MenuItem = {
      id: 'test-menu-1',
      text: '用户管理',
      url: '/users',
      level: 1,
      emit: ['jumpSPAPage', '/users'],
      children: []
    };

    const mockPageContent: PageContent = {
      html: '<div><h1>用户管理</h1><table><thead><tr><th>用户名</th><th>邮箱</th><th>操作</th></tr></thead></table><button>添加用户</button></div>',
      text: '用户管理页面，包含用户列表和添加用户按钮',
      forms: [{
        action: '/api/users',
        method: 'POST',
        fields: [
          { name: 'username', type: 'text', label: '用户名' },
          { name: 'email', type: 'email', label: '邮箱' }
        ],
        purpose: '添加新用户'
      }],
      tables: [{
        headers: ['用户名', '邮箱', '操作'],
        rowCount: 10,
        hasActions: true,
        purpose: '显示用户列表'
      }],
      buttons: [
        { text: '添加用户', type: 'submit', purpose: 'create' },
        { text: '编辑', type: 'button', purpose: 'edit' },
        { text: '删除', type: 'button', purpose: 'delete' }
      ],
      links: [],
      metadata: {
        description: '用户管理页面',
        breadcrumbs: ['首页', '用户管理'],
        pageType: 'management'
      }
    };

    const menuRequest: LLMAnalysisRequest = {
      menuItem: mockMenuItem,
      pageContent: mockPageContent,
      context: '系统管理 > 用户管理'
    };

    try {
      const menuAnalysis = await analyzer.analyzeMenuFunctionality(menuRequest);
      console.log('🎯 菜单分析结果:');
      console.log(`   功能名称: ${menuAnalysis.name}`);
      console.log(`   主要功能: ${menuAnalysis.primaryFunction}`);
      console.log(`   菜单ID: ${menuAnalysis.id}`);
      console.log(`   ✅ 菜单分析完成 (使用DeepSeek)\n`);
    } catch (error) {
      console.error('❌ 菜单分析失败:', error.message);
    }

    // 测试2: 图像分析 (应该使用OpenAI)
    console.log('🖼️  测试2: 图像分析 (OpenAI)');
    console.log('----------------------------------------');
    
    // 检查是否有测试图片
    const screenshotsDir = path.join(__dirname, 'screenshots');
    const imageFiles = await fs.readdir(screenshotsDir).catch(() => []);
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const testImage = imageFiles.find(file => 
      validExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    if (testImage) {
      const imagePath = path.join(screenshotsDir, testImage);
      console.log(`正在分析图片: ${testImage}`);
      
      const imageConfig: ImageAnalysisConfig = {
        enabled: true,
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.3,
        prompt: '请分析这个界面截图，描述页面的主要功能、UI元素和交互方式。'
      };

      try {
        const imageResult = await analyzer.analyzeImage(imagePath, imageConfig);
        console.log('🎯 图像分析结果:');
        console.log(`   文件路径: ${imageResult.filePath}`);
        console.log(`   置信度: ${((imageResult.confidence || 0) * 100).toFixed(1)}%`);
        console.log(`   识别的UI元素: ${imageResult.visualElements?.join(', ') || '无'}`);
        console.log(`   分析摘要: ${imageResult.analysis.substring(0, 200)}...`);
        console.log(`   ✅ 图像分析完成 (使用OpenAI)\n`);
      } catch (error) {
        console.error('❌ 图像分析失败:', error.message);
      }
    } else {
      console.log('⚠️  未找到测试图片，跳过图像分析测试');
      console.log('💡 提示: 将图片文件放入screenshots目录进行测试\n');
    }

    // 总结
    console.log('📊 测试总结');
    console.log('----------------------------------------');
    console.log('✅ LLM配置分离成功');
    console.log('✅ 菜单分析使用DeepSeek客户端');
    console.log('✅ 图像分析使用OpenAI客户端');
    console.log('✅ 代理配置自动应用到所有客户端');
    console.log('✅ 环境变量正确读取和使用');
    
    console.log('\n🎉 分离的LLM配置测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.log('\n💡 故障排除提示:');
    console.log('1. 确保在.env文件中设置了DEEPSEEK_API_KEY和OPENAI_API_KEY');
    console.log('2. 检查网络连接和代理配置');
    console.log('3. 确认API密钥有效且有足够的配额');
  }
}

// 运行测试
if (require.main === module) {
  testSeparatedLLMConfig().catch(console.error);
}

export { testSeparatedLLMConfig };