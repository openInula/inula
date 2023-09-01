/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import creatI18nCache from '../cache/cache';
import utils from '../../utils/utils';
import { DatePool, Locales } from '../../types/types';

/**
 * 时间格式化
 */
class DateTimeFormatter {
  private readonly locales: Locales;
  private readonly formatOptions: Intl.DateTimeFormatOptions;

  // 是否进行存储
  private readonly useMemorize: boolean;

  // 创建一个缓存对象，用于存储DateTimeFormat的对象
  private cache = creatI18nCache().dateTimeFormat;

  constructor(locales: Locales, formatOptions?: Intl.DateTimeFormatOptions, useMemorize?: boolean) {
    this.locales = locales;
    this.formatOptions = formatOptions ?? {};
    this.useMemorize = useMemorize ?? true;
  }

  dateTimeFormat(value: DatePool, formatOptions?: Intl.DateTimeFormatOptions): string {
    const options = formatOptions ?? this.formatOptions;
    const formatter = new Intl.DateTimeFormat(this.locales, options);
    // 将传输的字符串转变为日期对象
    if (typeof value === 'string') {
      value = new Date(value);
    }

    // 如果启用了记忆化且已经有对应的数字格式化器缓存，则直接返回缓存中的格式化结果。否则创建新的格式化数据，并进行缓存
    if (this.useMemorize) {
      // 造缓存的key，key包含区域设置和日期时间格式选项
      const cacheKey = utils.generateKey<Intl.DateTimeFormatOptions>(this.locales, options);

      if (this.cache[cacheKey]) {
        return this.cache[cacheKey].format(value);
      }

      // 查询缓存中的key， 若无key则创建新key
      this.cache[cacheKey] = formatter;
      return formatter.format(value);
    }

    // 返回格式化后的时间

    return formatter.format(value);
  }
}

export default DateTimeFormatter;
