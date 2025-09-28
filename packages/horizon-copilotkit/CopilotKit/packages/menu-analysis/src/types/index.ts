import { Page } from 'playwright';

export interface MenuItem {
  id: string;
  text: string;
  url?: string;  // Make URL optional for function-based navigation
  level: number;
  parentId?: string;
  hasSubmenu: boolean;
  elementSelector?: string;
  // New fields for function-based navigation
  emit?: string[];
  preferNewWindow?: boolean;  // Whether the menu should open in a new window
  href?: string;
}

export interface LoginConfig {
  loginUrl: string;
  usernameSelector: string;
  passwordSelector: string;
  submitSelector: string;
  username: string;
  password: string;
  successSelector?: string;
}

export interface PageAnalysis {
  url: string;
  title: string;
  menuPath: string[];
  content: PageContent;
  timestamp: Date;
}

export interface PageContent {
  html: string;
  text: string;
  forms: FormInfo[];
  tables: TableInfo[];
  buttons: ButtonInfo[];
  links: LinkInfo[];
  metadata: PageMetadata;
}

export interface FormInfo {
  id?: string;
  action?: string;
  method?: string;
  fields: FormField[];
  purpose?: string;
}

export interface FormField {
  name?: string;
  type: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface TableInfo {
  id?: string;
  headers: string[];
  rowCount: number;
  hasActions: boolean;
  purpose?: string;
}

export interface ButtonInfo {
  text: string;
  type?: string;
  purpose?: string;
  action?: string;
}

export interface LinkInfo {
  text: string;
  href: string;
  isInternal: boolean;
}

export interface ImageInfo {
  src: string;
  alt?: string;
  purpose?: string;
}

export interface PageMetadata {
  description?: string;
  keywords?: string[];
  breadcrumbs: string[];
  pageType?: string;
  visualElements?: string[];
  aiSuggestions?: string[];
}

export interface WindowContent {
  html: string;
  title: string;
  url: string;
  type: 'html' | 'screenshot';
  dataURL?: string; // screenshot的时候需要有
}

export interface LLMAnalysisRequest {
  menuItem: MenuItem;
  pageContent: PageContent;
  context?: string;
}

export interface MenuFunctionality {
  id: string;
  name: string;
  primaryFunction: string;
  emit?: string | string[];
}

export interface DataManagementInfo {
  dataTypes: string[];
  operations: string[];
  integrations: string[];
}

export interface TechnicalDetails {
  componentTypes: string[];
  frameworks: string[];
  apis: string[];
}

export interface AnalysisConfig {
  llm: LLMConfig;
  crawler: CrawlerConfig;
  output: OutputConfig;
  // Optional callback for function-based menu navigation
  onMenuOpen?: (page: Page, emit: string[]) => Promise<void>;
  // Optional callback for custom content extraction
  onExtractContent?: (page: Page, menuItem: MenuItem) => Promise<WindowContent>;
  onMenuClose?: (page: Page) => Promise<void>;
}

export interface LLMConfig {
  systemPrompt?: string;
  // 分离的配置选项
  htmlAnalysis?: {
    provider?: 'openai' | 'anthropic' | 'deepseek' | 'custom';
    model?: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  };
  imageAnalysis?: {
    provider?: 'openai' | 'anthropic' | 'deepseek' | 'custom';
    model?: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface CrawlerConfig {
  // 爬虫引擎配置
  concurrency: number;
  delay: number;
  retries: number;
  timeout: number;
  userAgent?: string;
  viewport?: { width: number; height: number };
  // 菜单发现配置（从 MenuConfig 合并过来）
  baseUrl?: string;
  loginConfig?: LoginConfig;
  menuSelectors?: string[];
  excludePatterns?: string[];
  maxDepth?: number;
  // 登录后处理回调
  loginPost?: (page: Page) => Promise<void>;
}

export interface OutputConfig {
  format: 'json';
  outputPath: string;
  includeScreenshots?: boolean;
  includeRawContent?: boolean;
}

