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
import { Locales } from '../../types/types';
import utils from '../../utils/utils';
import { I18nCache } from '../../types/interfaces';

/**
 * 数字格式化
 */
class NumberFormatter {
  private readonly locales: Locales;
  private readonly formatOption?: Intl.NumberFormatOptions;
  private cache?: I18nCache; // 创建一个缓存对象，用于缓存已经创建的数字格式化器
  private readonly valueKey?: string;

  constructor(locales: Locales, formatOption?: Intl.NumberFormatOptions, cache?: I18nCache, valueKey?: string) {
    this.locales = locales;
    this.formatOption = formatOption ?? {};
    this.cache = cache ?? creatI18nCache();
    this.valueKey = valueKey ?? '';
  }

  numberFormat(value: number, formatOption?: Intl.NumberFormatOptions): string {
    const options = formatOption ?? this.formatOption;
    const formatter = new Intl.NumberFormat(this.locales, options);

    // 如果启用了记忆化且已经有对应的数字格式化器缓存，则直接返回缓存中的格式化结果。否则创建新的格式化数据，并进行缓存
    if (this.cache?.numberFormat) {
      // 造缓存的key，key包含区域设置数字格式选项
      const cacheKey = utils.generateKey<Intl.NumberFormatOptions>(this.locales, options, this.valueKey);

      if (this.cache.numberFormat[cacheKey]) {
        return this.cache.numberFormat[cacheKey].format(value);
      }

      this.cache.numberFormat[cacheKey] = formatter;
      return formatter.format(value);
    }
    return formatter.format(value);
  }
}

export default NumberFormatter;
