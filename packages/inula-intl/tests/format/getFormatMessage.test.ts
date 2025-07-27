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
import { getFormatMessage } from '../../src/format/getFormatMessage';
import I18n from '../../src/core/I18n';

describe('getFormatMessage', () => {
  // Mocked i18nInstance object
  const i18nInstance = new I18n({
    messages: {
      en: {
        greeting: 'Hello, {name}!',
      },
    },
    locale: 'en',
    onError: 'missingMessage',
  });

  it('should return the correct translation for an existing message ID', () => {
    const id = 'greeting';
    const values = { name: 'John' };
    const expectedResult = 'Hello, John!';

    const result = getFormatMessage(i18nInstance, id, values, {}, {});

    expect(result).toEqual(expectedResult);
  });

  it('should return the default message when the translation is missing', () => {
    const id = 'missingMessage';
    const expectedResult = 'missingMessage';

    const result = getFormatMessage(i18nInstance, id, {}, {}, {});

    expect(result).toEqual(expectedResult);
  });
});
