import { lexer } from '../lexer';

describe('path lexer Test', () => {
  it('basic lexer test', () => {
    const tokens = lexer('/www.a.com/b/c');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'b' },
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'c' },
    ]);
  });

  it('null tokens', () => {
    const tokens = lexer('');
    expect(tokens).toStrictEqual([]);
  });

  it('a slash test', () => {
    const tokens = lexer('/');
    expect(tokens).toStrictEqual([{ type: 'delimiter', value: '/' }]);
  });

  it(`don't start with a slash`, () => {
    const func = () => lexer('abc.com');
    expect(func).toThrow(Error(`Url must start with "/".`));
  });

  it('dynamic params test', () => {
    const tokens = lexer('/www.a.com/:b');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'b' },
    ]);
  });

  it('dynamic params with pattern', () => {
    const tokens = lexer('/www.a.com/:b(a)/*');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'b' },
      { type: '(', value: '(' },
      { type: 'pattern', value: 'a' },
      { type: ')', value: ')' },
      { type: 'delimiter', value: '/' },
      { type: 'wildcard', value: '*' },
    ]);
  });

  it('wildcard params test', () => {
    const tokens = lexer('/www.a.com/:b');
    expect(tokens).toStrictEqual([
      { type: 'delimiter', value: '/' },
      { type: 'static', value: 'www.a.com' },
      { type: 'delimiter', value: '/' },
      { type: 'param', value: 'b' },
    ]);
  });
});
