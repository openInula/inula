import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { LLMConfig, MenuFunctionality, MenuItem, LLMAnalysisRequest } from '../types';
import { Logger } from '../utils/Logger';
import * as fs from 'fs/promises';

// 图片分析配置
export interface ImageAnalysisConfig {
  provider?: 'openai';
  model?: string;
  maxTokens?: number;
  prompt?: string;
  temperature?: number;
}

// 图片分析结果
export interface ImageAnalysisResult {
  filePath: string;
  analysis: string;
  visualElements?: string[];
  confidence?: number;
}

export class LLMAnalyzer {
  private htmlAnalysisClient: OpenAI; // DeepSeek客户端用于菜单分析
  private imageAnalysisClient: OpenAI; // OpenAI客户端用于图像分析
  private config: LLMConfig;
  private logger: Logger;
  private proxyAgent?: HttpsProxyAgent<string>;

  constructor(config: LLMConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;

    // 内网代理配置
    this.setupProxy();

    // 创建HTML分析客户端 (DeepSeek)
    const menuConfig = (config as any).htmlAnalysis || {};
    const menuProvider = menuConfig.provider || 'deepseek';
    const menuBaseURL = menuConfig.baseUrl || 
      (menuProvider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1');
    
    const htmlClientConfig: any = {
      apiKey: menuConfig.apiKey || process.env.DEEPSEEK_API_KEY || (config.htmlAnalysis?.apiKey),
      baseURL: menuBaseURL
    };
    
    if (this.proxyAgent) {
      htmlClientConfig.httpAgent = this.proxyAgent;
      htmlClientConfig.httpsAgent = this.proxyAgent;
    }
    
    this.htmlAnalysisClient = new OpenAI(htmlClientConfig);

    // 创建图像分析客户端 (OpenAI)
    const imageConfig = (config as any).imageAnalysis || {};
    const imageProvider = imageConfig.provider || 'openai';
    const imageBaseURL = imageConfig.baseUrl || 
      (imageProvider === 'openai' ? 'https://api.openai.com/v1' : 'https://api.deepseek.com');
    
    const imageClientConfig: any = {
      apiKey: imageConfig.apiKey || process.env.OPENAI_API_KEY || (config.imageAnalysis?.apiKey),
      baseURL: imageBaseURL
    };
    
    if (this.proxyAgent) {
      imageClientConfig.httpAgent = this.proxyAgent;
      imageClientConfig.httpsAgent = this.proxyAgent;
    }
    
    this.imageAnalysisClient = new OpenAI(imageClientConfig);
  }

  private setupProxy(): void {
    try {
      // 从环境变量读取华为企业代理配置
      const HUAWEI_PROXY = process.env.HUAWEI_PROXY || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

      if (!HUAWEI_PROXY) {
        this.logger.info('No proxy configuration found in environment variables');
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

      // 是否禁用 SSL 验证（从环境变量读取，默认禁用）
      const rejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';
      if (process.env.DISABLE_SSL_VERIFY === 'true' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }

      // 创建支持华为代理的 HTTPS Agent
      this.proxyAgent = new HttpsProxyAgent(HUAWEI_PROXY, {
        rejectUnauthorized: !rejectUnauthorized,
        timeout: parseInt(process.env.PROXY_TIMEOUT || '60000'),
        keepAlive: true
      });
    } catch (error) {
      this.logger.warn('Failed to setup proxy configuration:', error);
      // Continue without proxy if setup fails
      this.proxyAgent = undefined;
    }
  }

  async analyzeMenuFunctionality(request: LLMAnalysisRequest): Promise<MenuFunctionality> {
    this.logger.info(`Analyzing functionality for menu: ${request.menuItem.text} using DeepSeek`);

    const prompt = this.buildAnalysisPrompt(request);

    try {
      // Get HTML analysis config
      const htmlConfig = (this.config as any).htmlAnalysis || {};
      
      // Prepare request options
      const requestOptions: any = {
        model: htmlConfig.model || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: htmlConfig.temperature || 0.3,
        max_tokens: htmlConfig.maxTokens || 2000
      };

      // DeepSeek doesn't support response_format parameter yet
      if (htmlConfig.provider !== 'deepseek') {
        requestOptions.response_format = { type: 'json_object' };
      }

      const response = await this.htmlAnalysisClient.chat.completions.create(requestOptions);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received from DeepSeek');
      }

      // For DeepSeek, we need to extract JSON from the response
      let analysis: MenuFunctionality;
      try {
        if (htmlConfig.provider === 'deepseek') {
          // Extract JSON from markdown code blocks or direct JSON
          const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                           content.match(/(\{[\s\S]*\})/);
          const jsonStr = jsonMatch ? jsonMatch[1] : content;
          analysis = JSON.parse(jsonStr) as MenuFunctionality;
        } else {
          analysis = JSON.parse(content) as MenuFunctionality;
        }
      } catch (parseError) {
        this.logger.warn(`Failed to parse DeepSeek response as JSON: ${parseError}`, { content });
        throw new Error(`Invalid JSON response from DeepSeek: ${parseError}`);
      }

      // Ensure required fields and add metadata
      analysis.id = request.menuItem.id;
      analysis.name = request.menuItem.text;
      analysis.emit = request.menuItem.emit || '';

      this.logger.info(`Successfully analyzed menu with DeepSeek: ${request.menuItem.text}`);
      return analysis;

    } catch (error) {
      this.logger.error(`Failed to analyze menu ${request.menuItem.text} with DeepSeek:`, error);

      // Return fallback analysis
      return this.createFallbackAnalysis(request.menuItem, request.pageContent);
    }
  }

  private getSystemPrompt(): string {
    const htmlConfig = (this.config as any).htmlAnalysis || {};
    return htmlConfig.systemPrompt || `
你是一个专业的系统功能分析师，擅长分析网页内容并总结菜单功能。你需要基于提供的页面内容，生成结构化的菜单功能描述。

请严格按照以下JSON格式返回分析结果：

{
  "id": "菜单ID",
  "name": "菜单名称",
  "primaryFunction": "主要功能"
}

分析要求：
1. 基于页面的表单、表格、按钮等元素推断功能
2. 从页面标题、文本内容理解业务背景
3. 识别用户可能的操作流程
4. 提供简洁明确的功能描述

请确保返回有效的JSON格式。
    `.trim();
  }

  private buildAnalysisPrompt(request: LLMAnalysisRequest): string {
    const { menuItem, pageContent } = request;

    return `
请分析以下菜单功能：

## 菜单信息
- 菜单名称: ${menuItem.text}
- 菜单层级: ${menuItem.level}
- 页面URL: ${menuItem.url}
- 菜单路径: ${request.context || ''}

## 页面内容分析

### 页面基本信息
- 页面标题: ${pageContent.metadata?.description || 'N/A'}
- 页面类型: ${pageContent.metadata?.pageType || 'N/A'}
- 面包屑: ${pageContent.metadata?.breadcrumbs?.join(' > ') || 'N/A'}

### 表单分析 (${pageContent.forms?.length || 0}个表单)
${this.formatForms(pageContent.forms || [])}

### 表格分析 (${pageContent.tables?.length || 0}个表格)
${this.formatTables(pageContent.tables || [])}

### 按钮操作 (${pageContent.buttons?.length || 0}个按钮)
${this.formatButtons(pageContent.buttons || [])}

### 页面文本内容（前500字符）
${pageContent.text?.substring(0, 500) || 'N/A'}

请基于以上信息，分析该菜单的功能并返回JSON格式的结果。
    `.trim();
  }

  private formatForms(forms: any[]): string {
    if (forms.length === 0) return '无表单';

    return forms.map((form, index) => {
      const fields = form.fields?.map((f: any) => `${f.label || f.name || f.type}`).join(', ') || '无字段';
      return `表单${index + 1}: ${form.purpose || '未知用途'} - 字段: ${fields}`;
    }).join('\n');
  }

  private formatTables(tables: any[]): string {
    if (tables.length === 0) return '无表格';

    return tables.map((table, index) => {
      const headers = table.headers?.join(', ') || '无表头';
      return `表格${index + 1}: ${table.purpose || '数据展示'} - 列: ${headers} - 行数: ${table.rowCount} - 有操作: ${table.hasActions ? '是' : '否'}`;
    }).join('\n');
  }

  private formatButtons(buttons: any[]): string {
    if (buttons.length === 0) return '无按钮';

    const buttonsByPurpose = buttons.reduce((acc: any, btn) => {
      const purpose = btn.purpose || 'action';
      acc[purpose] = (acc[purpose] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(buttonsByPurpose)
      .map(([purpose, count]) => `${purpose}: ${count}个`)
      .join(', ');
  }

  private createFallbackAnalysis(menuItem: MenuItem, pageContent: any): MenuFunctionality {
    // Create a basic analysis when LLM fails
    const hasForm = (pageContent.forms?.length || 0) > 0;
    const hasTable = (pageContent.tables?.length || 0) > 0;
    const buttonCount = pageContent.buttons?.length || 0;

    let primaryFunction = '信息展示';

    if (hasForm && hasTable) {
      primaryFunction = '数据管理';
    } else if (hasForm) {
      primaryFunction = '数据录入';
    } else if (hasTable) {
      primaryFunction = '数据查询';
    }

    if (buttonCount > 0) {
      primaryFunction += ' - 可交互操作';
    }

    return {
      id: menuItem.id,
      name: menuItem.text,
      primaryFunction,
      emit: menuItem.emit
    };
  }

  async batchAnalyze(requests: LLMAnalysisRequest[]): Promise<MenuFunctionality[]> {
    const results: MenuFunctionality[] = [];
    const batchSize = 5; // Process in small batches to avoid rate limits

    this.logger.info(`Starting batch analysis of ${requests.length} menus...`);

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      this.logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(requests.length / batchSize)}`);

      const batchPromises = batch.map(request =>
        this.analyzeMenuFunctionality(request).catch(error => {
          this.logger.error(`Failed to analyze ${request.menuItem.text}:`, error);
          return this.createFallbackAnalysis(request.menuItem, request.pageContent);
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.logger.info(`Completed batch analysis. Processed ${results.length} menus.`);
    return results;
  }

  async analyzeImage(imagePath: string, config: ImageAnalysisConfig): Promise<ImageAnalysisResult> {
    this.logger.info(`Analyzing image: ${imagePath} using OpenAI`);

    try {
      // 读取图片文件并转换为base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeTypeFromPath(imagePath);
      
      const prompt = config.prompt || this.getDefaultImagePrompt();
      
      // 强制使用OpenAI进行图像分析
      let analysis = await this.analyzeImageWithOpenAI(base64Image, mimeType, prompt, config);

      const result: ImageAnalysisResult = {
        filePath: imagePath,
        analysis,
        visualElements: this.extractVisualElementsFromAnalysis(analysis),
        confidence: this.calculateConfidence(analysis)
      };

      this.logger.info(`Image analysis completed: ${imagePath}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to analyze image ${imagePath}:`, error);
      throw error;
    }
  }

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

  private getDefaultImagePrompt(): string {
    return `
分析这个页面截图或界面元素，请提取以下信息：

1. **页面功能和用途**：这个页面的主要作用是什么？
2. **UI元素和组件**：识别可见的按钮、表单、表格、导航等元素
3. **页面布局和结构**：描述页面的整体布局和信息组织方式
4. **交互元素**：用户可以进行哪些操作？
5. **视觉层次**：页面的信息重要性和视觉引导
6. **数据内容**：如果有图表或数据展示，请描述其内容

请用中文回答，并提供具体的观察和分析。
    `.trim();
  }

  private async analyzeImageWithOpenAI(
    base64Image: string, 
    mimeType: string, 
    prompt: string, 
    config: ImageAnalysisConfig
  ): Promise<string> {
    try {
      const response = await this.imageAnalysisClient.chat.completions.create({
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

      return response.choices[0]?.message?.content || 'No analysis generated';
    } catch (error) {
      this.logger.error('OpenAI image analysis failed:', error);
      throw error;
    }
  }

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