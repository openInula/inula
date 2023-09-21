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

import utils from '../utils/utils';
import Translation from './Translation';
import I18n from '../core/I18n';
import { MessageDescriptor, MessageOptions } from '../types/interfaces';
import { CompiledMessage } from '../types/types';
import creatI18nCache from "./cache/cache";

export function getFormatMessage(
  i18n: I18n,
  id: MessageDescriptor | string,
  values: Object | undefined = {},
  options: MessageOptions = {}
) {
  let { message, context, formatOptions } = options;
  const cache = i18n.cache ?? creatI18nCache();
  if (typeof id !== 'string') {
    values = values || id.defaultValues;
    message = id.message || id.defaultMessage;
    context = id.context;
    id = id.id;
  }

  // 对messages进行判空处理
  const isMissingMessage = !context && !i18n.messages[id];
  const isMissingContextMessage = context && !i18n.messages[context][id];
  const messageUnavailable = isMissingContextMessage || isMissingMessage;

  // 对错误消息进行处理
  const messageError = i18n.error;
  if (messageError && messageUnavailable) {
    if (typeof messageError === 'function') {
      return messageError(i18n.locale, id, context);
    } else {
      return messageError;
    }
  }

  let compliedMessage: CompiledMessage;
  if (context) {
    compliedMessage = i18n.messages[context][id] || message || id;
  } else {
    compliedMessage = i18n.messages[id] || message || id;
  }

  // 对解析的messages进行parse解析，并输出解析后的Token
  compliedMessage = typeof compliedMessage === 'string' ? utils.compile(compliedMessage) : compliedMessage;

  const translation = new Translation(compliedMessage, i18n.locale, i18n.locales, i18n.localeConfig, cache);
  return translation.translate(values, formatOptions);
}
