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

import I18nProvider from '../../intl/core/components/I18nProvider';
import { I18nOptions, App } from '../type/types';
import { createVueI18nInstance } from '../VueI18n';
import { createElement } from '@cloudsop/horizon';

export function createI18n(options: I18nOptions): any {
  const { locale, messages } = options;
  const i18nInstance = createVueI18nInstance({
    locale: locale || 'en',
    messages: messages,
  });
  return {
    global: {
      ...i18nInstance,

      // 这里需要手动把on属性带上，因为on来自i18nInstance的原型链上，...展开会丢失
      on: i18nInstance.on.bind(i18nInstance),
      t: i18nInstance.$t.bind(i18nInstance),
      messages: i18nInstance.allMessages,
    },

    // 用于注册到全局国际化插件
    install: (app: App) => {
      // 将 vueIi18n 实例提供给I18nProvider
      app.rootComponent = createElement(I18nProvider, { i18n: i18nInstance }, app.rootComponent);
    },
  };
}
