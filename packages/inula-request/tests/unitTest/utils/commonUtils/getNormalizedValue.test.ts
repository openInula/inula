import utils from '../../../../src/utils/commonUtils/utils';

describe('getNormalizedValue function', () => {
  it('should return the same value if it is false or null', () => {
    expect(utils.getNormalizedValue(false)).toBe(false);
    expect(utils.getNormalizedValue(null)).toBe(null);
  });

  it('should convert the value to string if it is not false or null', () => {
    expect(utils.getNormalizedValue('test')).toBe('test');
    expect(utils.getNormalizedValue(123)).toBe('123');
    expect(utils.getNormalizedValue(true)).toBe('true');
  });

  it('should recursively normalize array values', () => {
    expect(utils.getNormalizedValue(['foo', 'bar', 123])).toEqual(['foo', 'bar', '123']);
    expect(utils.getNormalizedValue(['test', false, null])).toEqual(['test', false, null]);
    expect(utils.getNormalizedValue(['one', ['two', 'three']])).toEqual(['one', ['two', 'three']]);
  });
});
