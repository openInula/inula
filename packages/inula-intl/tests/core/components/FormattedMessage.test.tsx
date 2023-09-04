/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import * as React from 'react';
import I18nProvider from '../../../src/core/components/I18nProvider';
import { FormattedMessage } from '../../../index';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {createI18nInstance} from "../../../src/core/I18n";

const dummyContext = React.createContext('');
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
  it('should  format context', function () {
    const { getByTestId } = render(
      <I18nProvider key={locale} locale={locale} messages={enMessage}>
        <span data-testid="id">
          <FormattedMessage data-testid="id" id={enMessage.hello} />
        </span>
      </I18nProvider>
    );

    setTimeout(() => {
      expect(getByTestId('id')).toHaveTextContent(i18n.formatMessage('hello', '', {}));
    }, 1000);
  });
  it('should  format context', function () {
    const props = {
      id: enMessage.id,
      values: { name: 'fred' },
    };
    const { getByTestId } = render(
      <I18nProvider key={locale} locale={'en'} messages={enMessage}>
        <span data-testid="id">
          <FormattedMessage data-testid="id" id={props.id} values={props.values} />
        </span>
      </I18nProvider>
    );
    expect(getByTestId('id')).toHaveTextContent(i18n.formatMessage('id', { name: 'fred' }, {}));
  });
});
