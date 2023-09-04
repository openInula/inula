import utils from '../../../../src/utils/commonUtils/utils';

describe('toJSONSafe function', () => {
  it('should return a clone of the object', () => {
    const input = { a: 1, b: 2, c: [3, 4, 5], d: { e: 6 } };
    const result = utils.toJSONSafe(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
    expect(result?.c).not.toBe(input.c);
    expect(result?.d).not.toBe(input.d);
  });

  it('should handle toJSON method', () => {
    const input = { a: 1, toJSON: () => ({ b: 2 }) };
    const result = utils.toJSONSafe(input);
    expect(result).toEqual({ b: 2 });
  });

  it('should handle arrays', () => {
    const input = [1, 2, { a: 3 }, [4, 5]];
    const result = utils.toJSONSafe(input);
    expect(result).toEqual([1, 2, { a: 3 }, [4, 5]]);
    expect(result?.[2]).not.toBe(input[2]);
    expect(result?.[3]).not.toBe(input[3]);
  });
});
