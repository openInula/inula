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

import { useI18n } from '../../../src/vueI18n/hooks/useI18n';
import vueI18n from '../../../src/vueI18n/VueI18n';
import Inula from '@cloudsop/horizon';
import { IntlProvider, createI18n, useIntl } from '../../../src/intl';
import { render, screen } from '../../testingLibrary/testingLibrary';

describe('useI18n', () => {
  it('load useIntl when exit options with messages', () => {
    const topI18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          hello: 'Welcome to vue-i18n internationalization',
          change: 'change',
        },
        zh: {
          hello: '欢迎使用vue-i18n国际化',
          change: '切换',
        },
      },
    });
    let _i18n;
    const FunctionComponent = () => {
      const i18n = useI18n({
        locale: 'en',
        messages: {
          en: {
            hello: 'hello!',
          },
        },
      });
      _i18n = i18n;

      return <></>;
    };

    render(
      <IntlProvider locale="en" i18n={topI18n.global}>
        <FunctionComponent />
      </IntlProvider>
    );

    expect(_i18n.t('hello')).toEqual('hello!');
  });
});
