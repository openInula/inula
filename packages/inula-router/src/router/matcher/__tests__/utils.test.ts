import { cleanPath, scoreCompare } from '../utils';

describe('test for utils', () => {
  it('cleanPath func test', () => {
    const pattern = '/www.a.com//b//c';
    const generated = cleanPath(pattern);
    expect(generated).toBe('/www.a.com/b/c');
  });

  it('parse score compare1', function() {
    const res = [[5], [10], [10, 5]].sort((a, b) => scoreCompare(a, b));
    expect(res).toStrictEqual([[10, 5], [10], [5]]);
  });

  it('parse score compare2', function() {
    const res = [[10], [10], [10, 5]].sort((a, b) => scoreCompare(a, b));
    expect(res).toStrictEqual([[10, 5], [10], [10]]);
  });
});
