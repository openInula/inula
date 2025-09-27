#!/usr/bin/env tsx

/**
 * OpenAI图像分析示例
 * 演示如何使用OpenAI Vision API分析截图和图像内容
 */

// Import polyfills first
import '../polyfills.js';

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs-extra';

// Load .env file from the project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface ImageAnalysisConfig {
  enabled: boolean;
  provider?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  prompt?: string;
}

interface ImageAnalysisResult {
  filePath: string;
  analysis: string;
  visualElements: string[];
  suggestions: string[];
  confidence: number;
}

class OpenAIImageAnalyzer {
  private client: OpenAI;
  private logger: any;
  private proxyAgent?: HttpsProxyAgent<string>;

  constructor(apiKey: string) {
    // 设置代理
    this.setupProxy();
    
    // 创建OpenAI客户端配置
    const clientConfig: any = {
      apiKey: apiKey
    };

    // 如果有代理，添加到配置中
    if (this.proxyAgent) {
      clientConfig.httpAgent = this.proxyAgent;
      clientConfig.httpsAgent = this.proxyAgent;
    }

    this.client = new OpenAI(clientConfig);
    
    this.logger = {
      info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
      warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
      error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args)
    };

    this.logger.info('OpenAI图像分析器已初始化', {
      proxyEnabled: !!this.proxyAgent
    });
  }

  private setupProxy(): void {
    try {
      // 从环境变量读取华为企业代理配置
      const HUAWEI_PROXY = process.env.HUAWEI_PROXY || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

      if (!HUAWEI_PROXY) {
        this.logger?.info('未找到代理配置');
        this.proxyAgent = undefined;
        return;
      }

      // 设置代理环境变量（如果尚未设置）
      if (!process.env.HTTP_PROXY) {
        process.env.HTTP_PROXY = HUAWEI_PROXY;
      }
      if (!process.env.HTTPS_PROXY) {
        process.env.HTTPS_PROXY = HUAWEI_PROXY;
      }

      // 设置不使用代理的地址
      const noProxy = process.env.NO_PROXY || 'localhost,127.0.0.1,.huawei.com';
      process.env.NO_PROXY = noProxy;

      // 是否禁用SSL验证（从环境变量读取，默认禁用）
      const rejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';
      if (process.env.DISABLE_SSL_VERIFY === 'true' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }

      // 创建支持华为代理的HTTPS Agent
      this.proxyAgent = new HttpsProxyAgent(HUAWEI_PROXY, {
        rejectUnauthorized: !rejectUnauthorized,
        timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
        keepAlive: true
      });

      this.logger?.info('代理配置已应用', {
        proxy: this.maskProxyUrl(HUAWEI_PROXY),
        noProxy,
        sslVerification: rejectUnauthorized,
        timeout: parseInt(process.env.PROXY_TIMEOUT || '60000')
      });

    } catch (error) {
      this.logger?.warn('代理配置设置失败:', error);
      // 如果代理设置失败，继续不使用代理
      this.proxyAgent = undefined;
    }
  }

  /**
   * 遮掩代理URL中的敏感信息
   */
  private maskProxyUrl(proxyUrl: string): string {
    try {
      const url = new URL(proxyUrl);
      if (url.username) {
        // 只显示用户名的前3个字符，密码完全遮掩
        const maskedUsername = url.username.substring(0, 3) + '*'.repeat(Math.max(0, url.username.length - 3));
        const maskedPassword = url.password ? '*'.repeat(url.password.length) : '';
        return `${url.protocol}//${maskedUsername}:${maskedPassword}@${url.host}`;
      }
      return proxyUrl;
    } catch {
      return proxyUrl.replace(/\/\/[^@]+@/, '//***:***@');
    }
  }

  /**
   * 分析单个图像
   */
  async analyzeImage(imagePath: string, config: ImageAnalysisConfig): Promise<ImageAnalysisResult> {
    if (!config.enabled) {
      throw new Error('Image analysis is not enabled');
    }

    this.logger.info(`开始分析图像: ${imagePath}`);

    try {
      // 读取图片文件并转换为base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeTypeFromPath(imagePath);
      
      const prompt = config.prompt || this.getDefaultImagePrompt();
      
      const analysis = await this.analyzeImageWithOpenAI(base64Image, mimeType, prompt, config);

      const result: ImageAnalysisResult = {
        filePath: imagePath,
        analysis,
        visualElements: this.extractVisualElementsFromAnalysis(analysis),
        suggestions: this.extractSuggestionsFromAnalysis(analysis),
        confidence: this.calculateConfidence(analysis)
      };

      this.logger.info(`图像分析完成: ${imagePath}`);
      return result;

    } catch (error) {
      this.logger.error(`图像分析失败 ${imagePath}:`, error);
      throw error;
    }
  }

  /**
   * 使用OpenAI Vision API分析图像
   */
  private async analyzeImageWithOpenAI(
    base64Image: string, 
    mimeType: string, 
    prompt: string, 
    config: ImageAnalysisConfig
  ): Promise<string> {
    try {
      this.logger.info('调用OpenAI Vision API...');
      
      const response = await this.client.chat.completions.create({
        model: config.model || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.3
      });

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error('OpenAI API返回空分析结果');
      }

      return analysis;
    } catch (error) {
      this.logger.error('OpenAI图像分析失败:', error);
      throw error;
    }
  }

  /**
   * 批量分析多个图像
   */
  async batchAnalyzeImages(imagePaths: string[], config: ImageAnalysisConfig): Promise<ImageAnalysisResult[]> {
    if (!config.enabled || imagePaths.length === 0) {
      return [];
    }

    const results: ImageAnalysisResult[] = [];
    const batchSize = 3; // 图片分析更耗费资源，使用更小的批次

    this.logger.info(`开始批量图像分析，共 ${imagePaths.length} 张图片...`);

    for (let i = 0; i < imagePaths.length; i += batchSize) {
      const batch = imagePaths.slice(i, i + batchSize);

      this.logger.info(`处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(imagePaths.length / batchSize)}`);

      const batchPromises = batch.map(imagePath =>
        this.analyzeImage(imagePath, config).catch(error => {
          this.logger.error(`分析图片失败 ${imagePath}:`, error);
          return {
            filePath: imagePath,
            analysis: `分析失败: ${error.message}`,
            visualElements: [],
            suggestions: [],
            confidence: 0
          } as ImageAnalysisResult;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 图片分析间隔时间更长，避免API限制
      if (i + batchSize < imagePaths.length) {
        this.logger.info('等待2秒后继续下一批次...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    this.logger.info(`批量图像分析完成。处理了 ${results.length} 张图片。`);
    return results;
  }

  /**
   * 获取文件的MIME类型
   */
  private getMimeTypeFromPath(imagePath: string): string {
    const extension = imagePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/png';
    }
  }

  /**
   * 获取默认的图像分析提示词
   */
  private getDefaultImagePrompt(): string {
    return `
分析这个页面截图或界面元素，请提取以下信息：

1. **页面功能和用途**：这个页面的主要作用是什么？
2. **UI元素和组件**：识别可见的按钮、表单、表格、导航等元素
3. **页面布局和结构**：描述页面的整体布局和信息组织方式
4. **交互元素**：用户可以进行哪些操作？
5. **视觉层次**：页面的信息重要性和视觉引导
6. **数据内容**：如果有图表或数据展示，请描述其内容
7. **可用性问题**：是否发现任何界面设计或用户体验问题

请用中文回答，并提供具体的观察和分析。
    `.trim();
  }

  /**
   * 从分析结果中提取视觉元素
   */
  private extractVisualElementsFromAnalysis(analysis: string): string[] {
    const elements: string[] = [];
    const text = analysis.toLowerCase();
    
    // 提取常见的UI元素
    const elementKeywords = [
      { keywords: ['按钮', 'button'], element: '按钮' },
      { keywords: ['表单', 'form'], element: '表单' },
      { keywords: ['表格', 'table'], element: '表格' },
      { keywords: ['导航', 'navigation', 'nav'], element: '导航' },
      { keywords: ['菜单', 'menu'], element: '菜单' },
      { keywords: ['图表', 'chart'], element: '图表' },
      { keywords: ['列表', 'list'], element: '列表' },
      { keywords: ['搜索', 'search'], element: '搜索框' },
      { keywords: ['输入框', 'input'], element: '输入框' },
      { keywords: ['下拉框', 'select', 'dropdown'], element: '下拉框' },
      { keywords: ['复选框', 'checkbox'], element: '复选框' },
      { keywords: ['单选框', 'radio'], element: '单选框' },
      { keywords: ['标签', 'tab'], element: '标签页' },
      { keywords: ['弹窗', 'modal', 'dialog'], element: '弹窗' },
      { keywords: ['工具栏', 'toolbar'], element: '工具栏' }
    ];

    elementKeywords.forEach(({ keywords, element }) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        elements.push(element);
      }
    });
    
    return [...new Set(elements)]; // 去重
  }

  /**
   * 从分析结果中提取建议
   */
  private extractSuggestionsFromAnalysis(analysis: string): string[] {
    const suggestions: string[] = [];
    const lines = analysis.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      // 寻找包含建议性词汇的行
      if (trimmedLine && (
        trimmedLine.includes('建议') || 
        trimmedLine.includes('推荐') || 
        trimmedLine.includes('可以') ||
        trimmedLine.includes('应该') ||
        trimmedLine.includes('优化') ||
        trimmedLine.includes('改进') ||
        trimmedLine.includes('问题')
      )) {
        suggestions.push(trimmedLine);
      }
    });
    
    return suggestions.slice(0, 5); // 限制建议数量
  }

  /**
   * 计算分析结果的置信度
   */
  private calculateConfidence(analysis: string): number {
    // 基于分析内容的长度和详细程度计算置信度
    let confidence = 0.5; // 基础置信度
    
    // 分析长度因子
    if (analysis.length > 500) confidence += 0.2;
    if (analysis.length > 1000) confidence += 0.1;
    
    // 结构化内容因子
    const structuredIndicators = ['1.', '2.', '3.', '**', '##', '###'];
    const structuredCount = structuredIndicators.filter(indicator => 
      analysis.includes(indicator)
    ).length;
    confidence += Math.min(structuredCount * 0.05, 0.2);
    
    // 具体描述因子
    const specificWords = ['按钮', '表单', '表格', '布局', '功能', '界面'];
    const specificCount = specificWords.filter(word => 
      analysis.includes(word)
    ).length;
    confidence += Math.min(specificCount * 0.02, 0.1);
    
    return Math.min(confidence, 1.0);
  }
}

/**
 * 示例使用函数
 */
async function demonstrateImageAnalysis(): Promise<void> {
  try {
    console.log('🖼️  OpenAI图像分析示例开始...\n');

    // 检查API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('请在.env文件中设置OPENAI_API_KEY环境变量');
    }

    // 创建分析器
    const analyzer = new OpenAIImageAnalyzer(apiKey);

    // 配置分析参数
    const analysisConfig: ImageAnalysisConfig = {
      enabled: true,
      model: 'gpt-4o', // 使用gpt-4o模型，支持图像分析
      maxTokens: 2000,
      temperature: 0.3,
      prompt: `
请分析这个界面截图，重点关注以下方面：

1. **界面功能识别**：这是什么类型的应用界面？主要功能是什么？
2. **UI组件分析**：列出所有可见的UI元素（按钮、输入框、表格、图表等）
3. **用户交互流程**：用户可以在这个界面上执行哪些操作？
4. **信息架构**：信息是如何组织和呈现的？
5. **视觉设计评估**：界面设计的优点和可能的改进点

请提供详细的中文分析结果。
      `
    };

    // 示例1：分析单个图片
    console.log('📸 示例1：分析单个图片');
    console.log('----------------------------------------');
    
    // 检查screenshots目录是否存在
    const screenshotsDir = path.join(__dirname, 'screenshots');
    await fs.ensureDir(screenshotsDir);
    
    // 查找第一个可用的截图文件
    const imageFiles = await fs.readdir(screenshotsDir);
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const imageFile = imageFiles.find(file => 
      validExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    if (imageFile) {
      const imagePath = path.join(screenshotsDir, imageFile);
      console.log(`正在分析图片: ${imageFile}`);
      
      const result = await analyzer.analyzeImage(imagePath, analysisConfig);
      
      console.log('\n📊 分析结果:');
      console.log(`文件: ${result.filePath}`);
      console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
      console.log('\n🔍 详细分析:');
      console.log(result.analysis);
      
      if (result.visualElements.length > 0) {
        console.log('\n🎨 识别的UI元素:');
        result.visualElements.forEach(element => {
          console.log(`  • ${element}`);
        });
      }
      
      if (result.suggestions.length > 0) {
        console.log('\n💡 改进建议:');
        result.suggestions.forEach(suggestion => {
          console.log(`  • ${suggestion}`);
        });
      }
      
      // 保存分析结果
      const outputDir = path.join(__dirname, 'results');
      await fs.ensureDir(outputDir);
      const outputPath = path.join(outputDir, `image-analysis-${Date.now()}.json`);
      await fs.writeJson(outputPath, result, { spaces: 2 });
      console.log(`\n💾 分析结果已保存到: ${outputPath}`);
      
    } else {
      console.log('❌ 在screenshots目录中未找到可分析的图片文件');
      console.log('💡 提示: 请将要分析的图片文件放入screenshots目录');
    }

    console.log('\n✅ OpenAI图像分析示例完成！');

  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
    console.log('\n💡 故障排除提示:');
    console.log('1. 确保在.env文件中设置了OPENAI_API_KEY');
    console.log('2. 检查网络连接是否正常');
    console.log('3. 确认API密钥有效且有足够的配额');
    console.log('4. 将要分析的图片文件放入examples/screenshots目录');
  }
}

// 运行示例
if (require.main === module) {
  demonstrateImageAnalysis().catch(console.error);
}

export { OpenAIImageAnalyzer, ImageAnalysisConfig, ImageAnalysisResult };