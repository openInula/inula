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

import DateTimeFormatter from './src/format/fomatters/DateTimeFormatter';
import NumberFormatter from './src/format/fomatters/NumberFormatter';
import I18n from './src/core/I18n';
import createI18nCache from './src/format/cache/cache';
import FormattedMessage from './src/core/components/FormattedMessage';
import I18nProvider from './src/core/components/I18nProvider';
import injectIntl, { I18nContext, InjectProvider } from './src/core/components/InjectI18n';
import useI18n from './src/core/hook/useI18n';
import createI18n from './src/core/createI18n';
import { MessageDescriptor } from './src/types/interfaces';
// 函数API
export {
  I18n,
  createI18nCache as createIntlCache,
  createI18n as createIntl,
  DateTimeFormatter,
  NumberFormatter,
  useI18n as useIntl,
};

// 组件
export {
  FormattedMessage,
  I18nContext as IntlContext,
  I18nProvider as IntlProvider,
  injectIntl as injectIntl,
  InjectProvider as RawIntlProvider,
};

export default {
  I18n,
  createIntlCache: createI18nCache,
  createIntl: createI18n,
  DateTimeFormatter,
  NumberFormatter,
  useIntl: useI18n,
  FormattedMessage,
  I18nContext,
  IntlProvider: I18nProvider,
  injectIntl: injectIntl,
  RawIntlProvider: InjectProvider,
};

// 用于定义文本
export function defineMessages<K extends keyof any, T = MessageDescriptor, U = Record<K, T>>(msgs: U): U {
  return msgs;
}

export function defineMessage<T>(msg: T): T {
  return msg;
}
