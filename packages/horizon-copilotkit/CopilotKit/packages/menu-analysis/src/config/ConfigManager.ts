import { AnalysisConfig, LLMConfig, CrawlerConfig, OutputConfig } from '../types';

export function createDefaultConfig(): AnalysisConfig {
  return {
    llm: {
      // HTML分析专用配置 (DeepSeek)
      htmlAnalysis: {
        provider: 'deepseek',
        model: 'deepseek-chat',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseUrl: 'https://api.deepseek.com',
        temperature: 0.3,
        maxTokens: 2000
      },
      // 图像分析专用配置 (OpenAI)
      imageAnalysis: {
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: 'https://api.openai.com/v1',
        temperature: 0.3,
        maxTokens: 2000
      }
    } as any,
    crawler: {
      concurrency: 1,
      delay: 3000,
      retries: 2,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 }
    },
    output: {
      format: 'json',
      outputPath: './menu-analysis-results',
      includeScreenshots: false,
      includeRawContent: false
    }
  };
}

export function createCrawlerConfig(baseUrl: string): CrawlerConfig {
  return {
    // 爬虫引擎配置
    concurrency: 3,
    delay: 1000,
    retries: 3,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
    // 菜单发现配置
    baseUrl,
    menuSelectors: [
      '[role="navigation"] a',
      '.menu a, .nav a',
      '.sidebar a',
      '.main-menu a',
      '.navigation a'
    ],
    excludePatterns: [
      'logout',
      'help',
      'javascript:',
      '#',
      'mailto:',
      'tel:'
    ],
    maxDepth: 3
  };
}

export function validateConfig(config: AnalysisConfig): void {
  // Validate separated LLM configs
  const llmConfig = config.llm as any;
  
  // Validate HTML analysis config
  if (llmConfig.htmlAnalysis) {
    if (!llmConfig.htmlAnalysis.apiKey) {
      throw new Error('HTML analysis API key is required');
    }
    if (!llmConfig.htmlAnalysis.model) {
      throw new Error('HTML analysis model is required');
    }
  } else {
    throw new Error('HTML analysis configuration is required');
  }

  // Validate image analysis config
  if (llmConfig.imageAnalysis) {
    if (!llmConfig.imageAnalysis.apiKey) {
      throw new Error('Image analysis API key is required');
    }
    if (!llmConfig.imageAnalysis.model) {
      throw new Error('Image analysis model is required');
    }
  } else {
    throw new Error('Image analysis configuration is required');
  }

  // Validate crawler config
  if (config.crawler.concurrency < 1 || config.crawler.concurrency > 10) {
    throw new Error('Crawler concurrency must be between 1 and 10');
  }

  if (config.crawler.delay < 0) {
    throw new Error('Crawler delay must be non-negative');
  }

  // Validate output config
  if (config.output.format !== 'json') {
    throw new Error('Output format must be json');
  }

  if (!config.output.outputPath) {
    throw new Error('Output path is required');
  }
}

export function loadConfigFromEnv(): Partial<AnalysisConfig> {
  return {
    llm: {
      // HTML分析专用配置
      htmlAnalysis: {
        provider: (process.env.HTML_ANALYSIS_PROVIDER as any) || 'deepseek',
        model: process.env.HTML_ANALYSIS_MODEL || 'deepseek-chat',
        apiKey: process.env.HTML_ANALYSIS_API_KEY || process.env.DEEPSEEK_API_KEY || '',
        baseUrl: process.env.HTML_ANALYSIS_BASE_URL || 'https://api.deepseek.com',
        temperature: process.env.HTML_ANALYSIS_TEMPERATURE ? parseFloat(process.env.HTML_ANALYSIS_TEMPERATURE) : 0.3,
        maxTokens: process.env.HTML_ANALYSIS_MAX_TOKENS ? parseInt(process.env.HTML_ANALYSIS_MAX_TOKENS) : 2000
      },
      // 图像分析专用配置
      imageAnalysis: {
        provider: (process.env.IMAGE_ANALYSIS_PROVIDER as any) || 'openai',
        model: process.env.IMAGE_ANALYSIS_MODEL || 'gpt-4o',
        apiKey: process.env.IMAGE_ANALYSIS_API_KEY || process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.IMAGE_ANALYSIS_BASE_URL || 'https://api.openai.com/v1',
        temperature: process.env.IMAGE_ANALYSIS_TEMPERATURE ? parseFloat(process.env.IMAGE_ANALYSIS_TEMPERATURE) : 0.3,
        maxTokens: process.env.IMAGE_ANALYSIS_MAX_TOKENS ? parseInt(process.env.IMAGE_ANALYSIS_MAX_TOKENS) : 2000
      }
    } as any,
    crawler: {
      concurrency: process.env.CRAWLER_CONCURRENCY ? parseInt(process.env.CRAWLER_CONCURRENCY) : 3,
      delay: process.env.CRAWLER_DELAY ? parseInt(process.env.CRAWLER_DELAY) : 1000,
      retries: process.env.CRAWLER_RETRIES ? parseInt(process.env.CRAWLER_RETRIES) : 3,
      timeout: process.env.CRAWLER_TIMEOUT ? parseInt(process.env.CRAWLER_TIMEOUT) : 30000
    },
    output: {
      format: 'json',
      outputPath: process.env.OUTPUT_PATH || './menu-analysis-results',
      includeScreenshots: process.env.INCLUDE_SCREENSHOTS === 'true',
      includeRawContent: process.env.INCLUDE_RAW_CONTENT === 'true'
    }
  };
}

export function mergeConfigs(base: AnalysisConfig, override: Partial<AnalysisConfig>): AnalysisConfig {
  const baseLLM = base.llm as any;
  const overrideLLM = override.llm as any;
  
  return {
    llm: { 
      // 深度合并分离配置
      htmlAnalysis: {
        ...baseLLM?.htmlAnalysis,
        ...overrideLLM?.htmlAnalysis
      },
      imageAnalysis: {
        ...baseLLM?.imageAnalysis,
        ...overrideLLM?.imageAnalysis
      }
    } as any,
    crawler: { ...base.crawler, ...override.crawler },
    output: { ...base.output, ...override.output }
  };
}