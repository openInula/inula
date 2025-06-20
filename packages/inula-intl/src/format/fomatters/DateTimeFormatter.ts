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

import creatI18nCache from '../cache/cache';
import utils from '../../utils/utils';
import { DatePool, Locales } from '../../types/types';
import { I18nCache } from '../../types/interfaces';

/**
 * 时间格式化
 */
class DateTimeFormatter {
  private readonly locales: Locales;
  private readonly formatOptions: Intl.DateTimeFormatOptions;
  // 创建一个缓存对象，用于存储DateTimeFormat的对象
  private readonly cache?: I18nCache;
  private readonly valueKey?: string;

  constructor(locales: Locales, formatOptions?: Intl.DateTimeFormatOptions, cache?: I18nCache, valueKey?: string) {
    this.locales = locales;
    this.formatOptions = formatOptions ?? {};
    this.cache = cache ?? creatI18nCache();
    this.valueKey = valueKey ?? '';
  }

  dateTimeFormat(value: DatePool, formatOptions?: Intl.DateTimeFormatOptions): string {
    const options = formatOptions ?? this.formatOptions;
    const formatter = new Intl.DateTimeFormat(this.locales, options);
    // 将传输的字符串转变为日期对象
    if (typeof value === 'string') {
      value = new Date(value);
    }

    // 如果启用了记忆化且已经有对应的数字格式化器缓存，则直接返回缓存中的格式化结果。否则创建新的格式化数据，并进行缓存
    if (this.cache?.dateTimeFormat) {
      // 造缓存的key，key包含区域设置和日期时间格式选项
      const cacheKey = utils.generateKey<Intl.DateTimeFormatOptions>(this.locales, options, this.valueKey);

      if (this.cache.dateTimeFormat[cacheKey]) {
        return this.cache.dateTimeFormat[cacheKey].format(value);
      }

      // 查询缓存中的key， 若无key则创建新key
      this.cache.dateTimeFormat[cacheKey] = formatter;
      return formatter.format(value);
    }

    // 返回格式化后的时间

    return formatter.format(value);
  }
}

export default DateTimeFormatter;
