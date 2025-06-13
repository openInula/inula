import checkHeaderName from '../../../../src/utils/headerUtils/checkHeaderName';

describe('checkHeaderName', () => {
  it('should return true for valid header name', () => {
    const validHeaderName = 'Content-Type';
    const result = checkHeaderName(validHeaderName);
    expect(result).toBe(true);
  });

  it('should return false for invalid header name', () => {
    const invalidHeaderName = 'Content-Type!';
    const result = checkHeaderName(invalidHeaderName);
    expect(result).toBe(false);
  });

  it('should return false for empty string', () => {
    const emptyString = '';
    const result = checkHeaderName(emptyString);
    expect(result).toBe(false);
  });
});
