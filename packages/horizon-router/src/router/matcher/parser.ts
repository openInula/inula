import { GetURLParams, Parser, ParserOption, TokenType } from './types';
import { lexer } from './lexer';
import { escapeStr, scoreCompare } from './utils';

// 不同类型参数的匹配得分
enum MatchScore {
  // 固定参数
  static = 10,
  // 动态参数
  param = 6,
  // 通配符参数
  wildcard = 3,
  placeholder = -1,
}

export type Params<P> = { [K in keyof P]?: P[K] };

// 兼容 react v5 matched类型
export type Matched<P = any> = {
  score: number[];
  params: Params<P>;
  path: string;
  url: string;
  isExact: boolean;
};

const defaultOption: Required<ParserOption> = {
  // url匹配时是否大小写敏感
  caseSensitive: true,
  // 是否严格匹配url结尾的/
  strictMode: false,
  // 是否完全精确匹配
  exact: false,
};
// 正则表达式中需要转义的字符
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
// 用于匹配两个//中的的值
const BASE_PARAM_PATTERN = '[^/]+';

const DefaultDelimiter = '/#?';

export function createPathParser<Str extends string>(pathname: Str, option?: ParserOption): Parser<GetURLParams<Str>>;
export function createPathParser<P = unknown>(pathname: string, option?: ParserOption): Parser<P>;
export function createPathParser<P = unknown>(pathname: string, option: ParserOption = defaultOption): Parser<P> {
  const {
    caseSensitive = defaultOption.caseSensitive,
    strictMode = defaultOption.strictMode,
    exact = defaultOption.exact,
  } = option;
  /**
   * URL匹配整体流程
   * 1.词法解析，将URL模板解析为Token
   * 2.使用Token生成正则表达式
   * 3.利用正则表达式解析URL中参数或填充URL模板
   */
  let pattern = '^';
  const keys: string[] = [];
  const scores: number[] = [];

  const tokens = lexer(pathname);
  const onlyHasWildCard = tokens.length === 1 && tokens[0].type === TokenType.WildCard;
  const tokenCount = tokens.length;
  const lastToken = tokens[tokenCount - 1];

  for (let tokenIdx = 0; tokenIdx < tokenCount; tokenIdx++) {
    const token = tokens[tokenIdx];
    const nextToken = tokens[tokenIdx + 1];
    switch (token.type) {
      case TokenType.Delimiter:
        pattern += '/';
        break;
      case TokenType.Static:
        pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
        scores.push(MatchScore.static);
        break;
      case TokenType.Param:
        let paramRegexp = '';
        if (nextToken && nextToken.type === TokenType.LBracket) {
          // 跳过当前Token和左括号
          tokenIdx += 2;
          while (tokens[tokenIdx].type !== TokenType.RBracket) {
            paramRegexp += tokens[tokenIdx].value;
            tokenIdx++;
          }
        }
        pattern += paramRegexp ? `((?:${paramRegexp}))` : `(${BASE_PARAM_PATTERN})`;
        keys.push(token.value);
        scores.push(MatchScore.param);
        break;
      case TokenType.WildCard:
        keys.push(token.value);
        pattern += `((?:${BASE_PARAM_PATTERN})${onlyHasWildCard ? '?' : ''}(?:/(?:${BASE_PARAM_PATTERN}))*)`;
        scores.push(onlyHasWildCard ? MatchScore.wildcard : MatchScore.placeholder);
        break;
    }
  }
  const isWildCard = lastToken.type === TokenType.WildCard;

  if (!isWildCard && !exact) {
    if (!strictMode) {
      pattern += `(?:[${escapeStr(DefaultDelimiter)}](?=$))?`;
    }
    if (lastToken.type !== TokenType.Delimiter) {
      pattern += `(?=[${escapeStr(DefaultDelimiter)}]|$)`;
    }
  } else {
    pattern += strictMode ? '$' : `[${escapeStr(DefaultDelimiter)}]?$`;
  }

  const flag = caseSensitive ? '' : 'i';
  const regexp = new RegExp(pattern, flag);

  /**
   * @description 根据给定Pattern解析path
   */
  function parse(path: string): Matched<P> | null {
    const reMatch = path.match(regexp);

    if (!reMatch) {
      return null;
    }
    const matchedPath = reMatch[0];
    let params: Params<P> = {};
    let parseScore: number[] = Array.from(scores);
    for (let i = 1; i < reMatch.length; i++) {
      let param = reMatch[i];
      let key = keys[i - 1];
      if (key === '*' && param) {
        let value = param.split('/');
        if (!Array.isArray(params['*'])) {
          params['*'] = value;
        } else {
          params['*'].push(...value);
        }
        // 完成通配符参数解析后将placeholder替换为wildcard参数的分值
        parseScore.splice(
          scores.indexOf(MatchScore.placeholder),
          1,
          ...new Array(value.length).fill(MatchScore.wildcard),
        );
      } else {
        params[key] = param ? param : [];
      }
    }

    const isExact = path === matchedPath;
    const url = path === '/' && matchedPath === '' ? '/' : matchedPath;
    return { isExact: isExact, path: pathname, url: url, score: parseScore, params: params };
  }

  /**
   * @description 使用给定参数填充pattern，得到目标URL
   */
  function compile(params: Params<P>): string {
    let path = '';
    for (const token of tokens) {
      switch (token.type) {
        case TokenType.Static:
          path += token.value;
          break;
        case TokenType.Param:
          if (!params[token.value]) {
            throw new Error('Param is invalid.');
          }
          path += params[token.value];
          break;
        case TokenType.WildCard:
          let wildCard = params['*'];
          if (wildCard instanceof Array) {
            path += wildCard.join('/');
          } else {
            path += wildCard;
          }
          break;
        case TokenType.Delimiter:
          path += token.value;
          break;
      }
    }
    return path;
  }

  return {
    get regexp() {
      return regexp;
    },
    get keys() {
      return keys;
    },
    compile,
    parse,
  };
}

/**
 * @description 依次使用pathname与pattern进行匹配，根据匹配分数取得分数最高结果
 */
export function matchPath<P = any>(
  pathname: string,
  pattern: string | string[],
  option?: ParserOption,
): Matched<P> | null {
  const patterns = Array.isArray(pattern) ? [...pattern] : [pattern];
  const matchedResults: Matched<P>[] = [];
  for (const item of patterns) {
    const parser = createPathParser(item, option);
    const matched = parser.parse(pathname);
    if (matched) {
      matchedResults.push(matched);
    }
  }
  return !matchedResults.length ? null : matchedResults.sort((a, b) => scoreCompare(a.score, b.score))[0];
}

export function generatePath<P = any>(path: string, params: Params<P>) {
  const parser = createPathParser(path);
  return parser.compile(params);
}