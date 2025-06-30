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

import DateTimeFormatter from './format/fomatters/DateTimeFormatter';
import NumberFormatter from './format/fomatters/NumberFormatter';
import I18n from './core/I18n';
import createI18nCache from './format/cache/cache';
import FormattedMessage from './core/components/FormattedMessage';
import I18nProvider from './core/components/I18nProvider';
import injectIntl, { I18nContext, InjectProvider } from './core/components/InjectI18n';
import useIntl from './core/hook/useIntl';
import createIntl from './core/createIntl';
import { MessageDescriptor } from './types/interfaces';
import VueI18n, { createI18n, useI18n, useLocalMessage } from '../vueI18n';

// 函数API
export {
  I18n,
  createI18nCache as createIntlCache,
  createIntl,
  DateTimeFormatter,
  NumberFormatter,
  useIntl,
  I18nProvider,
  createI18n,
  useI18n,
  useLocalMessage,
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
  createIntl,
  DateTimeFormatter,
  NumberFormatter,
  useIntl,
  FormattedMessage,
  I18nContext,
  IntlProvider: I18nProvider,
  injectIntl: injectIntl,
  RawIntlProvider: InjectProvider,
  VueI18n,
};

// 用于定义文本
export function defineMessages<K extends keyof any, T = MessageDescriptor, U = Record<K, T>>(msgs: U): U {
  return msgs;
}

export function defineMessage<T>(msg: T): T {
  return msg;
}
