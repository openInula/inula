import utils from '../../../../src/utils/commonUtils/utils';

describe('objectToQueryString function', () => {
  it('should return empty string if object is empty', () => {
    const input = {};
    const expectedResult = '';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should return a query string with one parameter', () => {
    const input = { key: 'value' };
    const expectedResult = 'key=value';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should return a query string with multiple parameters', () => {
    const input = { key1: 'value1', key2: 'value2' };
    const expectedResult = 'key1=value1&key2=value2';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should encode keys and values', () => {
    const input = { 'key with spaces': 'value with spaces' };
    const expectedResult = 'key%20with%20spaces=value%20with%20spaces';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should handle values of different types', () => {
    const input = {
      key1: 'string',
      key2: 42,
      key3: true,
      key4: [1, 2, 3],
      key5: { a: 'b' },
    };
    const expectedResult =
      'key1=string&key2=42&key3=true&key4[]=1&key4[]=2&key4[]=3&key5=%5Bobject%20Object%5D';
    const result = utils.objectToQueryString(input);
    expect(result).toBe(expectedResult);
  });

  it('should handle custom params serializer when paramsSerializer is set', () => {
    const input = {
      key1: 'string',
      key4: [1, 2, 3],
    };

    const options = {
      serialize: (params) => {
        return Object.keys(params).filter(item => Object.prototype.hasOwnProperty.call(params, item))
          .reduce((pre, currentValue) => {
            if (params[currentValue]) {
              if (pre) {
                return `${pre}&${currentValue}=${encodeURIComponent(params[currentValue])}`;
              }
              return `${currentValue}=${encodeURIComponent(params[currentValue])}`;
            } else {
              return pre;
            }
          }, '');
      }
    };

    const expectedResult = 'key1=string&key4=1%2C2%2C3';
    const result = utils.objectToQueryString(input, options);
    expect(result).toBe(expectedResult);
  });
});
