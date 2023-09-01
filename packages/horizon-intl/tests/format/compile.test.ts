/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import Translation from '../../src/format/Translation';
import utils from '../../src/utils/utils';

describe('compile', function () {
  const englishPlurals = {
    plurals(value, ordinal) {
      if (ordinal) {
        return (
          {
            '1': 'one',
            '2': 'two',
            '3': 'few',
          }[value] || 'other'
        );
      } else {
        return value === 1 ? 'one' : 'other';
      }
    },
  };
  const prepare = (message, locale?, locales?) => {
    const translation = new Translation(utils.compile(message), locale || 'en', locales, englishPlurals);
    return translation.translate.bind(translation);
  };

  it('should compile message with variable', function () {
    const cache = utils.compile('Hey {name}!');
    expect(new Translation(cache, 'en', [], {}).translate({ name: 'Joe' })).toEqual('Hey Joe!');
  });

  it('should compile select', function () {
    const translate = prepare('{value, select, female {She} other {They}}');
    expect(translate({ value: 'female' })).toEqual('She');
    expect(translate({ value: 'n/a' })).toEqual('They');
  });

  it('should compile plurals', function () {
    const translate = prepare('{value, plural, one {{value} Book} other {# Books}}');
    expect(translate({ value: 1 })).toEqual('1 Book');
    expect(translate({ value: 2 })).toEqual('2 Books');


    const translatePlurals = prepare('{value, plural, offset:1 =0 {No Books} one {# Book} other {# Books}}');

    expect(translatePlurals({ value: 0 })).toEqual('No Books');
    expect(translatePlurals({ value: 2 })).toEqual('1 Book');
    expect(translatePlurals({ value: 3 })).toEqual('2 Books');
  });

  it('should compile selectordinal', function () {
    const translateSelectordinal = prepare('{value, selectordinal, one {#st Book} two {#nd Book}}');
    expect(translateSelectordinal({ value: 1 })).toEqual('1st Book');
    expect(translateSelectordinal({ value: 2 })).toEqual('2nd Book');
  });
});
