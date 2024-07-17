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

import utils from '../commonUtils/utils';
import { HeaderMatcher } from '../../types/types';

// 解析类似“key=value”格式的字符串，并将解析结果以对象的形式返回
export function parseKeyValuePairs(str: string): Record<string, any> {
  const parsedObj: Record<string, any> = {};
  const matcher = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;

  let match: RegExpExecArray | null;
  while ((match = matcher.exec(str))) {
    const [, key, value] = match;
    parsedObj[key?.trim()] = value?.trim();
  }

  return parsedObj;
}

function processValueByParser(key: string, value: any, parser?: HeaderMatcher): any {
  if (!parser) {
    return value;
  }
  if (parser === true) {
    return parseKeyValuePairs(value);
  }
  if (utils.checkFunction(parser)) {
    return (parser as (value: any, key: string) => any)(value, key);
  }
  if (utils.checkRegExp(parser)) {
    return (parser as RegExp).exec(value)?.filter(item => item !== undefined);
  }

  throw new TypeError('parser is not correct!');
}

export default processValueByParser;
