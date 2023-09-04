/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import ruleUtils from '../utils/parseRuleUtils';
import { LexerInterface } from "../types/interfaces";

const getMatch = ruleUtils.checkSticky()
  ? // 正则表达式具有 sticky 标志
  (regexp, buffer) => regexp.exec(buffer)
  : // 正则表达式具有 global 标志,匹配的字符串长度为 0，则表示匹配失败
  (regexp, buffer) => (regexp.exec(buffer)[0].length === 0 ? null : regexp.exec(buffer));

class Lexer<T> implements LexerInterface<T> {
  readonly startState: string;
  readonly states: Record<string, any>;
  private buffer: string = '';
  private stack: string[] = [];
  private index;
  private line;
  private col;
  private queuedText;
  private state;
  private groups;
  private error;
  private regexp;
  private fast;
  private queuedGroup;
  private value;

  constructor(states, state) {
    this.startState = state;
    this.states = states;
    this.buffer = '';
    this.stack = [];
    this.reset();
  }

  public reset(data?, info?) {
    this.buffer = data || '';
    this.index = 0;
    this.line = info ? info.line : 1;
    this.col = info ? info.col : 1;
    this.queuedText = info ? info.queuedText : '';
    this.setState(info ? info.state : this.startState);
    this.stack = info && info.stack ? info.stack.slice() : [];
    return this;
  }

  private setState(state) {
    if (!state || this.state === state) {
      return;
    }
    this.state = state;
    const info = this.states[state];
    this.groups = info.groups;
    this.error = info.error;
    this.regexp = info.regexp;
    this.fast = info.fast;
  }

  private popState() {
    this.setState(this.stack.pop());
  }

  private pushState(state) {
    this.stack.push(this.state);
    this.setState(state);
  }

  private getGroup(match) {
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

  // 迭代获取下一个 token
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

    if (error.fallback && match.index !== index) {
      this.queuedGroup = group;
      this.queuedText = text;
      return this.getToken(error, buffer.slice(index, match.index), index);
    }

    return this.getToken(group, text, index);
  }

  private getToken(group, text, offset) {
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

  // 增加迭代器
  [Symbol.iterator]() {
    return {
      next: (): IteratorResult<T> => {
        const token = this.next();
        return { value: token, done: !token } as IteratorResult<T>;
      }
    }
  }
}

export default Lexer;
