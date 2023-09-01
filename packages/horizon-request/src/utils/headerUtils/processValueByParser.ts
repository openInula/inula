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
    return (parser as Function)(value, key);
  }
  if (utils.checkRegExp(parser)) {
    return (parser as RegExp).exec(value)?.filter(item => item !== undefined);
  }

  throw new TypeError('parser is not correct!');
}

export default processValueByParser;
