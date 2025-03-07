/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import I18n from '../../src/core/I18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/';

// 测试组件
const IndividualCustomComponent = () => {
  return <span>Custom Component</span>;
};

const CustomComponent = (props: any) => {
  return <div>{props.children}</div>;
};

const CustomComponentChildren = (props: any) => {
  return <div>{props.children}</div>;
};

describe('I18n', () => {
  it('load catalog and merge with existing', () => {
    const i18n = new I18n({});
    const messages = {
      Hello: 'Hello',
    };

    i18n.loadMessage('en', messages);
    i18n.changeLanguage('zh');
    expect(i18n.locale).toEqual('zh');
    i18n.loadMessage('fr', { Hello: 'Salut' });
    expect(i18n.messages).toEqual({
      en: { Hello: 'Hello' },
      fr: { Hello: 'Salut' },
    });
    i18n.changeMessage({ Hello: 'Salut' });
    expect(i18n.messages).toEqual({ Hello: 'Salut' });
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
        fr: {},
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
    expect(i18n.formatMessage("My ''name'' is '{name}'")).toEqual("Mi ''nombre'' es '{name}'");
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

  it('should return information with html element', () => {
    const messages = {
      id: 'hello, {name}',
    };
    const i18n = new I18n({
      locale: 'es',
      messages: { es: messages },
    });
    const value = '<strong>Jane</strong>';
    expect(i18n.formatMessage({ id: 'id' }, { name: value })).toEqual('hello, <strong>Jane</strong>');
  });

  it('test demo from product', () => {
    const messages = {
      id: "服务商名称长度不能超过64个字符，允许输入中文、字母、数字、字符_-!@#$^.+'}{'，且不能为关键字null(不区分大小写)。",
    };
    const i18n = new I18n({
      locale: 'zh',
      messages: { zh: messages },
    });
    expect(i18n.formatMessage('id')).toEqual(
      "服务商名称长度不能超过64个字符，允许输入中文、字母、数字、字符_-!@#$^.+'}{'，且不能为关键字null(不区分大小写)。"
    );
  });

  it('Should return information with dom element', () => {
    const messages = {
      richText: 'This is a rich text with a custom component: {customComponent}',
    };
    const i18n = new I18n({
      locale: 'es',
      messages: { es: messages },
    });
    const values = {
      customComponent: <IndividualCustomComponent />,
    };
    const formattedMessage = i18n.formatMessage({ id: 'richText' }, values);

    // 渲染格式化后的文本内容
    const { getByText } = render(<div>{formattedMessage}</div>);

    // 检查文本内容中是否包含自定义组件的内容
    expect(getByText('This is a rich text with a custom component')).toContain(
      'This is a rich text with a custom component'
    );
  });

  it('Should return information for nested scenes with dom elements', () => {
    const messages = {
      richText: 'This is a rich text with a custom component: {customComponent}',
      msg: 'test',
    };
    const i18n = new I18n({
      locale: 'es',
      messages: { es: messages },
    });
    const values = {
      customComponent: (
        <CustomComponent style={{ margin: '0 4px' }} text={'123'}>
          <CustomComponentChildren>{i18n.formatMessage({ id: 'msg' })}</CustomComponentChildren>
        </CustomComponent>
      ),
    };
    const formattedMessage = i18n.formatMessage({ id: 'richText' }, values);

    // 渲染格式化后的文本内容
    const { getByText } = render(<div>{formattedMessage}</div>);

    // 检查文本内容中是否包含自定义组件的内容
    expect(getByText('test')).toBeTruthy();
  });

  it('Should return information for nested scenes with dom elements', () => {
    const messages = {
      richText: 'This is a rich text with a custom component: {customComponent}',
      msg: 'test',
    };
    const i18n = new I18n({
      locale: 'es',
      messages: { es: messages },
    });
    const values = {
      customComponent: (
        <CustomComponent style={{ margin: '0 4px' }} text={'123'}>
          {i18n.formatMessage({ id: 'msg' })}
        </CustomComponent>
      ),
    };
    const formattedMessage = i18n.formatMessage({ id: 'richText' }, values);

    // 渲染格式化后的文本内容
    const { getByText } = render(<div>{formattedMessage}</div>);

    // 检查文本内容中是否包含自定义组件的内容
    expect(getByText('test')).toBeTruthy();
  });

  it('should be returned as value when Multiple dom elements\n', () => {
    const messages = {
      richText: '{today}, my name is {name}, and {age} years old!',
    };
    const i18n = new I18n({
      locale: 'es',
      messages: { es: messages },
    });
    const Name = () => {
      return <span>tom</span>;
    };
    const Age = () => {
      return <span>16</span>;
    };
    const Today = () => {
      return <span>3月2日</span>;
    };
    const values = {
      today: <Today />,
      name: <Name />,
      age: <Age />,
    };
    const formattedMessage = i18n.formatMessage({ id: 'richText' }, values);

    // 渲染格式化后的文本内容
    const { getByText } = render(<div>{formattedMessage}</div>);

    // 检查文本内容中是否包含自定义组件的内容
    expect(getByText('my name is tom, and 16 years old!')).toBeTruthy();
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

  // 复数规则时，多value值
  it('should return the formatted number', () => {
    const message = {
      'threats.eventMgr.common.loadingTipMore':
        'Loaded {num, plural, =0 {record: #} one {record: #} other {records: #}}' +
        ', total {total, plural, =0 {record: #} one {record: #} other {records: #}}, pull down to load more...',
    };
    const i18n = new I18n({
      locale: 'en',
      messages: message,
    });
    const messageResult = i18n.formatMessage(
      { id: `threats.eventMgr.common.loadingTipMore` },
      { num: 100, total: 29639 }
    );
    expect(messageResult).toEqual('Loaded records: 100, total records: 29,639, pull down to load more...');
  });
});
