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

import EventDispatcher from '../utils/eventListener';
import DateTimeFormatter from "../format/fomatters/DateTimeFormatter";
import NumberFormatter from "../format/fomatters/NumberFormatter";
import { getFormatMessage } from '../format/getFormatMessage';
import {I18nCache, I18nProps, MessageDescriptor, MessageOptions} from '../types/interfaces';
import { Locale, Locales, Messages, AllLocaleConfig, AllMessages, LocaleConfig, Error, Events } from '../types/types';
import creatI18nCache from "../format/cache/cache";

export class I18n extends EventDispatcher<Events> {
  public locale: Locale;
  public locales: Locales;
  private readonly _localeConfig: AllLocaleConfig;
  private readonly allMessages: AllMessages;
  public readonly error?: Error;
  public readonly cache?: I18nCache;

  constructor(props: I18nProps) {
    super();
    this.locale = 'en';
    this.locales = this.locale || '';
    this.allMessages = {};
    this._localeConfig = {};
    this.error = props.error;

    this.loadMessage(props.messages);

    if (props.localeConfig) {
      this.loadLocaleConfig(props.localeConfig);
    }

    if (props.locale || props.locales) {
      this.changeLanguage(props.locale!, props.locales);
    }
    this.formatMessage = this.formatMessage.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.formatNumber = this.formatNumber.bind(this);

    this.cache = props.cache ?? creatI18nCache();
  }

  get messages(): string | Messages | AllMessages {
    if (this.locale in this.allMessages) {
      return this.allMessages[this.locale] ?? {};
    } else {
      return this.allMessages ?? {};
    }
  }

  get localeConfig(): LocaleConfig {
    return this._localeConfig[this.locale] ?? {};
  }

  setLocaleConfig(locale: Locale, localeData: LocaleConfig) {
    if (this._localeConfig[locale]) {
      Object.assign(this._localeConfig, localeData);
    } else {
      this._localeConfig[locale] = localeData;
    }
  }

  // 将热语言环境的本地化数据加载
  loadLocaleConfig(localeOrAllData: Locale | AllLocaleConfig, localeConfig?: LocaleConfig) {
    if (localeConfig) {
      this.setLocaleConfig(localeOrAllData as Locale, localeConfig);
    } else {
      Object.keys(localeOrAllData).forEach(locale => {
        this.setLocaleConfig(locale, localeOrAllData[locale]);
      });
    }
    this.emit('change');
  }

  setMessage(locale: Locale, messages: Messages) {
    if (this.allMessages[locale]) {
      Object.assign(this.allMessages[locale], messages);
    } else {
      this.allMessages[locale] = messages;
    }
  }

  // 加载messages
  loadMessage(localeOrMessages: Locale | AllMessages | undefined, messages?: Messages) {
    if (messages) {
      //当 message 为空的时候，加载单一的message信息
      this.setMessage(localeOrMessages as string, messages);
    } else {
      // 加载多对locale-message信息
      localeOrMessages &&
      Object.keys(localeOrMessages!).forEach(locale => this.setMessage(locale, localeOrMessages![locale]));
    }
    this.emit('change');
  }

  // 改变当前的语言环境
  changeLanguage(locale: Locale, locales?: Locales) {
    this.locale = locale;
    if (locales) {
      this.locales = locales;
    }
    this.emit('change');
  }

  formatMessage(
    id: MessageDescriptor | string,
    values: Object | undefined = {},
    { message, context, formatOptions}: MessageOptions = {},
  ) {
    return getFormatMessage(this, id, values, { message, context, formatOptions});
  }

  formatDate(value: string | Date, formatOptions?: Intl.DateTimeFormatOptions): string {
    const dateTimeFormatter = new DateTimeFormatter(this.locale || this.locales, formatOptions, this.cache);
    return dateTimeFormatter.dateTimeFormat(value);
  }

  formatNumber(value: number, formatOptions?: Intl.NumberFormatOptions): string {
    const numberFormatter = new NumberFormatter(this.locale || this.locales, formatOptions, this.cache);
    return numberFormatter.numberFormat(value);
  }
}

export default I18n;

export function createI18nInstance(i18nProps: I18nProps = {}): I18n {
  return new I18n(i18nProps);
}
