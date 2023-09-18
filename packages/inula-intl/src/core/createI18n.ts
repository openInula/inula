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
import { configProps, I18nCache } from '../types/interfaces';
import I18n, { createI18nInstance } from './I18n';

/**
 * createI18n hook函数，用于创建国际化i8n实例，以进行相关的数据操作
 */

export const createI18n = (config: configProps, cache?: I18nCache): I18n => {
  const { locale, defaultLocale, messages } = config;
  return createI18nInstance({
    locale: locale || defaultLocale || 'en',
    messages: messages,
    useMemorize: !!cache,
  });
};

export default createI18n;
