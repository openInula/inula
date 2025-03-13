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

import VueI18n from '../../src/vueI18n-adapter/src/VueI18n';

describe('VueI18n', () => {
  it('load VueI18n', () => {
    const messages = {
      zh: {
        hello: '你好!',
      },
      en: {
        hello: 'hello!',
      },
    };

    const vueI18n = new VueI18n({
      locale: 'zh',
      messages: messages,
    });

    expect(vueI18n.messages).toEqual(messages.zh);
    expect(vueI18n.locale).toEqual('zh');
  });

  it('Test cases for local messages should be preferred', () => {
    const vueI18n = new VueI18n({
      locale: 'zh',
      messages: {
        en: { hello: 'Hello', world: 'World' },
        zh: { hello: '你好', world: '世界' },
        es: { hello: '¡Hola!', world: 'mundo' },
      },
    });
    vueI18n.setLocalMessage('MyComponent', {
      en: { hello: 'Hi there!', component: 'MyComponent' },
      zh: { hello: '嗨！', component: '我的组件' },
    });

    expect(vueI18n.$t('hello', {}, 'MyComponent')).toEqual('嗨！'); // 输出: "Hi there!" (使用局部消息)
    expect(vueI18n.$t('world')).toEqual('世界'); // 输出: "World" (使用全局消息)

    vueI18n.changeLanguage('en');
    expect(vueI18n.$t('hello', {}, 'MyComponent')).toEqual('Hi there!'); // 输出: "Hi there!" (使用局部消息)
    expect(vueI18n.$t('world')).toEqual('World'); // 输出: "World" (使用全局消息)

    vueI18n.loadMessage('es', { hello: '¡Hola!' }, 'MyComponent');
    vueI18n.changeLanguage('es');
    expect(vueI18n.$t('hello', {}, 'MyComponent')).toEqual('¡Hola!'); // 输出: "Hi there!" (使用局部消息)
    expect(vueI18n.$t('world')).toEqual('mundo'); // 输出: "mundo" (使用全局消息)
  });

  it('When the key is an object, $t is used for internationalization.', () => {
    const messages = {
      zh: {
        hello: '你好!',
      },
      en: {
        hello: 'hello!',
      },
    };

    const vueI18n = new VueI18n({
      locale: 'zh',
      messages: messages,
    });
    expect(vueI18n.$t('hello')).toEqual('你好!');
  });

  it('Use $t for internationalization.', () => {
    const messages = {
      en: {
        // 'en' Locale
        key1: 'this is message1', // 基本的
        nested: {
          // 嵌套
          message1: 'this is nested message1',
        },
        errors: [
          // 数组
          'this is 0 error code message',
          {
            // 数组嵌套对象
            internal1: 'this is internal 1 error message',
          },
          [
            // 数组嵌套数组
            'this is nested array error 1',
          ],
        ],
      },
    };

    const vueI18n = new VueI18n({
      locale: 'en',
      messages: messages,
    });
    expect(vueI18n.$t('errors[0]')).toEqual('this is 0 error code message');
  });

  it('Use $n for internationalization.', () => {
    const numberFormats = {
      en: {
        currency: {
          style: 'currency',
          currency: 'USD',
        },
      },
      ja: {
        currency: {
          style: 'currency',
          currency: 'JPY',
          currencyDisplay: 'symbol',
        },
      },
    };

    const vueI18n = new VueI18n({
      numberFormats: numberFormats,
    });
    vueI18n.changeLanguage('en');
    vueI18n.changeMessage({});
    expect(vueI18n.$n(100, numberFormats['en'].currency)).toEqual('$100.00');
    expect(vueI18n.$n(100, 'currency', 'ja-JP')).toEqual('￥100');
    expect(vueI18n.$n(100, 'currency')).toEqual('$100.00');
    expect(vueI18n.$n(10100, { style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' })).toEqual('€10,100.00');
    expect(vueI18n.$n(10100, { style: 'currency', currency: 'JPY' })).toEqual('¥10,100');
  });
  it('Use $d for internationalization.', () => {
    const dateTimeFormats = {
      en: {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: 'Asia/Shanghai',
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'Asia/Shanghai',
        },
      },
      ja: {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: 'Asia/Shanghai',
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: 'Asia/Shanghai',
        },
      },
    };

    const vueI18n = new VueI18n({
      dateTimeFormats: dateTimeFormats,
    });
    const dt = new Date(Date.UTC(2024, 11, 20, 3, 0, 0));
    expect(vueI18n.$d(dt)).toEqual('12/20/2024');
    expect(vueI18n.$d(dt, 'long', 'ja-JP')).toEqual('2024年12月20日金曜日 午前11:00');
    expect(vueI18n.$d(dt, 'short')).toEqual('Dec 20, 2024');
    expect(vueI18n.$d(dt, { key: 'short', locale: 'ja-JP' })).toEqual('2024年12月20日');
    expect(vueI18n.$d(dt, 'long', 'ja')).toEqual('2024年12月20日金曜日 午前11:00');
  });
});
