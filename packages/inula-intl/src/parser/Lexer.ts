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

import ruleUtils from '../utils/parseRuleUtils';
import { LexerInterface } from '../types/interfaces';

/**
 * 词法解析器，主要根据设计的规则对message进行处理成Token
 */
class Lexer<T> implements LexerInterface<T> {
  readonly startState: string;
  readonly unionReg: Record<string, any>;
  private buffer = '';
  private stack: string[] = [];
  private index = 0;
  private line = 1;
  private col = 1;
  private queuedText = '';
  private state = '';
  private groups: string[] = [];
  private error: Record<string, any> | undefined;
  private regexp: any;
  private fast: Record<string, unknown> = {};
  private queuedGroup: string | null = '';
  private value = '';

  constructor(unionReg: Record<string, any>, startState: string) {
    this.startState = startState;
    this.unionReg = unionReg;
    this.buffer = '';
    this.stack = [];
    this.reset();
  }

  /**
   *  根据新的消息重置解析器
   * @param data 消息数据
   */
  public reset(data?: string) {
    this.buffer = data || '';
    this.index = 0;
    this.line = 1;
    this.col = 1;
    this.queuedText = '';
    this.setState(this.startState);
    this.stack = [];
    return this;
  }

  private setState(state: string) {
    if (!state || this.state === state) {
      return;
    }
    this.state = state;
    const info = this.unionReg[state];
    this.groups = info.groups;
    this.error = info.error;
    this.regexp = info.regexp;
    this.fast = info.fast;
  }

  private popState() {
    this.setState(<string>this.stack.pop());
  }

  private pushState(state: string) {
    this.stack.push(this.state);
    this.setState(state);
  }

  private getGroup(match: Record<string, object>) {
    const groupCount = this.groups.length;
    for (let i = 0; i < groupCount; i++) {
      if (match[i + 1] !== undefined) {
        return this.groups[i];
      }
    }
    throw new Error('No token type found matching text!');
  }

  private tokenToString() {
    return this.value;
  }

  /**
   * 迭代获取下一个 token
   */
  public next() {
    const index = this.index;

    if (this.queuedGroup) {
      const token = this.getToken(this.queuedGroup, this.queuedText, index);
      this.queuedGroup = null;
      this.queuedText = '';
      return token;
    }

    const buffer = this.buffer;
    if (index === buffer.length) {
      return;
    }

    const fastGroup = this.fast[buffer.charCodeAt(index)];
    if (fastGroup) {
      return this.getToken(fastGroup, buffer.charAt(index), index);
    }

    // 如果没有快速匹配，那么使用预先编译的正则表达式进行匹配操作
    const regexp = this.regexp;
    regexp.lastIndex = index;
    const match = getMatch(regexp, buffer);
    const error = this.error;
    if (match == null) {
      return this.getToken(error, buffer.slice(index, buffer.length), index);
    }

    const group = this.getGroup(match);
    const text = match[0];

    if (error?.fallback && match.index !== index) {
      this.queuedGroup = group;
      this.queuedText = text;
      return this.getToken(error, buffer.slice(index, match.index), index);
    }

    return this.getToken(group, text, index);
  }

  /**
   * 获取Token
   * @param group 解析模板后获得的属性值
   * @param text 文本属性的信息
   * @param offset 偏移量
   * @private
   */
  private getToken(group: any, text: string, offset: number) {
    let lineNum = 0;
    let last = 1; // 最后一个换行符的索引位置
    if (group.lineBreaks) {
      const matchNL = /\n/g;
      if (text === '\n') {
        lineNum = 1;
      } else {
        while (matchNL.exec(text)) {
          lineNum++;
          last = matchNL.lastIndex;
        }
      }
    }

    const token = {
      type: (typeof group.type === 'function' && group.type(text)) || group.defaultType,
      value: typeof group.value === 'function' ? group.value(text) : text,
      text: text,
      toString: this.tokenToString,
      offset: offset, // 标记在输入 buffer 中的偏移量
      lineBreaks: lineNum,
      line: this.line, // token 所在的行号
      col: this.col, // token 所在的列号
    };

    const size = text.length;
    this.index += size;
    this.line += lineNum;
    if (lineNum !== 0) {
      this.col = size - last + 1;
    } else {
      this.col += size;
    }

    if (group.shouldThrow) {
      throw new Error('Invalid Syntax!');
    }

    if (group.pop) {
      this.popState();
    } else if (group.push) {
      this.pushState(group.push);
    } else if (group.next) {
      this.setState(group.next);
    }

    return token;
  }

  // 增加迭代器，允许逐个访问集合中的元素方法
  [Symbol.iterator]() {
    return {
      next: (): IteratorResult<T> => {
        const token = this.next();
        return { value: token, done: !token } as IteratorResult<T>;
      },
    };
  }
}

/**
 * 根据正则表达式，获取匹配到message的值
 * 索引为 0 的元素是完整的匹配结果。
 * 索引为 1、2、3 等的元素是正则表达式中指定的捕获组的匹配结果。
 */
const getMatch = ruleUtils.checkSticky()
  ? // 正则表达式具有 sticky 标志
    (regexp: any, buffer: string) => regexp.exec(buffer)
  : // 正则表达式具有 global 标志,匹配的字符串长度为 0，则表示匹配失败
    (regexp: any, buffer: string) => (regexp.exec(buffer)[0].length === 0 ? null : regexp.exec(buffer));

export default Lexer;
