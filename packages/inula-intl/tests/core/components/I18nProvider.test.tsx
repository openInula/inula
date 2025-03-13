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

import { act, render } from 'openinula';
import { IntlProvider } from '../../../index';
import { createI18nInstance } from '../../../src/core/I18n';

describe('I18nProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const locale = 'en';
  const i18n = createI18nInstance({
    locale: locale,
  });

  it('should re-render on locale changes', () => {
    const CurrentLocale = () => {
      return <span data-testid="locale">{i18n.locale}</span>;
    };

    render(
      <IntlProvider key={locale} locale={locale} messages={{}}>
        <CurrentLocale />
      </IntlProvider>,
      container
    );

    // First render - check initial locale
    expect(container.querySelector('[data-testid="locale"]')!.textContent).toEqual('en');

    // Load messages and check locale remains same
    act(() => {
      i18n.loadMessage('en', {});
    });

    expect(container.querySelector('[data-testid="locale"]')!.textContent).toEqual('en');

    // Change language and check new locale
    act(() => {
      i18n.loadMessage('cs', {});
      i18n.changeLanguage('cs');
    });

    setTimeout(() => {
      expect(container.querySelector('[data-testid="locale"]')!.textContent).toEqual('cs');
    }, 1000);
  });

  it('should subscribe for locale changes', () => {
    const i18n = createI18nInstance();
    i18n.on = jest.fn(() => jest.fn());
    expect(i18n.on).not.toBeCalled();

    render(
      <IntlProvider key={locale} locale={locale} messages={{}}>
        <p />
      </IntlProvider>,
      container
    );

    setTimeout(() => {
      expect(i18n.on).toBeCalledWith('change', expect.anything());
    }, 1000);
  });

  it('should subscribe for locale changes when param i18n', () => {
    const i18n = createI18nInstance();
    i18n.on = jest.fn(() => jest.fn());
    expect(i18n.on).not.toBeCalled();

    render(
      <IntlProvider i18n={i18n}>
        <p />
      </IntlProvider>,
      container
    );

    setTimeout(() => {
      expect(i18n.on).toBeCalledWith('change', expect.anything());
    }, 1000);
  });

  it('should render children', () => {
    const child = <div data-testid="child" />;

    render(
      <IntlProvider key={locale} locale={locale} messages={{}}>
        {child}
      </IntlProvider>,
      container
    );

    expect(container.querySelector('[data-testid="child"]')).toBeTruthy();
  });
});
