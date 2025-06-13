import processValueByParser from '../../../../src/utils/headerUtils/processValueByParser';

describe('processValueByParser function', () => {
  it('should return value when parser is not provided', () => {
    const key = 'Content-Type';
    const value = 'application/json';
    const result = processValueByParser(key, value);
    expect(result).toBe(value);
  });

  it('should parse key-value pairs when parser is true', () => {
    const key = 'Cookie';
    const value = 'key1=value1; key2=value2; key3=value3';
    const result = processValueByParser(key, value, true);
    const expectedOutput = {
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3',
    };
    expect(result).toEqual(expectedOutput);
  });

  it('should execute custom parser function when parser is a function', () => {
    const key = 'Authorization';
    const value = 'Bearer token';
    const customParser = (val: string, key: string) => `${key} ${val}`;
    const result = processValueByParser(key, value, customParser);
    const expectedOutput = 'Authorization Bearer token';
    expect(result).toBe(expectedOutput);
  });

  it('should execute regular expression match when parser is a regular expression', () => {
    const key = 'User-Agent';
    const value = 'Mozilla/5.0';
    const parser = /Mozilla\/(\d+\.\d+)/;
    const result = processValueByParser(key, value, parser);
    const expectedOutput = ['Mozilla/5.0', '5.0'];
    expect(result).toEqual(expectedOutput);
  });

  it('should throw a TypeError for an incorrect parser', () => {
    const key = 'Some-Header';
    const value = 'Some Value';
    const incorrectParser = 'invalid' as any;
    expect(() => {
      processValueByParser(key, value, incorrectParser);
    }).toThrow(TypeError);
  });
});
