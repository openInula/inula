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

import { createI18n } from '../../../src/vueI18n-adapter/src/hooks/createI18n';

describe('createI18n', () => {
  it('load createIntl', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          hello: 'hello!',
        },
        ja: {},
      },
    });
    expect(i18n.$t('hello')).toEqual('hello!');
  });
});
