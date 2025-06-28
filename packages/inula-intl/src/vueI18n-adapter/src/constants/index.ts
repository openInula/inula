/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

// 动作常量
export const APPEND = 0;
export const PUSH = 1;
export const INC_SUB_PATH_DEPTH = 2;
export const PUSH_SUB_PATH = 3;

// 状态常量
export const BEFORE_PATH = 0;
export const IN_PATH = 1;
export const BEFORE_IDENT = 2;
export const IN_IDENT = 3;
export const IN_SUB_PATH = 4;
export const IN_SINGLE_QUOTE = 5;
export const IN_DOUBLE_QUOTE = 6;
export const AFTER_PATH = 7;
export const ERROR = 8;

export const pathStateMachine: any = {
  [BEFORE_PATH]: {
    ws: [BEFORE_PATH],
    ident: [IN_IDENT, APPEND],
    '[': [IN_SUB_PATH],
    eof: [AFTER_PATH],
  },
  [IN_PATH]: {
    ws: [IN_PATH],
    '.': [BEFORE_IDENT],
    '[': [IN_SUB_PATH],
    eof: [AFTER_PATH],
  },
  [BEFORE_IDENT]: {
    ws: [BEFORE_IDENT],
    ident: [IN_IDENT, APPEND],
    '0': [IN_IDENT, APPEND],
    number: [IN_IDENT, APPEND],
  },
  [IN_IDENT]: {
    ident: [IN_IDENT, APPEND],
    '0': [IN_IDENT, APPEND],
    number: [IN_IDENT, APPEND],
    ws: [IN_PATH, PUSH],
    '.': [BEFORE_IDENT, PUSH],
    '[': [IN_SUB_PATH, PUSH],
    eof: [AFTER_PATH, PUSH],
  },
  [IN_SUB_PATH]: {
    "'": [IN_SINGLE_QUOTE, APPEND],
    '"': [IN_DOUBLE_QUOTE, APPEND],
    '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
    ']': [IN_PATH, PUSH_SUB_PATH],
    eof: ERROR,
    else: [IN_SUB_PATH, APPEND],
  },
  [IN_SINGLE_QUOTE]: {
    "'": [IN_SUB_PATH, APPEND],
    eof: ERROR,
    else: [IN_SINGLE_QUOTE, APPEND],
  },
  [IN_DOUBLE_QUOTE]: {
    '"': [IN_SUB_PATH, APPEND],
    eof: ERROR,
    else: [IN_DOUBLE_QUOTE, APPEND],
  },
};

export const numberFormatKeys = [
  'compactDisplay',
  'currency',
  'currencyDisplay',
  'currencySign',
  'localeMatcher',
  'notation',
  'numberingSystem',
  'signDisplay',
  'style',
  'unit',
  'unitDisplay',
  'useGrouping',
  'minimumIntegerDigits',
  'minimumFractionDigits',
  'maximumFractionDigits',
  'minimumSignificantDigits',
  'maximumSignificantDigits',
];

export const dateTimeFormatKeys = [
  'dateStyle',
  'timeStyle',
  'calendar',
  'localeMatcher',
  'hour12',
  'hourCycle',
  'timeZone',
  'formatMatcher',
  'weekday',
  'era',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'timeZoneName',
];
