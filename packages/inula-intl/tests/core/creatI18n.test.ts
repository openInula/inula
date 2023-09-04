/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
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



