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

import utils from '../../utils/utils';
import NumberFormatter from './NumberFormatter';
import { Locale, Locales } from '../../types/types';

/**
 * 复数格式化
 */
class PluralFormatter {
  private readonly locale: Locale;
  private readonly locales: Locales;
  private readonly value: number;
  private readonly message: any;
  private readonly useMemorize: boolean;
  private octothorpe: Record<string, any> = {};

  constructor(locale, locales, value, message, useMemorize?) {
    this.locale = locale;
    this.locales = locales;
    this.value = value;
    this.message = message;
    this.useMemorize = useMemorize ?? true;
  }

  // 将 message中的“#”替换为指定数字value，并返回新的字符串或者字符串数组
  replaceSymbol(ctx: any) {
    const msg = typeof this.message === 'function' ? this.message(ctx) : this.message;
    const messages = Array.isArray(msg) ? msg : [msg];

    const numberFormatter = new NumberFormatter(this.locales);
    const valueStr = numberFormatter.numberFormat(this.value);

    if (this.useMemorize) {
      // 创建key，用于唯一标识
      const cacheKey = utils.generateKey<Intl.NumberFormatOptions>(this.locale, this.message);

      // 如果key存在，则使用缓存中的替代
      if (this.octothorpe[cacheKey]) {
        return messages.map(msg => (typeof msg === 'string' ? msg.replace('#', this.octothorpe[cacheKey]) : msg));
      }

      // 如果不存在，则进行缓存
      this.octothorpe[cacheKey] = valueStr;
    }

    return messages.map(msg => (typeof msg === 'string' ? msg.replace('#', valueStr) : msg));
  }
}

export default PluralFormatter;
