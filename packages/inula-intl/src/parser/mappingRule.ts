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

const body: Record<string, any> = {
  doubleapos: { match: "''", value: () => "'" },
  quoted: {
    lineBreaks: true,
    match: /'[{}#](?:[^]*?[^'])?'(?!')/u, // 用以匹配单引号、花括号{}以及井号# 如'Hello' 、{name}、{}#
    value: (src: string) => src.slice(1, -1).replace(/''/g, "'"),
  },
  argument: {
    lineBreaks: true,

    // 用于匹配{name、{Hello{World，匹配{ }花括号中有任何Unicode字符，如空格、制表符等
    match: /\{\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*/u,
    push: 'arg',
    value: (src: string) => src.substring(1).trim(),
  },
  octothorpe: '#',
  end: { match: '}', pop: 1 },
  content: {
    lineBreaks: true,
    match: /[^][^{}#]*/u, // 主要匹配不包含[]任何字符（除了换行符）、不包含{}、#的任何个字符
  },
};

const arg: Record<string, any> = {
  select: {
    lineBreaks: true,
    match: /,\s*(?:plural|select|selectordinal)\s*,\s*/u, // 匹配内容包含 plural、select 或 selectordinal
    next: 'select', // 继续解析下一个参数
    value: (src: string) => src.split(',')[1].trim(), // 提取第二个参数，并处理收尾空格
  },
  'func-args': {
    // 匹配是否包含其他非特殊字符的参数,匹配结果包含特殊字符，如param1, param2, param3
    lineBreaks: true,
    match: /,\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*,/u,
    next: 'body',
    value: (src: string) => src.split(',')[1].trim(), // 参数字符串去除逗号并去除首尾空格
  },
  'func-simple': {
    // 匹配是否包含其他简单参数，匹配结果不包含标点符号：param1 param2 param3
    lineBreaks: true,
    match: /,\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*/u,
    value: (src: string) => src.substring(1).trim(),
  },
  end: { match: '}', pop: 1 },
};

const select: Record<string, any> = {
  offset: {
    lineBreaks: true,
    match: /\s*offset\s*:\s*\d+\s*/u, // 匹配message中是否包含偏移量offest信息
    value: (src: string) => src.split(':')[1].trim(),
  },
  case: {
    // 检查匹配该行是否包含分支信息。
    lineBreaks: true,

    // 设置规则匹配以左大括号 { 结尾的字符串，以等号 = 后跟数字开头的字符串，或者以非特殊符号和非空白字符开头的字符串，如 '=1 {'
    match: /\s*(?:=\d+|[^\p{Pat_Syn}\p{Pat_WS}]+)\s*\{/u,
    push: 'body', // 匹配成功，则会push到body栈中
    value: (src: string) => src.substring(0, src.indexOf('{')).trim(),
  },
  end: { match: /\s*\}/u, pop: 1 },
};

export const mappingRule: Record<string, any> = {
  body,
  arg,
  select,
};
