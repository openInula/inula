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

import { render } from 'openinula';
import { injectIntl, IntlProvider } from '../../../index';

const mountWithProvider = (el: JSX.Element) => render(<IntlProvider locale="en">{el}</IntlProvider>, container);

describe('InjectIntl', () => {
  let Wrapped;

  beforeEach(() => {
    Wrapped = ({ intl }: { intl }) => <div data-testid="test">{JSON.stringify(intl)}</div>;
    Wrapped.someStatic = {
      type: true,
    };
  });

  it('allows introspection access to the wrapped component', () => {
    expect((injectIntl(Wrapped) as any).WrappedComponent).toBe(Wrapped);
  });

  it('should copy statics', () => {
    expect((injectIntl(Wrapped) as any).someStatic.type).toBe(true);
  });

  it('throws when InjectI18n is missing from ancestry', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const Injected = injectIntl(Wrapped);

    expect(() => render(<Injected />, container)).toThrow("Cannot read properties of null (reading 'i18nInstance')");
  });

  it('should contain all props in WrappedComponent when use InjectI18n', () => {
    const Injected = injectIntl(Wrapped) as any;
    const props = {
      foo: 'bar',
    };

    mountWithProvider(<Injected {...props} />);
    const testElement = container.querySelector('[data-testid="test"]')!;

    expect(testElement.innerHTML).toEqual(
      '{"_events":{},"locale":"en","locales":"en","defaultLocale":"en","timeZone":"","allMessages":{},"_localeConfig":{},"cache":{"dateTimeFormat":{},"numberFormat":{},"plurals":{},"select":{},"octothorpe":{}}}'
    );
  });
});
