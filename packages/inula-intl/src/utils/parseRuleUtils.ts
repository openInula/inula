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

function getType(input: any): string {
  const str: string = Object.prototype.toString.call(input);
  return str.slice(8, -1).toLowerCase();
}

// 类型检查器
const createTypeChecker = (type: string) => {
  return (input: any) => {
    return getType(input) === type.toLowerCase();
  };
};

const checkObject = (input: any) => input !== null && typeof input === 'object';

const checkRegExp = createTypeChecker('RegExp');

// 使用正则表达式，如果对象存在则访问该属性，用来判断当前环境是否支持正则表达式sticky属性。
const checkSticky = () => typeof new RegExp('')?.sticky === 'boolean';

// 转义正则表达式中的特殊字符
function transferReg(str: string): string {
  // eslint-disable-next-line
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// 计算正则表达式中捕获组的数量，用以匹配（）
function getRegGroups(str: string): number {
  const regExp = new RegExp('|' + str);
  // eslint-disable-next-line
  return regExp.exec('')?.length! - 1;
}

// 创建一个捕获组的正则表达式模式
function getRegCapture(str: string): string {
  return '(' + str + ')';
}

// 将正则表达式合并为一个联合的正则表达式模式
function getRegUnion(regexps: string[]): string {
  if (!regexps.length) {
    return '(?!)';
  }
  const source = regexps.map(str => '(?:' + str + ')').join('|');
  return '(?:' + source + ')';
}

function getReg(input: string | Record<string, any>): string {
  if (typeof input === 'string') {
    return '(?:' + transferReg(input) + ')';
  } else if (checkRegExp(input) || checkObject(input)) {
    if (input.ignoreCase) {
      throw new Error('/i prohibition sign');
    }
    if (input.global) {
      throw new Error('/g prohibition sign');
    }
    if (input.sticky) {
      throw new Error('/y prohibition sign');
    }
    if (input.multiline) {
      throw new Error('/m prohibition sign');
    }
    return input.source;
  } else {
    throw new Error(`${input}Non-conformance to specifications!`);
  }
}

function getRulesByObject(object: Record<string, any>) {
  const keys = Object.getOwnPropertyNames(object);

  // 存储最终的规则数组
  const result: any[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const thing = object[key];

    // 将属性值转换为规则数组
    const rules = [].concat(thing);

    // 如果属性名为 'include'，表示需要包含其他规则
    if (key === 'include') {
      for (let j = 0; j < rules.length; j++) {
        result.push({ include: rules[j] });
      }
      continue;
    }

    // 用于保存当前规则的匹配模式
    let match = [];
    rules.forEach(function (rule) {
      if (checkObject(rule)) {
        // 如果规则是一个对象，表示具有选项设置，添加该规则到结果数组中，并重置匹配模式数组
        if (match.length) result.push(getRuleOptions(key, match));
        result.push(getRuleOptions(key, rule));
        match = [];
      } else {
        match.push(rule);
      }
    });

    // 如果匹配模式数组中还有剩余的匹配模式，创建规则对象并添加到结果数组中
    if (match.length) result.push(getRuleOptions(key, match));
  }
  return result;
}

function getRulesByArray(array: any[]) {
  const result: any[] = [];

  for (let i = 0; i < array.length; i++) {
    const obj = array[i];

    // 如果元素具有 'include' 属性，表示需要包含其他规则
    if (obj.include) {
      const include = [].concat(obj.include);
      for (let j = 0; j < include.length; j++) {
        result.push({ include: include[j] });
      }
      continue;
    }

    if (!obj.type) {
      throw new Error('The rule does not have the type attribute.');
    }
    result.push(getRuleOptions(obj.type, obj));
  }

  return result;
}

function getRuleOptions(type: any, obj: any) {
  // 如果 obj 不是一个对象，则将其转换为包含 'match' 属性的对象
  if (!checkObject(obj)) {
    obj = { match: obj };
  }

  // 如果 obj 包含 'include' 属性，则抛出错误，因为匹配规则不能包含状态
  if (obj.include) {
    throw new Error('The matching rule cannot contain the status!');
  }

  // 创建默认的选项对象，初始化各个选项属性
  const options: Record<string, any> = {
    defaultType: type,
    lineBreaks: !!obj.error || !!obj.fallback,
    pop: false,
    next: null,
    push: null,
    error: false,
    fallback: false,
    value: null,
    type: null,
    shouldThrow: false,
  };

  Object.assign(options, obj);

  if (typeof options.type === 'string' && type !== options.type) {
    throw new Error('The type attribute cannot be a string.');
  }

  const match = options.match;
  if (Array.isArray(match)) {
    options.match = match;
  } else if (match) {
    options.match = [match];
  } else {
    options.match = [];
  }
  options.match.sort((str1: string, str2: string) => {
    // 根据规则的类型进行排序，确保正则表达式排在最前面，长度较长的规则排在前面
    if (checkRegExp(str1) && checkRegExp(str2)) {
      return 0;
    } else if (checkRegExp(str2)) {
      return -1;
    } else if (checkRegExp(str1)) {
      return +1;
    } else {
      return str2.length - str1.length;
    }
  });

  return options;
}

function getRules(spec: any) {
  return Array.isArray(spec) ? getRulesByArray(spec) : getRulesByObject(spec);
}

const ruleUtils = {
  checkObject,
  checkRegExp,
  transferReg,
  checkSticky,
  getRegGroups,
  getRegCapture,
  getRegUnion,
  getReg,
  getRulesByObject,
  getRulesByArray,
  getRuleOptions,
  getRules,
};

export default ruleUtils;
