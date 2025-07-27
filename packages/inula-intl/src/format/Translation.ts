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

import { CompiledMessage, Locale, LocaleConfig, Locales } from '../types/types';
import generateFormatters from './generateFormatters';
import { FormatOptions, I18nCache } from '../types/interfaces';
import creatI18nCache from './cache/cache';

/**
 * 获取翻译结果
 */
class Translation {
  private readonly compiledMessage: CompiledMessage;
  private readonly locale: Locale;
  private readonly locales: Locales;
  private readonly localeConfig: Record<string, any>;
  private readonly cache: I18nCache;

  constructor(
    compiledMessage: CompiledMessage,
    locale: Locale,
    locales: Locales,
    localeConfig: LocaleConfig,
    cache?: I18nCache
  ) {
    this.compiledMessage = compiledMessage;
    this.locale = locale;
    this.locales = locales;
    this.localeConfig = localeConfig;
    this.cache = cache ?? creatI18nCache();
  }

  /**
   * @param values 需要替换文本占位符的值
   * @param formatOptions 需要格式化选项
   */
  translate(values: Record<string, unknown>, formatOptions: FormatOptions = {}): string {
    const createTextFormatter = (
      locale: Locale,
      locales: Locales,
      values: Record<string, unknown>,
      formatOptions: FormatOptions,
      localeConfig: LocaleConfig
    ) => {
      const textFormatter = (valueKey: string, type: string, format: any) => {
        const formatters = generateFormatters(locale, locales, localeConfig, formatOptions, this.cache, valueKey);
        const value = values[valueKey];
        const formatter = formatters[type](value, format);

        let message: any;
        if (typeof formatter === 'function') {
          message = formatter(textFormatter); // 递归调用
        } else {
          message = formatter; // 获得变量值 formatted: "Fred"
        }

        return Array.isArray(message) ? message.join('') : message;
      };

      return textFormatter;
    };

    const textFormatter = createTextFormatter(this.locale, this.locales, values, formatOptions, this.localeConfig);
    // 通过递归方法formatCore进行格式化处理
    return this.formatMessage(this.compiledMessage, textFormatter); // 返回要格式化的结果
  }

  formatMessage(compiledMessage: CompiledMessage, textFormatter: (...args: any[]) => any) {
    if (!Array.isArray(compiledMessage)) {
      return compiledMessage;
    }

    return compiledMessage
      .map(token => {
        if (typeof token === 'string') {
          return token;
        }

        const [name, type, format] = token;

        let replaceValueFormat = format;

        // 如果 format 是对象，函数将递归地对它的每个值调用 formatMessage 后保存，否则直接保存
        if (format && typeof format !== 'string') {
          replaceValueFormat = Object.keys(replaceValueFormat).reduce((text, key) => {
            text[key] = this.formatMessage(format[key], textFormatter);
            return text;
          }, {});
        }
        //调用 getContent 函数来获取给定 name、type 和 interpolateFormat 的值
        const value = textFormatter(name, type, replaceValueFormat);
        return value ?? `{${name}}`;
      })
      .join('');
  }
}

export default Translation;
