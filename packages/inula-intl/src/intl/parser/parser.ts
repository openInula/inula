/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { lexer } from './parseMappingRule';
import { RawToken } from '../types/types';
import { DEFAULT_PLURAL_KEYS } from '../constants';
import { Content, FunctionArg, PlainArg, Select, TokenContext } from '../types/interfaces';

/**
 *  语法解析器，根据Token,获得具备上下文的AST
 */
class Parser {
  cardinalKeys: string[] = DEFAULT_PLURAL_KEYS;
  ordinalKeys: string[] = DEFAULT_PLURAL_KEYS;

  constructor(message: string) {
    lexer.reset(message);
  }

  isSelectKeyValid(type: Select['type'], value: string) {
    if (value[0] === '=') {
      if (type === 'select') {
        throw new Error('The key value of the select type is invalid.');
      }
    } else if (type !== 'select') {
      const values = type === 'plural' ? this.cardinalKeys : this.ordinalKeys;
      if (values.length > 0 && !values.includes(value)) {
        throw new Error(`${type} type key value is invalid.`);
      }
    }
  }

  processSelect({ value: arg }: any, isPlural: boolean, context: TokenContext, type: Select['type']): Select {
    const select: Select = { type, arg, cases: [], ctx: context };

    if (type === 'plural' || type === 'selectordinal') {
      isPlural = true;
    }

    for (const token of lexer) {
      switch (token.type) {
        case 'offset': {
          if (type === 'select') {
            throw new Error('The complex offset of the select type is incorrect.');
          }
          if (select.cases.length > 0) {
            throw new Error('The complex offset must be set before cases.');
          }

          select.offset = Number(token.value);
          context.text += token.text;
          context.lineNum += token.lineBreaks;
          break;
        }
        case 'case': {
          this.isSelectKeyValid(type, token.value);
          select.cases.push({
            key: token.value.replace(/=/g, ''),
            tokens: this.parse(isPlural),
            ctx: getContext(token),
          });
          break;
        }
        case 'end': {
          return select;
        }
        default: {
          throw new Error(`Unrecognized analyzer token: ${token.type}`);
        }
      }
    }
    throw new Error('The message end position is invalid.');
  }

  /**
   * 解析获得的Token
   * @param token
   * @param isPlural
   */
  parseToken(token: RawToken, isPlural: boolean): PlainArg | FunctionArg | Select {
    const context = getContext(token);
    const nextToken = lexer.next();

    if (!nextToken) {
      throw new Error('The message end position is invalid.');
    }

    context.text += nextToken.text;
    context.lineNum += nextToken.lineBreaks;

    switch (nextToken.type) {
      case 'end': {
        return { type: 'argument', arg: token.value, ctx: context };
      }
      case 'func-simple': {
        const end = lexer.next();
        if (!end) {
          throw new Error('The message end position is invalid.');
        }
        if (end.type !== 'end') {
          throw new Error(`Unrecognized analyzer token: ${end.type}`);
        }
        context.text += end.text;
        if (checkSelectType(nextToken.value.toLowerCase())) {
          throw new Error(`Invalid parameter type: ${nextToken.value}`);
        }
        return {
          type: 'function',
          arg: token.value,
          key: nextToken.value,
          ctx: context,
        };
      }
      case 'func-args': {
        if (checkSelectType(nextToken.value.toLowerCase())) {
          throw new Error(`Invalid parameter type: ${nextToken.value}`);
        }
        const param = this.parse(isPlural);

        return {
          type: 'function',
          arg: token.value,
          key: nextToken.value,
          param,
          ctx: context,
        };
      }
      case 'select':
        if (checkSelectType(nextToken.value)) {
          return this.processSelect(token, isPlural, context, nextToken.value);
        } else {
          throw new Error(`Invalid select type: ${nextToken.value}`);
        }
      default:
        throw new Error(`Unrecognized analyzer token: ${nextToken.type}`);
    }
  }

  /**
   * 解析方法入口
   * 在根级别解析时，遇到结束符号即结束解析并返回结果；而在非根级别解析时，遇到结束符号会被视为不合法的结束位置，抛出错误
   * @param isPlural  标记复数
   * @param isRoot  标记根节点
   */
  parse(isPlural: boolean, isRoot?: boolean): Array<Content | PlainArg | FunctionArg | Select> {
    const tokens: any[] = [];
    let content: string | Content | null = null;

    for (const token of lexer) {
      if (token.type === 'argument') {
        if (content) {
          content = null;
        }
        tokens.push(this.parseToken(token, isPlural));
      } else if (token.type === 'octothorpe' && isPlural) {
        if (content) {
          content = null;
        }
        tokens.push({ type: 'octothorpe' });
      } else if (token.type === 'end' && !isRoot) {
        return tokens;
      } else if (token.type === 'doubleapos') {
        tokens.push(token.value);
      } else if (token.type === 'quoted') {
        tokens.push(token.value);
      } else if (token.type === 'content') {
        tokens.push(token.value);
      } else {
        let value = token.value;
        if (!isPlural && token.type === 'quoted' && value[0] === '#') {
          if (value.includes('{')) {
            throw new Error(`Invalid template: ${value}`);
          }
          value = token.text;
        }
        if (content) {
          content = value;
        } else {
          content = value;
          tokens.push(content);
        }
      }
    }

    if (isRoot) {
      return tokens;
    }
    throw new Error('The message end position is invalid.');
  }
}

/**
 * 获得 Token 的上下文
 * @param Token Token
 */
const getContext = (Token: RawToken): TokenContext => ({
  offset: Token.offset,
  line: Token.line,
  col: Token.col,
  text: Token.text,
  lineNum: Token.lineBreaks,
});

// 用以检查select规则中的类型
export const checkSelectType = (value: string): boolean => {
  return value === 'plural' || value === 'select' || value === 'selectordinal';
};

export default function parse(message: string): Array<Content | PlainArg | FunctionArg | Select> {
  const parser = new Parser(message);
  return parser.parse(false, true);
}
