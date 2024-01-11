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

import { Matched, Params } from './parser';

export type Token = {
  type: TokenType;
  value: string;
};

export enum TokenType {
  Delimiter = 'delimiter',
  Static = 'static',
  Param = 'param',
  WildCard = 'wildcard',
  LBracket = '(',
  RBracket = ')',
  Pattern = 'pattern',
}

export interface Parser<P> {
  regexp: RegExp;

  keys: string[];

  parse(url: string): Matched<P> | null;

  compile(params: Params<P>): string;
}

export type ParserOption = {
  // 是否大小写敏感
  caseSensitive?: boolean;
  // 是否启用严格模式
  strictMode?: boolean;
  // 精准匹配
  exact?: boolean;
};

type ClearLeading<U extends string> = U extends `/${infer R}` ? ClearLeading<R> : U;
type ClearTailing<U extends string> = U extends `${infer L}/` ? ClearTailing<L> : U;

type ParseParam<Param extends string> = Param extends `:${infer R}`
  ? {
      [K in R]: string;
    }
  : {};

type MergeParams<OneParam extends Record<string, any>, OtherParam extends Record<string, any>> = {
  readonly [Key in keyof OneParam | keyof OtherParam]?: string;
};

type ParseURLString<Str extends string> = Str extends `${infer Param}/${infer Rest}`
  ? MergeParams<ParseParam<Param>, ParseURLString<ClearLeading<Rest>>>
  : ParseParam<Str>;

// 解析URL中的动态参数，以实现TypeScript提示功能
export type GetURLParams<U extends string> = ParseURLString<ClearLeading<ClearTailing<U>>>;
