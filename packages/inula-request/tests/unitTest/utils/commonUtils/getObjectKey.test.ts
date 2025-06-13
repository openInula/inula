import utils from '../../../../src/utils/commonUtils/utils';

describe('getObjectKey function', () => {
  it('should return null if object is empty', () => {
    const obj = {};
    const result = utils.getObjectKey(obj, 'foo');
    expect(result).toBeNull();
  });

  it('should return null if key is not found', () => {
    const obj = { a: 1, b: 2 };
    const result = utils.getObjectKey(obj, 'c');
    expect(result).toBeNull();
  });

  it('should return matching key in case-insensitive manner', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result1 = utils.getObjectKey(obj, 'B');
    const result2 = utils.getObjectKey(obj, 'C');
    expect(result1).toBe('b');
    expect(result2).toBe('c');
  });
});
