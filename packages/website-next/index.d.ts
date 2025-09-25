import { ReactNode } from "react";

// ==================== 通用类型 ====================
export type Theme = "light" | "dark";

// ==================== 导航相关接口 ====================
export interface DropdownItem {
  name: string;
  href: string;
}

export interface DropdownMenuProps {
  name: string;
  href: string;
  dropdown: DropdownItem[];
  isActive: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export interface CustomSearchProps {
  onSearch: (query: string) => void;
}

// ==================== 首页相关接口 ====================
export interface Partner {
  name: string;
  logo: string;
  url: string;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

export interface ActivityProps {
  tabItems?: string[];
}

export interface LoadMoreSectionProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  initialCount?: number;
  step?: number;
}

// ==================== 活动、资讯组件相关接口 ====================
export interface NewsItem {
  key: number;
  img: string;
  title: string;
  introduce: string;
  time: string;
}

export interface ActivityItem {
  key: number;
  img: string;
  name: string;
  introduce: string;
  beginTime: string;
  endTime: string;
  type: string;
}

// ==================== 博客相关接口 ====================
export interface BlogItem {
  key: number;
  img?: string;
  title: string;
  time: string;
  author: string;
  type: string;
  tags?: string[];
}

export interface BlogCardProps {
  blog: BlogItem;
  theme: string | undefined;
}

export interface BlogListProps {
  blogs: BlogItem[];
  theme: string | undefined;
}

export interface BlogFilterBarProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// ==================== 贡献者相关接口 ====================
export interface Contributor {
  name: string;
  avatar: string;
  role: string;
  description: string;
  github?: string;
  email?: string;
}

// ==================== 文档相关接口 ====================
export interface DocumentItem {
  id: string;
  title: string;
  url?: string;
  description: string;
}

export interface DocumentSidebarProps {
  documents: DocumentItem[];
  defaultActiveId?: string;
  title?: string;
  onDocumentChange?: (docId: string) => void;
  className?: string;
  children?: (currentDoc: DocumentItem | undefined) => ReactNode;
}

// ==================== Playground相关接口 ====================
export interface PlaygroundItem {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  slug: string;
  content?: string;
  code?: string;
}

export interface PlaygroundSidebarProps {
  playgroundData: PlaygroundItem[];
  selectedItem: PlaygroundItem | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface PlaygroundContentProps {
  selectedItem: PlaygroundItem | null;
}

// ==================== 项目相关接口 ====================
export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  level: string;
  tags: string[];
}

// ==================== 页面组件接口 ====================
export interface MDXDetailPageProps {
  children: ReactNode;
}

export interface MarkdownPageProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

// ==================== MagicUI组件接口 ====================
export interface AuroraTextProps {
  children: ReactNode;
  className?: string;
}

export interface MeteorsProps {
  number?: number;
}

export interface MagicCardProps {
  children: ReactNode;
  className?: string;
  gradientColor?: string;
}

export interface CodeComparisonProps {
  leftCode: string;
  rightCode: string;
  leftTitle?: string;
  rightTitle?: string;
  language?: string;
}

// ==================== 主题相关接口 ====================
export interface ThemeToggleProps {
  className?: string;
}

export interface ThemeScriptProps {
  theme?: string;
}

// ==================== 性能相关接口 ====================
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export interface PerformanceComparisonProps {
  inulaMetrics: PerformanceMetrics;
  reactMetrics: PerformanceMetrics;
  vueMetrics: PerformanceMetrics;
}

// ==================== API相关接口 ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ==================== 表单相关接口 ====================
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: RegExp;
    message?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  className?: string;
}

// ==================== 路由相关接口 ====================
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  children?: RouteConfig[];
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
  };
}

// ==================== 国际化相关接口 ====================
export interface LocaleConfig {
  code: string;
  name: string;
  flag?: string;
}

export interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

// ==================== 错误处理相关接口 ====================
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

// ==================== 动画相关接口 ====================
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode?: "none" | "forwards" | "backwards" | "both";
  iterationCount?: number | "infinite";
}

export interface AnimatedComponentProps {
  animation: AnimationConfig;
  children: ReactNode;
  className?: string;
  onAnimationEnd?: () => void;
}

// ==================== 存储相关接口 ====================
export interface StorageConfig {
  key: string;
  defaultValue?: any;
  serializer?: {
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
  };
}

export interface UseStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// ==================== 网络请求相关接口 ====================
export interface RequestConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface UseRequestReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (config?: Partial<RequestConfig>) => Promise<void>;
  reset: () => void;
}

// ==================== 工具函数类型 ====================
export type DebounceFunction<T extends (...args: any[]) => any> = (
  func: T,
  delay: number
) => (...args: Parameters<T>) => void;

export type ThrottleFunction<T extends (...args: any[]) => any> = (
  func: T,
  delay: number
) => (...args: Parameters<T>) => void;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];

export type ArrayElement<T> = T extends Array<infer U> ? U : never;

// ==================== 事件相关接口 ====================
export interface EventHandler<T = any> {
  (event: T): void;
}

export interface KeyboardEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface MouseEvent {
  x: number;
  y: number;
  button: number;
  buttons: number;
}

// ==================== 媒体相关接口 ====================
export interface MediaQuery {
  query: string;
  matches: boolean;
}

export interface UseMediaQueryReturn {
  matches: boolean;
  addListener: (callback: (matches: boolean) => void) => void;
  removeListener: (callback: (callback: boolean) => void) => void;
}

// ==================== 时间相关接口 ====================
export interface TimeConfig {
  format: string;
  timezone?: string;
  locale?: string;
}

export interface UseTimerReturn {
  time: Date;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: boolean;
}

// ==================== 验证相关接口 ====================
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UseValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string[]>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  validate: () => ValidationResult;
  reset: () => void;
}
