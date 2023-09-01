import getMergedConfig from '../../../../src/utils/configUtils/getMergedConfig';

describe('getMergedConfig function', () => {
  it('should merge two configs correctly', () => {
    const config1 = {
      baseURL: 'https://example.com/api',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    };

    const config2 = {
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: { 'Authorization': 'Bearer token' },
      responseType: 'json',
    };

    const mergedConfig = getMergedConfig(config1, config2);

    expect(mergedConfig).toEqual({
      baseURL: 'https://example.com/api',
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
      timeout: 5000,
      responseType: 'json',
    });
  });

  it('should handle missing or undefined config values', () => {
    const config1 = {
      baseURL: 'https://example.com/api',
      headers: { 'Content-Type': 'application/json' },
    };

    const config2 = {
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: undefined,
    };

    const mergedConfig = getMergedConfig(config1, config2);

    expect(mergedConfig).toEqual({
      baseURL: 'https://example.com/api',
      method: 'POST',
      data: { name: 'John', age: 25 },
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
