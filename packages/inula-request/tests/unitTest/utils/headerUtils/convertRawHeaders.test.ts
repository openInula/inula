import convertRawHeaders from '../../../../src/utils/headerUtils/convertRawHeaders';

describe('convertRawHeaders', () => {
  it('should convert raw headers to a header map object', () => {
    const rawHeaders = 'Content-Type: application/json\nAuthorization: Bearer token';
    const expectedHeaders = {
      'content-type': 'application/json',
      'authorization': 'Bearer token',
    };
    const result = convertRawHeaders(rawHeaders);
    expect(result).toEqual(expectedHeaders);
  });

  it('should handle multiple occurrences of Set-Cookie header', () => {
    const rawHeaders = 'Set-Cookie: cookie1=value1\nSet-Cookie: cookie2=value2';
    const expectedHeaders = {
      'set-cookie': ['cookie1=value1', 'cookie2=value2'],
    };
    const result = convertRawHeaders(rawHeaders);
    expect(result).toEqual(expectedHeaders);
  });

  it('should handle empty raw headers', () => {
    const rawHeaders = '';
    const expectedHeaders = {};
    const result = convertRawHeaders(rawHeaders);
    expect(result).toEqual(expectedHeaders);
  });

  it('should handle raw headers with leading/trailing whitespaces', () => {
    const rawHeaders = '  Content-Type: application/json\nAuthorization: Bearer token  ';
    const expectedHeaders = {
      'content-type': 'application/json',
      'authorization': 'Bearer token',
    };
    const result = convertRawHeaders(rawHeaders);
    expect(result).toEqual(expectedHeaders);
  });

  it('should handle raw headers with missing colon', () => {
    const rawHeaders = 'Content-Type application/json';
    const expectedHeaders = {};
    const result = convertRawHeaders(rawHeaders);
    expect(result).toEqual(expectedHeaders);
  });
});
