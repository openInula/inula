import { parseKeyValuePairs } from '../../../../src/utils/headerUtils/processValueByParser';

describe('parseKeyValuePairs function', () => {
  it('should parse key-value pairs separated by commas', () => {
    const input = 'key1=value1, key2=value2, key3=value3';
    const expectedOutput = {
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs separated by semicolons', () => {
    const input = 'key1=value1; key2=value2; key3=value3';
    const expectedOutput = {
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs with no spaces', () => {
    const input = 'key1=value1,key2=value2,key3=value3';
    const expectedOutput = {
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs with leading/trailing spaces', () => {
    const input = '  key1 = value1 , key2 = value2 , key3 = value3  ';
    const expectedOutput = {
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should parse key-value pairs with spaces', () => {
    const input = 'key1=value1, key2=value with spaces, key3=value3';
    const expectedOutput = {
      'key1': 'value1',
      'key2': 'value with spaces',
      'key3': 'value3',
    };
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should return an empty object for empty input', () => {
    const input = '';
    const expectedOutput = {};
    const result = parseKeyValuePairs(input);
    expect(result).toEqual(expectedOutput);
  });
});
