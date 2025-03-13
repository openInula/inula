/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import { render } from 'openinula';
import { IntlProvider, useIntl } from '../../../index';

const FunctionComponent = ({ spy }: { spy?: Function }) => {
  const { locale } = useIntl();
  spy!(locale);
  return null;
};

const FC = () => {
  const i18n = useIntl();
  return <span>{i18n.formatNumber(10000, { style: 'currency', currency: 'USD' })}</span>;
};

describe('useIntl() hooks', () => {
  it('throws when <IntlProvider> is missing from ancestry', () => {
    // So it doesn't spam the console
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FunctionComponent />, container)).toThrow('I18n object is not found!');
  });

  it('hooks onto the intl context', () => {
    const spy = jest.fn();
    render(
      <IntlProvider locale="en">
        <FunctionComponent spy={spy} />
      </IntlProvider>,
      container
    );
    expect(spy).toHaveBeenCalledWith('en');
  });

  it('should work when switching locale on provider', () => {
    render(
      <IntlProvider locale="en">
        <div data-testid="comp">
          <FC />
        </div>
      </IntlProvider>,
      container
    );
    expect(container.querySelector('[data-testid="comp"]')!.innerHTML).toMatchSnapshot();

    render(
      <IntlProvider locale="es">
        <div data-testid="comp">
          <FC />
        </div>
      </IntlProvider>,
      container
    );
    expect(container.querySelector('[data-testid="comp"]')!.innerHTML).toMatchSnapshot();

    render(
      <IntlProvider locale="en">
        <div data-testid="comp">
          <FC />
        </div>
      </IntlProvider>,
      container
    );
    expect(container.querySelector('[data-testid="comp"]')!.innerHTML).toMatchSnapshot();
  });
});
