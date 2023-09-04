/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import I18n from '../../src/core/I18n';

describe('I18n', () => {
  it('load catalog and merge with existing', () => {
    const i18n = new I18n({});
    const messages = {
      Hello: 'Hello',
    };

    i18n.loadMessage('en', messages);
    i18n.changeLanguage('en');
    expect(i18n.messages).toEqual(messages);
    i18n.loadMessage('fr', { Hello: 'Salut' });
    expect(i18n.messages).toEqual(messages);
  });

  it('should load multiple language ', function () {
    const enMessages = {
      Hello: 'Hello',
    };
    const frMessage = {
      Hello: 'Salut',
    };
    const intl = new I18n({});
    intl.loadMessage({
      en: enMessages,
      fr: frMessage,
    });
    intl.changeLanguage('en');
    expect(intl.messages).toEqual(enMessages);

    intl.changeLanguage('fr');
    expect(intl.messages).toEqual(frMessage);
  });

  it('should switch active locale', () => {
    const messages = {
      Hello: 'Salut',
    };

    const i18n = new I18n({
      locale: 'en',
      messages: {
        fr: messages,
        en: {},
      },
    });

    expect(i18n.locale).toEqual('en');
    expect(i18n.messages).toEqual({});

    i18n.changeLanguage('fr');
    expect(i18n.locale).toEqual('fr');
    expect(i18n.messages).toEqual(messages);
  });

  it('should switch active locale', () => {
    const messages = {
      Hello: 'Salut',
    };

    const i18n = new I18n({
      locale: 'en',
      messages: {
        en: messages,
        fr:{}
      },
    });

    i18n.changeLanguage('en');
    expect(i18n.locale).toEqual('en');
    expect(i18n.messages).toEqual(messages);
    i18n.changeLanguage('fr');
    expect(i18n.locale).toEqual('fr');
    expect(i18n.messages).toEqual({});
  });
  it('._ allow escaping syntax characters', () => {
    const messages = {
      "My ''name'' is '{name}'": "Mi ''nombre'' es '{name}'",
    };
    const i18n = new I18n({
      locale: 'es',
      messages: { es: messages },
    });
    expect(i18n.formatMessage("My ''name'' is '{name}'")).toEqual("Mi 'nombre' es {name}");
  });

  it('._ should format message from catalog', function () {
    const messages = {
      Hello: 'Salut',
      id: "Je m'appelle {name}",
    };
    const i18n = new I18n({
      locale: 'fr',
      messages: { fr: messages },
    });
    expect(i18n.locale).toEqual('fr');
    expect(i18n.formatMessage('Hello')).toEqual('Salut');
    expect(i18n.formatMessage('id', { name: 'Fred' })).toEqual("Je m'appelle Fred");
  });

  it('should return the formatted date and time', () => {
    const i18n = new I18n({
      locale: 'fr',
    });
    const formattedDateTime = i18n.formatDate('2023-06-06T07:53:54.465Z', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
    expect(typeof formattedDateTime).toBe('string');
    expect(formattedDateTime).toEqual('mardi 6 juin 2023 à 15:53');
  });

  it('should return the formatted number', () => {
    const i18n = new I18n({
      locale: 'en',
    });
    const formattedNumber = i18n.formatNumber(123456.789, { style: 'currency', currency: 'USD' });
    expect(typeof formattedNumber).toBe('string');
    expect(formattedNumber).toEqual('$123,456.79');
  });
});
