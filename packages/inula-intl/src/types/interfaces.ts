/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import {
  AllLocaleConfig,
  AllMessages,
  Locale,
  Locales,
  Error,
  DatePool,
  SelectPool,
  RawToken,
} from './types';
import I18n from '../core/I18n';
import Lexer from '../parser/Lexer';

// FormattedMessage的参数定义
export interface FormattedMessageProps extends MessageDescriptor {
  values?: object;
  tagName?: string;

  children?(nodes: any[]): any;
}

// 信息描述对象，有id、信息、内容
export interface MessageDescriptor extends MessageOptions {
  id: string;
  defaultMessage?: string;
  defaultValues?: Record<string, unknown>;
}

export interface MessageOptions {
  comment?: string;
  message?: string;
  context?: string;
  formatOptions?: FormatOptions;
  useMemorize?: boolean;
}

// I18n类的缓存定义
export interface I18nCache {
  dateTimeFormat: Record<string, Intl.DateTimeFormat>;
  numberFormat: Record<string, Intl.NumberFormat>;
  plurals: Record<string, Intl.PluralRules>;
  messages: Record<string, IntlMessageFormat>;
  select: Record<string, object>;
  octothorpe: Record<string, any>;
}

// I18n类的传参
export interface I18nProps {
  locale?: Locale;
  locales?: Locales;
  messages?: AllMessages;
  localeConfig?: AllLocaleConfig;
  useMemorize?: boolean;
  error?: Error;
}

// 消息格式化选项类型
export interface FormatOptions {
  dateTimeFormat?: Intl.DateTimeFormatOptions;
  numberFormat?: Intl.NumberFormatOptions;
  plurals?: Intl.PluralRulesOptions;
}

export interface InjectOptions {
  isUsingForwardRef?: boolean;
  ensureContext?: boolean;
}

export interface I18nContextProps {
  i18n?: I18n;
}

export interface configProps {
  locale?: Locale;
  messages?: AllMessages;
  defaultLocale?: string;
  RenderOnLocaleChange?: boolean;
  children?: any;
  uesMemorize?: boolean;
}

export interface IntlMessageFormat extends configProps, MessageOptions {
  plural: (
    value: number,
    { offset, ...rules }: { [x: string]: any; offset?: number },
    useMemorize?: boolean
  ) => (ctx: any) => any[];
  selectordinal: (
    value: number,
    { offset, ...rules }: { [x: string]: any; offset?: number },
    useMemorize?: boolean
  ) => (ctx: any) => any[];
  select: (value: SelectPool, formatRules: any, useMemorize?: boolean) => any;
  numberFormat: (value: number, formatOption: any, useMemorize: boolean) => string;
  dateTimeFormat: (value: DatePool, formatOption: any, useMemorize: boolean) => string;
  undefined: (value: any) => any;
}

//错误信息的事件
export interface MissingMessageEvent {
  locale: Locale;
  id: string;
  context?: string;
}

export interface LexerInterface<T> {
  reset: (data?: string, info?: Record<string, any>) => Lexer<T>;
  next: () => RawToken | undefined;

  [Symbol.iterator](): Iterator<T>;
}

export interface TokenContext {
  // token 索引值的偏移量
  offset: number;

  // token 开始计算的初始行号
  line: number;

  // token 开始计算的初始列号
  col: number;

  // 原始输入
  text: string;

  // 换行数
  lineNum: number;
}

export interface Content {
  type: 'content';
  value: string;
  ctx: TokenContext;
}

// 需要解析参数定义
export interface PlainArg {
  type: 'argument';
  arg: string;
  ctx: TokenContext;
}

export interface Octothorpe {
  type: 'octothorpe';
  ctx: TokenContext;
}

export interface FunctionArg {
  type: 'function';
  arg: string;
  key: string;
  param?: Array<Content | PlainArg | FunctionArg | Select | Octothorpe>;
  ctx: TokenContext;
}

export interface SelectCase {
  key: string;
  tokens: Array<Content | PlainArg | FunctionArg | Select | Octothorpe>;
  ctx: TokenContext;
}

// 选择模式
export interface Select {
  type: 'plural' | 'select' | 'selectordinal';
  arg: string;
  cases: SelectCase[];
  offset?: number;
  ctx: TokenContext;
}

export interface InjectedIntl {

  // 日期格式化
  formatDate(value: DatePool, options?: Intl.DateTimeFormatOptions): string;

  // 时间格式化
  formatTime(value: DatePool, options?: Intl.DateTimeFormatOptions): string;

  // 数字格式化
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;

  // 信息格式化
  formatMessage(
    messageDescriptor: MessageDescriptor,
    values?: object,
    options?: MessageOptions,
    useMemorize?: boolean
  ): string;
}
