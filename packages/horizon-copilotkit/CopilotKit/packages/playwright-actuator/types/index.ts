// 基础类型定义

export interface PlaywrightExecutionEngineOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number;
}

export interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: Error;
}

export interface ScriptExecutionResult {
  success: boolean;
  duration: number;
  results: TestResult[];
}

export interface LocatorOptions {
  hasText?: string;
  hasNotText?: string;
  timeout?: number;
}

export interface ElementWaitOptions {
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
  timeout?: number;
}

export interface ClickOptions {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  position?: { x: number; y: number };
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
  force?: boolean;
  noWaitAfter?: boolean;
  timeout?: number;
}

export interface FillOptions {
  force?: boolean;
  noWaitAfter?: boolean;
  timeout?: number;
}

export interface TypeOptions {
  delay?: number;
  noWaitAfter?: boolean;
  timeout?: number;
}

export interface SelectOptionValues {
  value?: string;
  label?: string;
  index?: number;
}

export interface ExpectMatcherOptions {
  timeout?: number;
  useInnerText?: boolean;
}

export interface PageGotoOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
  referer?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

// DOM 相关类型
export interface DOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// 事件模拟相关类型
export interface KeyboardOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export interface MouseEventOptions {
  button?: number;
  buttons?: number;
  clientX?: number;
  clientY?: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

// 日志相关类型
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
}

// 适配器相关接口
export interface EventSimulator {
  simulateClick(element: Element, options?: ClickOptions): void;
  simulateDoubleClick(element: Element): void;
  simulateHover(element: Element): void;
  simulateKeyPress(element: Element, key: string, options?: TypeOptions): void;
  simulateTyping(element: HTMLInputElement | HTMLTextAreaElement, text: string, options?: TypeOptions): Promise<void>;
}

export interface WaitManager {
  waitForTimeout(ms: number): Promise<void>;
  waitForElement(selector: string, timeout?: number): Promise<Element>;
  waitForCondition(condition: () => boolean | Promise<boolean>, timeout: number, errorMessage: string): Promise<void>;
  waitForURL(urlOrPredicate: string | RegExp | ((url: URL) => boolean), timeout?: number): Promise<void>;
  waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle', options?: { timeout?: number }): Promise<void>;
}

// Page Context 接口
export interface PageContext {
  frameDocument?: Document;
  waitForSelector(selector: string, options?: ElementWaitOptions): Promise<Element | null>;
  scrollIntoViewIfNeeded(element: Element): Promise<void>;
  waitForTimeout(ms: number): Promise<void>;
  logger: Logger;
  eventSimulator: EventSimulator;
}

// 基础的 Locator 接口
export interface BaseLocator {
  click(options?: ClickOptions): Promise<void>;
  fill(value: string, options?: FillOptions): Promise<void>;
  press(key: string, options?: TypeOptions): Promise<void>;
  hover(options?: { timeout?: number }): Promise<void>;
  textContent(): Promise<string>;
  getAttribute(name: string): Promise<string | null>;
  isVisible(): Promise<boolean>;
  locator(selector: string, options?: LocatorOptions): BaseLocator;
  getByRole(role: string, options?: { name?: string; exact?: boolean }): BaseLocator;
  getByText(text: string, options?: { exact?: boolean }): BaseLocator;
  getByLabel(text: string, options?: { exact?: boolean }): BaseLocator;
  getByPlaceholder(text: string, options?: { exact?: boolean }): BaseLocator;
  getByTestId(testId: string): BaseLocator;
  getByTitle(text: string, options?: { exact?: boolean }): BaseLocator;
  filter(options: { hasText?: string | RegExp; hasAccessibleName?: string | RegExp; exact?: boolean }): BaseLocator;
  contentFrame(): Promise<FrameAdapter | null>;
}

// Frame 相关接口
export interface FrameAdapter extends PageContext {
  url(): string;
  title(): Promise<string>;
  content(): Promise<string>;
  isDetached(): boolean;
  frameElement: HTMLIFrameElement;
  frameDocument: Document;
  
  // Element interaction methods
  click(selector: string, options?: ClickOptions): Promise<void>;
  dblclick(selector: string, options?: ClickOptions): Promise<void>;
  fill(selector: string, value: string, options?: FillOptions): Promise<void>;
  type(selector: string, text: string, options?: TypeOptions): Promise<void>;
  press(selector: string, key: string, options?: TypeOptions): Promise<void>;
  hover(selector: string): Promise<void>;
  check(selector: string): Promise<void>;
  uncheck(selector: string): Promise<void>;
  selectOption(selector: string, values: string | string[]): Promise<void>;
  focus(selector: string): Promise<void>;
  
  // Information methods
  textContent(selector: string): Promise<string>;
  innerHTML(selector: string): Promise<string>;
  getAttribute(selector: string, name: string): Promise<string | null>;
  isVisible(selector: string): Promise<boolean>;
  
  // Locator methods
  locator(selector: string, options?: LocatorOptions): BaseLocator;
  getByRole(role: string, options?: { name?: string; exact?: boolean }): BaseLocator;
  getByText(text: string, options?: { exact?: boolean }): BaseLocator;
  getByLabel(text: string, options?: { exact?: boolean }): BaseLocator;
  getByPlaceholder(text: string, options?: { exact?: boolean }): BaseLocator;
  getByTestId(testId: string): BaseLocator;
  getByTitle(text: string, options?: { exact?: boolean }): BaseLocator;
}

// FrameLocator 父页面接口
export interface FrameLocatorParent extends PageContext {
  createFrameAdapter?(frameElement: HTMLIFrameElement): FrameAdapter | null;
}

// 期望断言相关类型
export type ExpectTarget = string | number | boolean | RegExp | Element | BaseLocator;