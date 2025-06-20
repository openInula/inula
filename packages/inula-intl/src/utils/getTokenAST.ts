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

/**
 * 将parse后的Token数组针对不同的匀速类型进行处理
 */
enum TokenType {
  octothorpe = 'OCTOTHORPE',
  argument = 'ARGUMENT',
  function = 'FUNCTION',
}

const processToken = token => {
  if (typeof token === 'string') {
    return token;
  } else if (TokenType[token.type] === 'OCTOTHORPE') {
    // token为符号
    return '#';
  } else if (TokenType[token.type] === 'ARGUMENT') {
    // token为变量
    return [token.arg];
  } else if (TokenType[token.type] === 'FUNCTION') {
    // token为函数方法
    const _param = token.param && token.param.tokens[0];
    const param = typeof _param === 'string' ? _param.trim() : _param;
    return [token.arg, token.key, param].filter(Boolean);
  }

  const offset = token.offset ? parseInt(token.offset) : undefined;

  const tempFormatProps = {};
  token.cases.forEach(item => {
    tempFormatProps[item.key] = getTokenAST(item.tokens);
  });

  const mergedProps = Object.assign({}, { offset }, tempFormatProps);

  return [token.arg, token.type, mergedProps];
};

function getTokenAST(tokens) {
  if (!Array.isArray(tokens)) {
    return tokens.join('');
  }
  return tokens.map(token => processToken(token));
}

export default getTokenAST;
