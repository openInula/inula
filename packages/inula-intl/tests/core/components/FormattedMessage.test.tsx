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
import { createContext, render } from 'openinula';
import I18nProvider from '../../../src/core/components/I18nProvider';
import { FormattedMessage } from '../../../index';
import { createI18nInstance } from '../../../src/core/I18n';

const dummyContext = createContext('');
const { Provider: DummyProvider, Consumer: DummyConsumer } = dummyContext;

describe('<FormattedMessage>', () => {
  const enMessage = {
    hello: '你好',
    id: "Je m'appelle {name}",
  };
  const locale = 'en';

  const i18n = createI18nInstance({
    locale: locale,
    messages: enMessage,
  });
  it('should format context', function () {
    render(
      <I18nProvider key={locale} locale={locale} messages={enMessage}>
        <span data-testid="id">
          <FormattedMessage data-testid="id" id={enMessage.hello} />
        </span>
      </I18nProvider>,
      container
    );

    setTimeout(() => {
      expect(container.querySelector('[data-testid="id"]')!.textContent).toEqual(i18n.formatMessage('hello', {}, {}));
    }, 1000);
  });
  it('should  format context', function () {
    const props = {
      id: enMessage.id,
      values: { name: 'fred' },
    };
    render(
      <I18nProvider key={locale} locale={'en'} messages={enMessage}>
        <span data-testid="id">
          <FormattedMessage data-testid="id" id={props.id} values={props.values} />
        </span>
      </I18nProvider>,
      container
    );

    expect(container.querySelector('[data-testid="id"]')!.textContent).toEqual(
      i18n.formatMessage('id', { name: 'fred' }, {})
    );
  });
});
