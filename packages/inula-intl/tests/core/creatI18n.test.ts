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
import createI18n from '../../src/core/createI18n';

describe('createI18n', () => {
  it('createIntl', function () {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        foo: 'bar',
      },
    });
    expect(
      i18n.formatMessage({
        id: 'foo',
      })
    ).toBe('bar');
  });

  it('should not warn when defaultRichTextElements is not used', function () {
    const onWarn = jest.fn();
    createI18n({
      locale: 'en',
      messages: {
        foo: 'bar',
      },
      onWarn,
    });
    expect(onWarn).not.toHaveBeenCalled();
  });
});



