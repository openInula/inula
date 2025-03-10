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
import { Locale, SelectPool } from '../../types/types';
import { I18nCache } from '../../types/interfaces';

/**
 * 规则选择器
 * eg : 输入选择语句 female {She} other {They}} ，表示'female'和'other'是两种可能的值，它们分别对应着'She'和'They'两个输出结果。
 * 如果调用select（{ value: 'female' }）则表示，输出 she
 */
class SelectFormatter {
  private readonly locale: Locale;

  constructor(locale: Locale) {
    this.locale = locale;
  }

  getRule(value: SelectPool, rules: any) {
    return rules[value] || rules.other;
  }
}

export default SelectFormatter;
