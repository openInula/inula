/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import utils from '../utils/utils';
import Translation from './Translation';
import I18n from '../core/I18n';
import { MessageDescriptor, MessageOptions } from '../types/interfaces';
import { CompiledMessage } from '../types/types';

export function getFormatMessage(
  i18n: I18n,
  id: MessageDescriptor | string,
  values: Object | undefined = {},
  options: MessageOptions = {}
) {
  let { message, context, formatOptions, useMemorize } = options;
  const memorize = useMemorize ?? i18n.useMemorize;
  if (typeof id !== 'string') {
    values =  values || id.defaultValues;
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

  const translation = new Translation(compliedMessage, i18n.locale, i18n.locales, i18n.localeConfig, memorize);
  return translation.translate(values, formatOptions);
}
