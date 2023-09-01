/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import utils from '../../utils/utils';
import { Locale } from '../../types/types';

/**
 * 规则选择器
 * eg : 输入选择语句 female {She} other {They}} ，表示'female'和'other'是两种可能的值，它们分别对应着'She'和'They'两个输出结果。
 * 如果调用select（{ value: 'female' }）则表示，输出 she
 */
class SelectFormatter {
  private readonly locale: Locale;
  private selectCache = {};

  constructor(locale) {
    this.locale = locale;
  }

  getRule(value, rules, useMemorize?) {
    if (useMemorize) {
      // 创建key，用于唯一标识
      const cacheKey = utils.generateKey<Intl.NumberFormatOptions>(this.locale, rules);

      // 如果key存在，则使用缓存中的替代
      if (this.selectCache[cacheKey]) {
        return this.selectCache[cacheKey][value] || this.selectCache[cacheKey].other;
      }

      // 如果不存在，则进行缓存
      this.selectCache[cacheKey] = rules;
    }

    return rules[value] || rules.other;
  }
}

export default SelectFormatter;
