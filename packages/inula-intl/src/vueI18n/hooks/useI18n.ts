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

import { UseI18nOptions } from '../type/types';
import VueI18n from '../VueI18n';
import { useContext, useEffect } from '@cloudsop/horizon';
import { I18nContext } from '../../intl/core/components/InjectI18n';

export const useI18n = (options?: UseI18nOptions): any => {
  const contextI18n = useContext<VueI18n | null>(I18nContext);

  if (contextI18n && !options) {
    return i18nInstance(contextI18n);
  }

  if (!options) {
    throw new Error('I18nProvider is not used and options are not provided');
  }

  if (options.messages) {
    Object.entries(options.messages).forEach(([locale, messages]) => {
      contextI18n?.i18nInstance?.loadMessage({
        [locale]: {
          ...contextI18n.messages[locale],
          ...messages,
        },
      });
    });
  }

  useEffect(() => {
    if (options?.locale) {
      contextI18n?.changeLanguage(options.locale);
    }
    if (options?.messages) {
      contextI18n?.loadMessage(options.messages);
    }
  }, [options?.locale, options?.messages]);

  return i18nInstance(contextI18n);
};

function i18nInstance(i18nContext: any): any {
  const i18nInstance = i18nContext.i18nInstance ? i18nContext.i18nInstance : i18nContext;
  return {
    ...i18nInstance,
    on: i18nInstance.on.bind(i18nInstance),
    n: i18nInstance.$n.bind(i18nInstance),
    d: i18nInstance.$d.bind(i18nInstance),
    t: i18nInstance.$t.bind(i18nInstance),
  };
}
