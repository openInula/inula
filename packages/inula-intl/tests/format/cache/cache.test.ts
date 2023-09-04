/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import creatI18nCache from '../../../src/format/cache/cache';

describe('creatI18nCache', () => {
  it('should create an empty IntlCache object', () => {
    const intlCache = creatI18nCache();

    expect(intlCache).toEqual({
      dateTimeFormat: {},
      numberFormat: {},
      messages: {},
      plurals: {},
      select: {},
      octothorpe: {},
    });
  });
});
