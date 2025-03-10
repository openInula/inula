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
import { App, I18nOptions } from './type/types';
import { dateTimeFormatKeys, numberFormatKeys } from './constants';
import { dealMsgArgs, dealNumberOrTimesArgs } from './utils/utils';
import { I18n } from '../../../index';
import { AllMessages, DatePool, Locale, Messages } from '../../types/types';
import I18nPath from './utils/parseMsgParamUtils';
import { createElement } from 'openinula';
import I18nProvider from '../../core/components/I18nProvider';

class VueI18n extends I18n {
  public locale: Locale;
  public localMessages: Map<string, AllMessages>;
  public dateTimeFormats?: NonNullable<unknown>;
  public datetimeFormats?: NonNullable<unknown>;
  public numberFormats?: NonNullable<unknown>;
  public vueMessages: string | AllMessages;
  public path?: I18nPath;
  public listeners?: any;

  constructor(options: I18nOptions) {
    super(options);
    this.locale = options.locale || 'en';
    this.localMessages = new Map();
    this.vueMessages = options.messages || {};
    this.numberFormats = options.numberFormats || {};
    this.dateTimeFormats = options.dateTimeFormats || {};
    this.datetimeFormats = options.datetimeFormats || {};
    this.path = new I18nPath();
    this.listeners = new Set();
    this.loadMessage(this.vueMessages);
  }

  // 重写 messages getter
  get messages(): string | Messages | AllMessages {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (this.locale in this.vueMessages) {
      return this.vueMessages[this.locale] ?? {};
    } else {
      return this.vueMessages ?? {};
    }
  }

  setLocalMessage = (componentId: string, messages: AllMessages) => {
    this.localMessages.set(componentId, messages);
  };

  // 重写 loadMessage 方法以支持加载局部消息
  loadMessage = (localeOrMessages: Locale | AllMessages | undefined, messages?: Messages, componentId?: string) => {
    if (componentId) {
      if (typeof localeOrMessages === 'string' && messages) {
        this.setLocalMessage(componentId, { [localeOrMessages]: messages });
      } else if (typeof localeOrMessages === 'object') {
        this.setLocalMessage(componentId, localeOrMessages);
      }
    } else {
      super.loadMessage(localeOrMessages, messages);
    }
    this.emit('change');
  };

  changeLanguage = (locale: Locale) => {
    super.changeLanguage(locale);
  };

  changeMessage = (messages: AllMessages) => {
    super.changeMessage(messages);
  };

  $t = (msgKey: string, values?: any, componentId?: string) => {
    const messages = componentId ? this.getComponentMessages(componentId) : this.messages;

    const pathRet = this.path!.getPathValue(messages, msgKey);
    const msgId = pathRet !== null ? dealMsgArgs(pathRet, messages, msgKey) : msgKey;
    return super.formatMessage(msgId, values);
  };

  /**
   * 用于处理局部组件内的messages
   * @param componentId
   * @private
   */
  private getComponentMessages(componentId: string): string | Messages {
    const componentMessages = this.localMessages.get(componentId);
    return (componentMessages && componentMessages[this.locale]) || {};
  }

  $n = (value: number, ...args: any) => {
    const { dealLocale, key, options } = dealNumberOrTimesArgs(args, numberFormatKeys);
    // 如果自己传入新的语言，则更新
    super.changeLanguage(dealLocale ? dealLocale : 'en');

    if (key) {
      const formatOptions = this.numberFormats![dealLocale][key]!;
      return super.formatNumber(value, formatOptions);
    }

    return super.formatNumber(value, options);
  };

  $d = (value: DatePool, ...args: any) => {
    const { dealLocale, key, options } = dealNumberOrTimesArgs(args, dateTimeFormatKeys);
    super.changeLanguage(dealLocale ? dealLocale : 'en');

    if (key) {
      const formatOptions = this.dateTimeFormats![dealLocale][key];
      return super.formatDate(value, formatOptions);
    }
    return super.formatDate(value, options);
  };

  // 用于注册到全局国际化插件
  install = (app: App) => {
    // 将 vueIi18n 实例提供给I18nProvider
    app.rootComponent = createElement(I18nProvider, { i18n: this }, app.rootComponent);
  };
}

export function createVueI18nInstance(i18nProps: I18nOptions = {}): VueI18n {
  return new VueI18n(i18nProps);
}
export default VueI18n;
