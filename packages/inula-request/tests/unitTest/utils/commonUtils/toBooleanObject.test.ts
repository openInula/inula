import utils from '../../../../src/utils/commonUtils/utils';

describe('toBooleanObject function', () => {
  it('should return an object with boolean properties', () => {
    const result = utils.toBooleanObject('foo,bar,baz', ',');
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });

  it('should handle an array of strings as input', () => {
    const result = utils.toBooleanObject(['foo', 'bar', 'baz']);
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });

  it('should return an empty object for empty input', () => {
    const result = utils.toBooleanObject('');
    expect(result).toEqual({});
  });

  it('should handle custom delimiter', () => {
    const result = utils.toBooleanObject('foo|bar|baz', '|');
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });

  it('should handle spaces in input', () => {
    const result = utils.toBooleanObject('foo, bar, baz', ',');
    expect(result).toEqual({
      'foo': true,
      'bar': true,
      'baz': true,
    });
  });
});

