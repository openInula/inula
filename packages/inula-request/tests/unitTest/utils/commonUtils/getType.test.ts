import utils from '../../../../src/utils/commonUtils/utils';

describe('getType function', () => {
  it('should return type "undefined" for undefined value', () => {
    const result = utils.getType(undefined);
    expect(result).toBe('undefined');
  });

  it('should return type "null" for null value', () => {
    const result = utils.getType(null);
    expect(result).toBe('null');
  });

  it('should return type "string" for string value', () => {
    const result = utils.getType('hello');
    expect(result).toBe('string');
  });

  it('should return type "number" for number value', () => {
    const result = utils.getType(123);
    expect(result).toBe('number');
  });

  it('should return type "boolean" for boolean value', () => {
    const result = utils.getType(true);
    expect(result).toBe('boolean');
  });

  it('should return type "array" for array value', () => {
    const result = utils.getType([1, 2, 3]);
    expect(result).toBe('array');
  });

  it('should return type "object" for object value', () => {
    const result = utils.getType({ name: 'Alice' });
    expect(result).toBe('object');
  });
});
