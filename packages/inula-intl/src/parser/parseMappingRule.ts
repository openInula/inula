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

import Lexer from './Lexer';
import { mappingRule } from './mappingRule';
import ruleUtils from '../utils/parseRuleUtils';
import { RawToken } from '../types/types';

const defaultErrorRule = ruleUtils.getRuleOptions('error', { lineBreaks: true, shouldThrow: true });

// 解析规则并生成词法分析器所需的数据结构，以便进行词法分析操作
function parseRules(rules: Record<string, any>, hasStates: boolean): Record<string, any> {
  let errorRule: Record<string, any> | null = null;
  const fast: Record<string, unknown> = {};
  let enableFast = true;
  let unicodeFlag: boolean | null = null;
  const groups: Record<string, any>[] = [];
  const parts: string[] = [];

  // 检查是否存在 fallback 规则，若存在则禁用快速匹配
  enableFast = isExistsFallback(rules, enableFast);

  for (let i = 0; i < rules.length; i++) {
    const options = rules[i];
    if (options.include) {
      throw new Error('Inheritance is not allowed in stateless lexers!');
    }

    errorRule = isOptionsErrorOrFallback(options, errorRule);

    const match = options.match.slice();
    if (enableFast) {
      // 如果快速匹配允许，则将单字符的规则存入 fast 对象
      processFast(match, fast, options);
    }

    // 检查规则中是否存在不适当的状态切换选项
    if (options.pop || options.push || options.next) {
      checkStateOptions(hasStates, options);
    }
    // 只有具有 .match 的规则才会被包含在正则表达式中
    if (match.length === 0) {
      continue;
    }
    enableFast = false;

    groups.push(options);

    // 检查是否所有规则都使用了 unicode 标志，或者都未使用
    unicodeFlag = checkUnicode(match, unicodeFlag, options);

    const pat = ruleUtils.getRegUnion(match.map(ruleUtils.getReg));
    const regexp = new RegExp(pat);
    if (regexp.test('')) {
      throw new Error('The regex matched the empty string!');
    }
    const groupCount = ruleUtils.getRegGroups(pat);
    if (groupCount > 0) {
      throw new Error('The regular expression uses capture groups, use (?: … ) instead!');
    }

    // 检测规则是否匹配换行符
    if (!options.lineBreaks && regexp.test('\n')) {
      throw new Error('The matching rule must contain lineBreaks.');
    }

    parts.push(ruleUtils.getRegCapture(pat));
  }

  // 如果没有 fallback 规则，则使用 sticky 标志，只在当前索引位置寻找匹配项，如果不支持 sticky 标志，则使用无法被否定的空模式来模拟
  const fallbackRule = errorRule && errorRule.fallback;
  let flags = ruleUtils.checkSticky() && !fallbackRule ? 'ym' : 'gm';
  const suffix = ruleUtils.checkSticky() || fallbackRule ? '' : '|';

  if (unicodeFlag === true) {
    flags += 'u';
  }
  const combined = new RegExp(ruleUtils.getRegUnion(parts) + suffix, flags);

  return {
    regexp: combined,
    groups: groups,
    fast: fast,
    error: errorRule || defaultErrorRule,
  };
}

export function checkStateGroup(group: Record<string, any>, name: string, map: Record<string, any>) {
  const state = group && (group.push || group.next);
  if (state && !map[state]) {
    throw new Error('The state is missing.');
  }
  if (group && group.pop && +group.pop !== 1) {
    throw new Error('The value of pop must be 1.');
  }
}

// 将国际化解析规则注入分词器中
function parseMappingRule(mappingRule: Record<string, any>, startState?: string): Lexer<RawToken> {
  const keys = Object.getOwnPropertyNames(mappingRule);

  if (!startState) {
    startState = keys[0];
  }

  // 将每个状态的规则解析为规则数组，并存储在 ruleMap 对象中
  const ruleMap = keys.reduce((map, key) => {
    map[key] = ruleUtils.getRules(mappingRule[key]);
    return map;
  }, {});

  // 处理规则中的 include 声明，将被包含的规则添加到相应的状态中
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const rules = ruleMap[key];
    const included = {};

    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j];
      if (!rule.include) {
        continue;
      }

      const splice = [j, 1];
      if (rule.include !== key && !included[rule.include]) {
        included[rule.include] = true;
        const newRules = ruleMap[rule.include];

        if (!newRules) {
          throw new Error('Cannot contain a state that does not exist!');
        }

        newRules.forEach(newRule => {
          if (!rules.includes(newRule)) {
            splice.push(newRule);
          }
        });
      }
      // eslint-disable-next-line
      rules.splice.apply(rules, splice);
      j--;
    }
  }

  const mappingAllRules = {};

  // 将规则映射为词法分析器数据结构，并存储在 mappingAllRules 对象中
  keys.forEach(key => {
    mappingAllRules[key] = parseRules(ruleMap[key], true);
  });

  // 检查状态组中的规则是否正确引用了其他状态
  keys.forEach(name => {
    const state = mappingAllRules[name];
    const groups = state.groups;
    groups.forEach(group => {
      checkStateGroup(group, name, mappingAllRules);
    });
    const fastKeys = Object.getOwnPropertyNames(state.fast);
    fastKeys.forEach(fastKey => {
      checkStateGroup(state.fast[fastKey], name, mappingAllRules);
    });
  });

  return new Lexer(mappingAllRules, startState);
}

function processFast(match, fast: Record<string, unknown>, options) {
  while (match.length && typeof match[0] === 'string' && match[0].length === 1) {
    const word = match.shift();
    fast[word.charCodeAt(0)] = options;
  }
}

function handleErrorRule(options, errorRule: Record<string, any>) {
  if (!options.fallback === !errorRule.fallback) {
    throw new Error('errorRule can only set one!');
  } else {
    throw new Error('fallback and error cannot be set at the same time!');
  }
}

function checkUnicode(match, unicodeFlag, options) {
  for (let j = 0; j < match.length; j++) {
    const obj = match[j];
    if (!ruleUtils.checkRegExp(obj)) {
      continue;
    }

    if (unicodeFlag === null) {
      unicodeFlag = obj.unicode;
    } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
      throw new Error('If the /u flag is used, all!');
    }
  }
  return unicodeFlag;
}

function checkStateOptions(hasStates: boolean, options) {
  if (!hasStates) {
    throw new Error('State toggle options are not allowed in stateless tokenizers!');
  }
  if (options.fallback) {
    throw new Error('State toggle options are not allowed on fallback tokens!');
  }
}

function isExistsFallback(rules: Record<string, any>, enableFast: boolean) {
  for (let i = 0; i < rules.length; i++) {
    if (rules[i].fallback) {
      enableFast = false;
    }
  }
  return enableFast;
}

function isOptionsErrorOrFallback(options, errorRule: Record<string, any> | null) {
  if (options.error || options.fallback) {
    // 只能设置一个 errorRule
    if (errorRule) {
      handleErrorRule(options, errorRule);
    }
    errorRule = options;
  }
  return errorRule;
}

export const lexer = parseMappingRule(mappingRule);

export default parseMappingRule;
