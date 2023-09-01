/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import {I18nCache, I18nProviderProps} from '../types/interfaces';
import I18n, {createI18nInstance} from './I18n';

/**
 * createI18n hook函数，用于创建国际化i8n实例，以进行相关的数据操作
 */

export const createI18n = (config: I18nProviderProps, cache?: I18nCache): I18n => {
  const { locale, defaultLocale, messages } = config;
  return createI18nInstance({
    locale: locale || defaultLocale || 'en',
    messages: messages,
    useMemorize: !!cache,
  });
};

export default createI18n;
