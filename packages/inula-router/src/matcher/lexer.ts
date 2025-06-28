import { Token, TokenType } from './types';
import { cleanPath } from './utils';

const validChar = /[^/:()*?$^+]/;

// 对Url模板进行词法解析，解析结果为Tokens
export function lexer(path: string): Token[] {
  const tokens: Token[] = [];

  if (!path) {
    return tokens;
  }

  let urlPath = cleanPath(path);
  if (urlPath !== '*' && !urlPath.startsWith('/')) {
    throw new Error(`Url must start with "/".`);
  }

  const getLiteral = () => {
    let name = '';
    while (i < urlPath.length && validChar.test(urlPath[i])) {
      name += urlPath[i];
      skipChar(1);
    }
    return name;
  };

  const skipChar = (step: number) => {
    i += step;
  };

  let i = 0;
  while (i < urlPath.length) {
    const curChar = urlPath[i];
    const prevChar = urlPath[i - 1];

    if (curChar === '/') {
      tokens.push({ type: TokenType.Delimiter, value: urlPath[i] });
      skipChar(1);
      continue;
    }
    // dynamic params (/:a)
    if (prevChar === '/' && curChar === ':') {
      skipChar(1);
      tokens.push({ type: TokenType.Param, value: getLiteral() });
      continue;
    }
    // wildCard params (/:*)
    if ((prevChar === '/' || prevChar === undefined) && curChar === '*') {
      tokens.push({ type: TokenType.WildCard, value: urlPath[i] });
      skipChar(1);
      continue;
    }
    // static params
    if (prevChar === '/' && validChar.test(curChar)) {
      tokens.push({ type: TokenType.Static, value: getLiteral() });
      continue;
    }
    if (curChar === '(') {
      tokens.push({ type: TokenType.LBracket, value: '(' });
      skipChar(1);
      continue;
    }
    if (curChar === ')') {
      tokens.push({ type: TokenType.RBracket, value: ')' });
      skipChar(1);
      continue;
    }
    if (['*', '?', '$', '^', '+'].includes(curChar)) {
      tokens.push({ type: TokenType.Pattern, value: curChar });
      skipChar(1);
      continue;
    }
    if (validChar.test(curChar)) {
      tokens.push({ type: TokenType.Pattern, value: getLiteral() });
      continue;
    }
    // 跳过非法字符
    skipChar(1);
  }

  return tokens;
}
