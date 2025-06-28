'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var horizon = require('@cloudsop/horizon');
var jsxRuntime = require('@cloudsop/horizon/jsx-runtime');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : String(i);
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

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
 * 缓存机制
 */
function creatI18nCache() {
  return {
    dateTimeFormat: {},
    numberFormat: {},
    plurals: {},
    select: {},
    octothorpe: {}
  };
}

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

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

function getType(input) {
  var str = Object.prototype.toString.call(input);
  return str.slice(8, -1).toLowerCase();
}

// 类型检查器
var createTypeChecker = function (type) {
  return function (input) {
    return getType(input) === type.toLowerCase();
  };
};
var checkObject = function (input) {
  return input !== null && typeof input === 'object';
};
var checkRegExp = createTypeChecker('RegExp');

// 使用正则表达式，如果对象存在则访问该属性，用来判断当前环境是否支持正则表达式sticky属性。
var checkSticky = function () {
  var _RegExp;
  return typeof ((_RegExp = new RegExp('')) === null || _RegExp === void 0 ? void 0 : _RegExp.sticky) === 'boolean';
};

// 转义正则表达式中的特殊字符
function transferReg(str) {
  // eslint-disable-next-line
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// 计算正则表达式中捕获组的数量，用以匹配（）
function getRegGroups(str) {
  var _regExp$exec;
  var regExp = new RegExp('|' + str);
  // eslint-disable-next-line
  return ((_regExp$exec = regExp.exec('')) === null || _regExp$exec === void 0 ? void 0 : _regExp$exec.length) - 1;
}

// 创建一个捕获组的正则表达式模式
function getRegCapture(str) {
  return '(' + str + ')';
}

// 将正则表达式合并为一个联合的正则表达式模式
function getRegUnion(regexps) {
  if (!regexps.length) {
    return '(?!)';
  }
  var source = regexps.map(function (str) {
    return '(?:' + str + ')';
  }).join('|');
  return '(?:' + source + ')';
}
function getReg(input) {
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
    throw new Error(input + "Non-conformance to specifications!");
  }
}
function getRulesByObject(object) {
  var keys = Object.getOwnPropertyNames(object);

  // 存储最终的规则数组
  var result = [];
  var _loop = function () {
    var key = keys[i];
    var thing = object[key];

    // 将属性值转换为规则数组
    var rules = [].concat(thing);

    // 如果属性名为 'include'，表示需要包含其他规则
    if (key === 'include') {
      for (var j = 0; j < rules.length; j++) {
        result.push({
          include: rules[j]
        });
      }
      return 1; // continue
    }

    // 用于保存当前规则的匹配模式
    var match = [];
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
  };
  for (var i = 0; i < keys.length; i++) {
    if (_loop()) continue;
  }
  return result;
}
function getRulesByArray(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var obj = array[i];

    // 如果元素具有 'include' 属性，表示需要包含其他规则
    if (obj.include) {
      var include = [].concat(obj.include);
      for (var j = 0; j < include.length; j++) {
        result.push({
          include: include[j]
        });
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
function getRuleOptions(type, obj) {
  // 如果 obj 不是一个对象，则将其转换为包含 'match' 属性的对象
  if (!checkObject(obj)) {
    obj = {
      match: obj
    };
  }

  // 如果 obj 包含 'include' 属性，则抛出错误，因为匹配规则不能包含状态
  if (obj.include) {
    throw new Error('The matching rule cannot contain the status!');
  }

  // 创建默认的选项对象，初始化各个选项属性
  var options = {
    defaultType: type,
    lineBreaks: !!obj.error || !!obj.fallback,
    pop: false,
    next: null,
    push: null,
    error: false,
    fallback: false,
    value: null,
    type: null,
    shouldThrow: false
  };
  _extends(options, obj);
  if (typeof options.type === 'string' && type !== options.type) {
    throw new Error('The type attribute cannot be a string.');
  }
  var match = options.match;
  if (Array.isArray(match)) {
    options.match = match;
  } else if (match) {
    options.match = [match];
  } else {
    options.match = [];
  }
  options.match.sort(function (str1, str2) {
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
function getRules(spec) {
  return Array.isArray(spec) ? getRulesByArray(spec) : getRulesByObject(spec);
}
var ruleUtils = {
  checkObject: checkObject,
  checkRegExp: checkRegExp,
  transferReg: transferReg,
  checkSticky: checkSticky,
  getRegGroups: getRegGroups,
  getRegCapture: getRegCapture,
  getRegUnion: getRegUnion,
  getReg: getReg,
  getRulesByObject: getRulesByObject,
  getRulesByArray: getRulesByArray,
  getRuleOptions: getRuleOptions,
  getRules: getRules
};

/**
 * 词法解析器，主要根据设计的规则对message进行处理成Token
 */
var Lexer = /*#__PURE__*/function () {
  function Lexer(unionReg, startState) {
    _classCallCheck(this, Lexer);
    this.startState = void 0;
    this.unionReg = void 0;
    this.buffer = '';
    this.stack = [];
    this.index = 0;
    this.line = 1;
    this.col = 1;
    this.queuedText = '';
    this.state = '';
    this.groups = [];
    this.error = void 0;
    this.regexp = void 0;
    this.fast = {};
    this.queuedGroup = '';
    this.value = '';
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
  _createClass(Lexer, [{
    key: "reset",
    value: function reset(data) {
      this.buffer = data || '';
      this.index = 0;
      this.line = 1;
      this.col = 1;
      this.queuedText = '';
      this.setState(this.startState);
      this.stack = [];
      return this;
    }
  }, {
    key: "setState",
    value: function setState(state) {
      if (!state || this.state === state) {
        return;
      }
      this.state = state;
      var info = this.unionReg[state];
      this.groups = info.groups;
      this.error = info.error;
      this.regexp = info.regexp;
      this.fast = info.fast;
    }
  }, {
    key: "popState",
    value: function popState() {
      this.setState(this.stack.pop());
    }
  }, {
    key: "pushState",
    value: function pushState(state) {
      this.stack.push(this.state);
      this.setState(state);
    }
  }, {
    key: "getGroup",
    value: function getGroup(match) {
      var groupCount = this.groups.length;
      for (var i = 0; i < groupCount; i++) {
        if (match[i + 1] !== undefined) {
          return this.groups[i];
        }
      }
      throw new Error('No token type found matching text!');
    }
  }, {
    key: "tokenToString",
    value: function tokenToString() {
      return this.value;
    }

    /**
     * 迭代获取下一个 token
     */
  }, {
    key: "next",
    value: function next() {
      var index = this.index;
      if (this.queuedGroup) {
        var token = this.getToken(this.queuedGroup, this.queuedText, index);
        this.queuedGroup = null;
        this.queuedText = '';
        return token;
      }
      var buffer = this.buffer;
      if (index === buffer.length) {
        return;
      }
      var fastGroup = this.fast[buffer.charCodeAt(index)];
      if (fastGroup) {
        return this.getToken(fastGroup, buffer.charAt(index), index);
      }

      // 如果没有快速匹配，那么使用预先编译的正则表达式进行匹配操作
      var regexp = this.regexp;
      regexp.lastIndex = index;
      var match = getMatch(regexp, buffer);
      var error = this.error;
      if (match == null) {
        return this.getToken(error, buffer.slice(index, buffer.length), index);
      }
      var group = this.getGroup(match);
      var text = match[0];
      if (error !== null && error !== void 0 && error.fallback && match.index !== index) {
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
  }, {
    key: "getToken",
    value: function getToken(group, text, offset) {
      var lineNum = 0;
      var last = 1; // 最后一个换行符的索引位置
      if (group.lineBreaks) {
        var matchNL = /\n/g;
        if (text === '\n') {
          lineNum = 1;
        } else {
          while (matchNL.exec(text)) {
            lineNum++;
            last = matchNL.lastIndex;
          }
        }
      }
      var token = {
        type: typeof group.type === 'function' && group.type(text) || group.defaultType,
        value: typeof group.value === 'function' ? group.value(text) : text,
        text: text,
        toString: this.tokenToString,
        offset: offset,
        // 标记在输入 buffer 中的偏移量
        lineBreaks: lineNum,
        line: this.line,
        // token 所在的行号
        col: this.col // token 所在的列号
      };
      var size = text.length;
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
  }, {
    key: Symbol.iterator,
    value: function () {
      var _this = this;
      return {
        next: function () {
          var token = _this.next();
          return {
            value: token,
            done: !token
          };
        }
      };
    }
  }]);
  return Lexer;
}();
/**
 * 根据正则表达式，获取匹配到message的值
 * 索引为 0 的元素是完整的匹配结果。
 * 索引为 1、2、3 等的元素是正则表达式中指定的捕获组的匹配结果。
 */
var getMatch = ruleUtils.checkSticky() ?
// 正则表达式具有 sticky 标志
function (regexp, buffer) {
  return regexp.exec(buffer);
} :
// 正则表达式具有 global 标志,匹配的字符串长度为 0，则表示匹配失败
function (regexp, buffer) {
  return regexp.exec(buffer)[0].length === 0 ? null : regexp.exec(buffer);
};

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

var body = {
  doubleapos: {
    match: "''",
    value: function () {
      return "'";
    }
  },
  quoted: {
    lineBreaks: true,
    match: /'[{}#](?:[^]*?[^'])?'(?!')/u,
    // 用以匹配单引号、花括号{}以及井号# 如'Hello' 、{name}、{}#
    value: function (src) {
      return src.slice(1, -1).replace(/''/g, "'");
    }
  },
  argument: {
    lineBreaks: true,
    // 用于匹配{name、{Hello{World，匹配{ }花括号中有任何Unicode字符，如空格、制表符等
    match: /\{\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*/u,
    push: 'arg',
    value: function (src) {
      return src.substring(1).trim();
    }
  },
  octothorpe: '#',
  end: {
    match: '}',
    pop: 1
  },
  content: {
    lineBreaks: true,
    match: /[^][^{}#]*/u // 主要匹配不包含[]任何字符（除了换行符）、不包含{}、#的任何个字符
  }
};
var arg = {
  select: {
    lineBreaks: true,
    match: /,\s*(?:plural|select|selectordinal)\s*,\s*/u,
    // 匹配内容包含 plural、select 或 selectordinal
    next: 'select',
    // 继续解析下一个参数
    value: function (src) {
      return src.split(',')[1].trim();
    } // 提取第二个参数，并处理收尾空格
  },
  'func-args': {
    // 匹配是否包含其他非特殊字符的参数,匹配结果包含特殊字符，如param1, param2, param3
    lineBreaks: true,
    match: /,\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*,/u,
    next: 'body',
    value: function (src) {
      return src.split(',')[1].trim();
    } // 参数字符串去除逗号并去除首尾空格
  },
  'func-simple': {
    // 匹配是否包含其他简单参数，匹配结果不包含标点符号：param1 param2 param3
    lineBreaks: true,
    match: /,\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*/u,
    value: function (src) {
      return src.substring(1).trim();
    }
  },
  end: {
    match: '}',
    pop: 1
  }
};
var select = {
  offset: {
    lineBreaks: true,
    match: /\s*offset\s*:\s*\d+\s*/u,
    // 匹配message中是否包含偏移量offest信息
    value: function (src) {
      return src.split(':')[1].trim();
    }
  },
  case: {
    // 检查匹配该行是否包含分支信息。
    lineBreaks: true,
    // 设置规则匹配以左大括号 { 结尾的字符串，以等号 = 后跟数字开头的字符串，或者以非特殊符号和非空白字符开头的字符串，如 '=1 {'
    match: /\s*(?:=\d+|[^\p{Pat_Syn}\p{Pat_WS}]+)\s*\{/u,
    push: 'body',
    // 匹配成功，则会push到body栈中
    value: function (src) {
      return src.substring(0, src.indexOf('{')).trim();
    }
  },
  end: {
    match: /\s*\}/u,
    pop: 1
  }
};
var mappingRule = {
  body: body,
  arg: arg,
  select: select
};

var STICKY_FLAG = 'ym';
var GLOBAL_FLAG = 'gm';
var VERTICAL_LINE = '|';
var UNICODE_FLAG = 'u';
var STATE_GROUP_START_INDEX = 1;
// Inula 需要被保留静态常量
var INULA_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};

// JavaScript 需要被保留原生静态属性
var NATIVE_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};

// Inula ForwardRef 组件的静态属性需要被保留
var INULA_FORWARD_REF_STATICS = {
  vtype: true,
  render: true,
  defaultProps: true,
  key: true,
  type: true
};

// React ForwardRef 组件的静态属性需要被保留
var REACT_FORWARD_REF_STATICS = {
  $$typeof: true,
  // inula 'vtype': true
  render: true,
  // render
  defaultProps: true,
  // props
  displayName: true,
  propTypes: true // type: type,
};
_extends({}, INULA_FORWARD_REF_STATICS, REACT_FORWARD_REF_STATICS);

// Inula Memo 组件的静态属性需要被保留
var INULA_MEMO_STATICS = {
  vtype: true,
  // inula 'vtype': true
  compare: true,
  defaultProps: true,
  type: true
};

// 默认复数规则
var DEFAULT_PLURAL_KEYS = ['zero', 'one', 'two', 'few', 'many', 'other'];
var voidElementTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'menuitem'];

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

var defaultErrorRule = ruleUtils.getRuleOptions('error', {
  lineBreaks: true,
  shouldThrow: true
});

// 解析规则并生成词法分析器所需的数据结构，以便进行词法分析操作
function parseRules(rules, hasStates) {
  var errorRule = null;
  var fast = {};
  var enableFast = true;
  var unicodeFlag = null;
  var groups = [];
  var parts = [];

  // 检查是否存在 fallback 规则，若存在则禁用快速匹配
  enableFast = isExistsFallback(rules, enableFast);
  for (var i = 0; i < rules.length; i++) {
    var options = rules[i];
    if (options.include) {
      throw new Error('Inheritance is not allowed in stateless lexers!');
    }
    errorRule = isOptionsErrorOrFallback(options, errorRule);
    var match = options.match.slice();
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

    // 检查是否所有规则都使用了unicode，或者都未使用
    unicodeFlag = checkUnicode(match, unicodeFlag, options);
    var pat = ruleUtils.getRegUnion(match.map(ruleUtils.getReg));
    var regexp = new RegExp(pat);
    if (regexp.test('')) {
      throw new Error('The regex matched the empty string!');
    }
    var groupCount = ruleUtils.getRegGroups(pat);
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
  var fallbackRule = errorRule && errorRule.fallback;
  var flags = ruleUtils.checkSticky() && !fallbackRule ? STICKY_FLAG : GLOBAL_FLAG;
  var suffix = ruleUtils.checkSticky() || fallbackRule ? '' : VERTICAL_LINE;
  if (unicodeFlag === true) {
    flags += UNICODE_FLAG;
  }
  var combined = new RegExp(ruleUtils.getRegUnion(parts) + suffix, flags);
  return {
    regexp: combined,
    groups: groups,
    fast: fast,
    error: errorRule || defaultErrorRule
  };
}
function checkStateGroup(group, name, mappingRules) {
  var state = group && (group.push || group.next);
  if (state && !mappingRules[state]) {
    throw new Error('The state is missing.');
  }
  if (group && group.pop && +group.pop !== STATE_GROUP_START_INDEX) {
    throw new Error('The value of pop must be 1.');
  }
}

// 将国际化解析规则注入分词器中
function parseMappingRule(mappingRule, startState) {
  var keys = Object.getOwnPropertyNames(mappingRule);
  if (!startState) {
    startState = keys[0];
  }

  // 将每个状态的规则解析为规则数组，并存储在 ruleMap 对象中
  var ruleMap = keys.reduce(function (map, key) {
    map[key] = ruleUtils.getRules(mappingRule[key]);
    return map;
  }, {});

  // 处理规则中的 include 声明，将被包含的规则添加到相应的状态中
  var _loop = function () {
    var key = keys[i];
    var rules = ruleMap[key];
    var included = {};
    var _loop2 = function (_j) {
      var rule = rules[_j];
      if (!rule.include) {
        j = _j;
        return 1; // continue
      }
      var splice = [_j, STATE_GROUP_START_INDEX];
      if (rule.include !== key && !included[rule.include]) {
        included[rule.include] = true;
        var newRules = ruleMap[rule.include];
        if (!newRules) {
          throw new Error('Cannot contain a state that does not exist!');
        }
        newRules.forEach(function (newRule) {
          if (!rules.includes(newRule)) {
            splice.push(newRule);
          }
        });
      }
      // eslint-disable-next-line
      rules.splice.apply(rules, splice);
      _j--;
      j = _j;
    };
    for (var j = 0; j < rules.length; j++) {
      if (_loop2(j)) continue;
    }
  };
  for (var i = 0; i < keys.length; i++) {
    _loop();
  }
  var mappingAllRules = {};

  // 将规则映射为词法分析器数据结构，并存储在 mappingAllRules 对象中
  keys.forEach(function (key) {
    mappingAllRules[key] = parseRules(ruleMap[key], true);
  });

  // 检查状态组中的规则是否正确引用了其他状态
  keys.forEach(function (name) {
    var state = mappingAllRules[name];
    var groups = state.groups;
    groups.forEach(function (group) {
      checkStateGroup(group, name, mappingAllRules);
    });
    var fastKeys = Object.getOwnPropertyNames(state.fast);
    fastKeys.forEach(function (fastKey) {
      checkStateGroup(state.fast[fastKey], name, mappingAllRules);
    });
  });

  // 将规则注入到词法解析器
  return new Lexer(mappingAllRules, startState);
}

/**
 * 快速匹配模式
 * @param match
 * @param fast
 * @param options
 */
function processFast(match) {
  var fast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = arguments.length > 2 ? arguments[2] : undefined;
  while (match.length && typeof match[0] === 'string' && match[0].length === 1) {
    // 获取到数组的第一个元素
    var word = match.shift();
    fast[word.charCodeAt(0)] = options;
  }
}

/**
 *  用以处理错误逻辑
 * @param options 操作属性
 * @param errorRule 错误规则
 */
function handleErrorRule(options, errorRule) {
  if (!options.fallback === !errorRule.fallback) {
    throw new Error('errorRule can only set one!');
  } else {
    throw new Error('fallback and error cannot be set at the same time!');
  }
}

/**
 * 用以检查message中是否包含Unicode
 * @param match 匹配到的message
 * @param unicodeFlag Unicode标志
 * @param options 操作属性
 */
function checkUnicode(match, unicodeFlag, options) {
  for (var j = 0; j < match.length; j++) {
    var obj = match[j];
    if (!ruleUtils.checkRegExp(obj)) {
      continue;
    }
    if (unicodeFlag === null) {
      unicodeFlag = obj.unicode;
    } else {
      if (unicodeFlag !== obj.unicode && options.fallback === false) {
        throw new Error('If the /u flag is used, all!');
      }
    }
  }
  return unicodeFlag;
}
function checkStateOptions(hasStates, options) {
  if (!hasStates) {
    throw new Error('State toggle options are not allowed in stateless tokenizers!');
  }
  if (options.fallback) {
    throw new Error('State toggle options are not allowed on fallback tokens!');
  }
}

/**
 * 检查是否存在fallback属性，用以来判断快速匹配规则
 * @param rules
 * @param enableFast
 */
function isExistsFallback(rules, enableFast) {
  for (var i = 0; i < rules.length; i++) {
    if (rules[i].fallback) {
      enableFast = false;
    }
  }
  return enableFast;
}
function isOptionsErrorOrFallback(options, errorRule) {
  if (options.error || options.fallback) {
    // 只能设置一个 errorRule
    if (errorRule) {
      handleErrorRule(options, errorRule);
    }
    errorRule = options;
  }
  return errorRule;
}
var lexer = parseMappingRule(mappingRule);

function _createForOfIteratorHelper$3(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray$3(r)) || e && r && "number" == typeof r.length) { t && (r = t); var n = 0, F = function () {}; return { s: F, n: function () { return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }; }, e: function (r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function () { t = t.call(r); }, n: function () { var r = t.next(); return a = r.done, r; }, e: function (r) { u = !0, o = r; }, f: function () { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray$3(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray$3(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$3(r, a) : void 0; } }
function _arrayLikeToArray$3(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 *  语法解析器，根据Token,获得具备上下文的AST
 */
var Parser = /*#__PURE__*/function () {
  function Parser(message) {
    _classCallCheck(this, Parser);
    this.cardinalKeys = DEFAULT_PLURAL_KEYS;
    this.ordinalKeys = DEFAULT_PLURAL_KEYS;
    lexer.reset(message);
  }
  _createClass(Parser, [{
    key: "isSelectKeyValid",
    value: function isSelectKeyValid(type, value) {
      if (value[0] === '=') {
        if (type === 'select') {
          throw new Error('The key value of the select type is invalid.');
        }
      } else if (type !== 'select') {
        var values = type === 'plural' ? this.cardinalKeys : this.ordinalKeys;
        if (values.length > 0 && !values.includes(value)) {
          throw new Error(type + " type key value is invalid.");
        }
      }
    }
  }, {
    key: "processSelect",
    value: function processSelect(_ref, isPlural, context, type) {
      var arg = _ref.value;
      var select = {
        type: type,
        arg: arg,
        cases: [],
        ctx: context
      };
      if (type === 'plural' || type === 'selectordinal') {
        isPlural = true;
      }
      var _iterator = _createForOfIteratorHelper$3(lexer),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var token = _step.value;
          switch (token.type) {
            case 'offset':
              {
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
            case 'case':
              {
                this.isSelectKeyValid(type, token.value);
                select.cases.push({
                  key: token.value.replace(/=/g, ''),
                  tokens: this.parse(isPlural),
                  ctx: getContext(token)
                });
                break;
              }
            case 'end':
              {
                return select;
              }
            default:
              {
                throw new Error("Unrecognized analyzer token: " + token.type);
              }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      throw new Error('The message end position is invalid.');
    }

    /**
     * 解析获得的Token
     * @param token
     * @param isPlural
     */
  }, {
    key: "parseToken",
    value: function parseToken(token, isPlural) {
      var context = getContext(token);
      var nextToken = lexer.next();
      if (!nextToken) {
        throw new Error('The message end position is invalid.');
      }
      context.text += nextToken.text;
      context.lineNum += nextToken.lineBreaks;
      switch (nextToken.type) {
        case 'end':
          {
            return {
              type: 'argument',
              arg: token.value,
              ctx: context
            };
          }
        case 'func-simple':
          {
            var end = lexer.next();
            if (!end) {
              throw new Error('The message end position is invalid.');
            }
            if (end.type !== 'end') {
              throw new Error("Unrecognized analyzer token: " + end.type);
            }
            context.text += end.text;
            if (checkSelectType(nextToken.value.toLowerCase())) {
              throw new Error("Invalid parameter type: " + nextToken.value);
            }
            return {
              type: 'function',
              arg: token.value,
              key: nextToken.value,
              ctx: context
            };
          }
        case 'func-args':
          {
            if (checkSelectType(nextToken.value.toLowerCase())) {
              throw new Error("Invalid parameter type: " + nextToken.value);
            }
            var param = this.parse(isPlural);
            return {
              type: 'function',
              arg: token.value,
              key: nextToken.value,
              param: param,
              ctx: context
            };
          }
        case 'select':
          if (checkSelectType(nextToken.value)) {
            return this.processSelect(token, isPlural, context, nextToken.value);
          } else {
            throw new Error("Invalid select type: " + nextToken.value);
          }
        default:
          throw new Error("Unrecognized analyzer token: " + nextToken.type);
      }
    }

    /**
     * 解析方法入口
     * 在根级别解析时，遇到结束符号即结束解析并返回结果；而在非根级别解析时，遇到结束符号会被视为不合法的结束位置，抛出错误
     * @param isPlural  标记复数
     * @param isRoot  标记根节点
     */
  }, {
    key: "parse",
    value: function parse(isPlural, isRoot) {
      var tokens = [];
      var content = null;
      var _iterator2 = _createForOfIteratorHelper$3(lexer),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var token = _step2.value;
          if (token.type === 'argument') {
            if (content) {
              content = null;
            }
            tokens.push(this.parseToken(token, isPlural));
          } else if (token.type === 'octothorpe' && isPlural) {
            if (content) {
              content = null;
            }
            tokens.push({
              type: 'octothorpe'
            });
          } else if (token.type === 'end' && !isRoot) {
            return tokens;
          } else if (token.type === 'doubleapos') {
            tokens.push(token.value);
          } else if (token.type === 'quoted') {
            tokens.push(token.value);
          } else if (token.type === 'content') {
            tokens.push(token.value);
          } else {
            var value = token.value;
            if (!isPlural && token.type === 'quoted' && value[0] === '#') {
              if (value.includes('{')) {
                throw new Error("Invalid template: " + value);
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
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      if (isRoot) {
        return tokens;
      }
      throw new Error('The message end position is invalid.');
    }
  }]);
  return Parser;
}();
/**
 * 获得 Token 的上下文
 * @param Token Token
 */
var getContext = function (Token) {
  return {
    offset: Token.offset,
    line: Token.line,
    col: Token.col,
    text: Token.text,
    lineNum: Token.lineBreaks
  };
};

// 用以检查select规则中的类型
var checkSelectType = function (value) {
  return value === 'plural' || value === 'select' || value === 'selectordinal';
};
function parse$1(message) {
  var parser = new Parser(message);
  return parser.parse(false, true);
}

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
var TokenType = /*#__PURE__*/function (TokenType) {
  TokenType["octothorpe"] = "OCTOTHORPE";
  TokenType["argument"] = "ARGUMENT";
  TokenType["function"] = "FUNCTION";
  return TokenType;
}(TokenType || {});
var processToken = function (token) {
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
    var _param = token.param && token.param.tokens[0];
    var param = typeof _param === 'string' ? _param.trim() : _param;
    return [token.arg, token.key, param].filter(Boolean);
  }
  var offset = token.offset ? parseInt(token.offset) : undefined;
  var tempFormatProps = {};
  token.cases.forEach(function (item) {
    tempFormatProps[item.key] = getTokenAST(item.tokens);
  });
  var mergedProps = _extends({}, {
    offset: offset
  }, tempFormatProps);
  return [token.arg, token.type, mergedProps];
};
function getTokenAST(tokens) {
  if (!Array.isArray(tokens)) {
    return tokens.join('');
  }
  return tokens.map(function (token) {
    return processToken(token);
  });
}

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

function isVariantI18n(i18n) {
  if (!i18n) {
    throw new Error('I18n object is not found!');
  }
}
function generateKey(locales, options, valueKey) {
  var localeKey = Array.isArray(locales) ? locales.sort().join('-') : locales;
  return localeKey + ":" + JSON.stringify(options !== null && options !== void 0 ? options : {}) + "_" + (valueKey !== null && valueKey !== void 0 ? valueKey : '');
}
function compile(message) {
  try {
    return getTokenAST(parse$1(message));
  } catch (e) {
    console.error("Message cannot be parse due to syntax errors: " + message + ",cause by " + e);
    return message;
  }
}
var utils = {
  isVariantI18n: isVariantI18n,
  generateKey: generateKey,
  compile: compile
};
function createI18nProps(source) {
  return {
    intl: source,
    locale: source.locale,
    messages: source.messages,
    defaultLocale: source.defaultLocale,
    timeZone: source.timeZone,
    onError: source.onError,
    formatMessage: source.formatMessage.bind(source),
    formatDate: source.formatDate ? source.formatDate.bind(source) : source.DateTimeFormat,
    formatNumber: source.formatNumber ? source.formatNumber.bind(source) : source.NumberFormat,
    $t: source.$t || source.formatMessage.bind(source)
  };
}

/**
 * 时间格式化
 */
var DateTimeFormatter = /*#__PURE__*/function () {
  function DateTimeFormatter(locales, formatOptions, cache, valueKey) {
    _classCallCheck(this, DateTimeFormatter);
    this.locales = void 0;
    this.formatOptions = void 0;
    // 创建一个缓存对象，用于存储DateTimeFormat的对象
    this.cache = void 0;
    this.valueKey = void 0;
    this.locales = locales;
    this.formatOptions = formatOptions !== null && formatOptions !== void 0 ? formatOptions : {};
    this.cache = cache !== null && cache !== void 0 ? cache : creatI18nCache();
    this.valueKey = valueKey !== null && valueKey !== void 0 ? valueKey : '';
  }
  _createClass(DateTimeFormatter, [{
    key: "dateTimeFormat",
    value: function dateTimeFormat(value, formatOptions) {
      var _this$cache;
      var options = formatOptions !== null && formatOptions !== void 0 ? formatOptions : this.formatOptions;
      var formatter = new Intl.DateTimeFormat(this.locales, options);
      // 将传输的字符串转变为日期对象
      if (typeof value === 'string') {
        value = new Date(value);
      }

      // 如果启用了记忆化且已经有对应的数字格式化器缓存，则直接返回缓存中的格式化结果。否则创建新的格式化数据，并进行缓存
      if ((_this$cache = this.cache) !== null && _this$cache !== void 0 && _this$cache.dateTimeFormat) {
        // 造缓存的key，key包含区域设置和日期时间格式选项
        var cacheKey = utils.generateKey(this.locales, options, this.valueKey);
        if (this.cache.dateTimeFormat[cacheKey]) {
          return this.cache.dateTimeFormat[cacheKey].format(value);
        }

        // 查询缓存中的key， 若无key则创建新key
        this.cache.dateTimeFormat[cacheKey] = formatter;
        return formatter.format(value);
      }

      // 返回格式化后的时间

      return formatter.format(value);
    }
  }]);
  return DateTimeFormatter;
}();

/**
 * 数字格式化
 */
var NumberFormatter = /*#__PURE__*/function () {
  function NumberFormatter(locales, formatOption, cache, valueKey) {
    _classCallCheck(this, NumberFormatter);
    this.locales = void 0;
    this.formatOption = void 0;
    this.cache = void 0;
    // 创建一个缓存对象，用于缓存已经创建的数字格式化器
    this.valueKey = void 0;
    this.locales = locales;
    this.formatOption = formatOption !== null && formatOption !== void 0 ? formatOption : {};
    this.cache = cache !== null && cache !== void 0 ? cache : creatI18nCache();
    this.valueKey = valueKey !== null && valueKey !== void 0 ? valueKey : '';
  }
  _createClass(NumberFormatter, [{
    key: "numberFormat",
    value: function numberFormat(value, formatOption) {
      var _this$cache;
      var options = formatOption !== null && formatOption !== void 0 ? formatOption : this.formatOption;
      var formatter = new Intl.NumberFormat(this.locales, options);

      // 如果启用了记忆化且已经有对应的数字格式化器缓存，则直接返回缓存中的格式化结果。否则创建新的格式化数据，并进行缓存
      if ((_this$cache = this.cache) !== null && _this$cache !== void 0 && _this$cache.numberFormat) {
        // 造缓存的key，key包含区域设置数字格式选项
        var cacheKey = utils.generateKey(this.locales, options, this.valueKey);
        if (this.cache.numberFormat[cacheKey]) {
          return this.cache.numberFormat[cacheKey].format(value);
        }
        this.cache.numberFormat[cacheKey] = formatter;
        return formatter.format(value);
      }
      return formatter.format(value);
    }
  }]);
  return NumberFormatter;
}();

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _createForOfIteratorHelper$2(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray$2(r)) || e && r && "number" == typeof r.length) { t && (r = t); var n = 0, F = function () {}; return { s: F, n: function () { return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }; }, e: function (r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function () { t = t.call(r); }, n: function () { var r = t.next(); return a = r.done, r; }, e: function (r) { u = !0, o = r; }, f: function () { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray$2(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray$2(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$2(r, a) : void 0; } }
function _arrayLikeToArray$2(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
 * 定义一个时间触发器类，使用泛型实现动态时间的监听
 */
var EventDispatcher = /*#__PURE__*/function () {
  function EventDispatcher() {
    _classCallCheck(this, EventDispatcher);
    // 声明_events，用于存储事件和对应的监听器
    this._events = void 0;
    this._events = new Map();
  }

  /**
   * on 方法，向指定的事件添加监听器，并返回一个用于移除该监听器的函数
   * @param event
   * @param listener
   */
  _createClass(EventDispatcher, [{
    key: "on",
    value: function on(event, listener) {
      var _this = this;
      if (!this._events.has(event)) {
        this._events.set(event, new Set());
      }
      var listeners = this._events.get(event);
      listeners.add(listener);
      return function () {
        _this.removeListener(event, listener);
      };
    }

    /**
     * removeListener 方法，移除指定事件的监听器
     * @param event
     * @param listener
     */
  }, {
    key: "removeListener",
    value: function removeListener(event, listener) {
      if (!this._events.has(event)) {
        return;
      }
      var listeners = this._events.get(event);
      listeners.delete(listener);
      if (listeners.size === 0) {
        this._events.delete(event);
      }
    }

    /**
     * emit 方法，触发指定事件，并按照监听器注册顺序执行监听器
     * @param event
     * @param args
     */
  }, {
    key: "emit",
    value: function emit(event) {
      if (!this._events.has(event)) {
        return;
      }

      // 获取该事件对应的监听器集合，并按照注册顺序执行每个监听器
      var listeners = this._events.get(event);
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      var _iterator = _createForOfIteratorHelper$2(listeners),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var listener = _step.value;
          listener.apply(this, args);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }]);
  return EventDispatcher;
}();

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

/**
 * 复数格式化
 */
var PluralFormatter = /*#__PURE__*/function () {
  function PluralFormatter(locale, locales, value, message) {
    _classCallCheck(this, PluralFormatter);
    this.locale = void 0;
    this.locales = void 0;
    this.value = void 0;
    this.message = void 0;
    this.locale = locale;
    this.locales = locales;
    this.value = value;
    this.message = message;
  }

  // 将 message中的“#”替换为指定数字value，并返回新的字符串或者字符串数组
  _createClass(PluralFormatter, [{
    key: "replaceSymbol",
    value: function replaceSymbol(ctx) {
      var msg = typeof this.message === 'function' ? this.message(ctx) : this.message;
      var messages = Array.isArray(msg) ? msg : [msg];
      var numberFormatter = new NumberFormatter(this.locales);
      var valueStr = numberFormatter.numberFormat(this.value);
      return messages.map(function (msg) {
        return typeof msg === 'string' ? msg.replace('#', valueStr) : msg;
      });
    }
  }]);
  return PluralFormatter;
}();

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
 * 规则选择器
 * eg : 输入选择语句 female {She} other {They}} ，表示'female'和'other'是两种可能的值，它们分别对应着'She'和'They'两个输出结果。
 * 如果调用select（{ value: 'female' }）则表示，输出 she
 */
var SelectFormatter = /*#__PURE__*/function () {
  function SelectFormatter(locale) {
    _classCallCheck(this, SelectFormatter);
    this.locale = void 0;
    this.locale = locale;
  }
  _createClass(SelectFormatter, [{
    key: "getRule",
    value: function getRule(value, rules) {
      return rules[value] || rules.other;
    }
  }]);
  return SelectFormatter;
}();

var _excluded = ["offset"],
  _excluded2 = ["offset"];
/**
 * 默认格式化接口
 */
var generateFormatters = function (locale, locales) {
  var localeConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    plurals: undefined
  };
  var formatOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var cache = arguments.length > 4 ? arguments[4] : undefined;
  var valueKey = arguments.length > 5 ? arguments[5] : undefined;
  var plurals = localeConfig.plurals;
  /**
   *  样式函数 ，根据格式获取格式样式， 如货币百分比， 返回相应的格式的对象，如果没有设定格式，则返回一个空对象
   * @param formatOption
   */
  var getStyleOption = function (formatOption) {
    if (typeof formatOption === 'string') {
      return formatOptions[formatOption] || {
        option: formatOption
      };
    } else {
      return formatOption;
    }
  };
  return {
    // 复数规则
    plural: function (value, _ref) {
      var _ref$offset = _ref.offset,
        offset = _ref$offset === void 0 ? 0 : _ref$offset,
        rules = _objectWithoutPropertiesLoose(_ref, _excluded);
      var pluralFormatter = new PluralFormatter(locale, locales, value - offset, rules[value] || rules[plurals === null || plurals === void 0 ? void 0 : plurals(value - offset)] || rules.other);
      return pluralFormatter.replaceSymbol.bind(pluralFormatter);
    },
    selectordinal: function (value, _ref2) {
      var _ref2$offset = _ref2.offset,
        offset = _ref2$offset === void 0 ? 0 : _ref2$offset,
        rules = _objectWithoutPropertiesLoose(_ref2, _excluded2);
      var message = rules[value] || rules[plurals === null || plurals === void 0 ? void 0 : plurals(value - offset, true)] || rules.other;
      var pluralFormatter = new PluralFormatter(locale, locales, value - offset, message);
      return pluralFormatter.replaceSymbol.bind(pluralFormatter);
    },
    // 选择规则，如果规则对象中包含与该值相对应的属性，则返回该属性的值；否则，返回 "other" 属性的值。
    select: function (value, formatRules) {
      var selectFormatter = new SelectFormatter(locale);
      return selectFormatter.getRule(value, formatRules);
    },
    // 用于将数字格式化为字符串，接受一个数字和一个格式化规则。它会根据规则返回格式化后的字符串。
    numberFormat: function (value, formatOption) {
      return new NumberFormatter(locales, getStyleOption(formatOption), cache, valueKey).numberFormat(value);
    },
    /**
     * 用于将日期格式化为字符串，接受一个日期对象和一个格式化规则。它会根据规则返回格式化后的字符串。
     * eg: { year: 'numeric', month: 'long', day: 'numeric' } 是一个用于指定DateTimeFormatter如何将日期对象转换为字符串的参数。
     *      \year: 'numeric' 表示年份的表示方式是数字形式（比如2023）。
     *       month: 'long' 表示月份的表示方式是全名（比如January）。
     *       day: 'numeric' 表示日期的表示方式是数字形式（比如1号）。
     * @param value
     * @param formatOption { year: 'numeric', month: 'long', day: 'numeric' }
     */
    dateTimeFormat: function (value, formatOption) {
      return new DateTimeFormatter(locales, getStyleOption(formatOption), cache, valueKey).dateTimeFormat(value, formatOption);
    },
    // 用于处理未定义的值，接受一个值并直接返回它。
    undefined: function (value) {
      return value;
    }
  };
};

/**
 * 获取翻译结果
 */
var Translation = /*#__PURE__*/function () {
  function Translation(compiledMessage, locale, locales, localeConfig, cache) {
    _classCallCheck(this, Translation);
    this.compiledMessage = void 0;
    this.locale = void 0;
    this.locales = void 0;
    this.localeConfig = void 0;
    this.cache = void 0;
    this.compiledMessage = compiledMessage;
    this.locale = locale;
    this.locales = locales;
    this.localeConfig = localeConfig;
    this.cache = cache !== null && cache !== void 0 ? cache : creatI18nCache();
  }

  /**
   * @param values 需要替换文本占位符的值
   * @param formatOptions 需要格式化选项
   */
  _createClass(Translation, [{
    key: "translate",
    value: function translate(values) {
      var _this = this;
      var formatOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var createTextFormatter = function (locale, locales, values, formatOptions, localeConfig) {
        var textFormatter = function (valueKey, type, format) {
          var formatters = generateFormatters(locale, locales, localeConfig, formatOptions, _this.cache, valueKey);
          var value = values[valueKey];
          var formatter = formatters[type](value, format);
          var message;
          if (typeof formatter === 'function') {
            message = formatter(textFormatter); // 递归调用
          } else {
            message = formatter; // 获得变量值 formatted: "Fred"
          }
          return Array.isArray(message) ? message.join('') : message;
        };
        return textFormatter;
      };
      var textFormatter = createTextFormatter(this.locale, this.locales, values, formatOptions, this.localeConfig);
      // 通过递归方法formatCore进行格式化处理
      return this.formatMessage(this.compiledMessage, textFormatter); // 返回要格式化的结果
    }
  }, {
    key: "formatMessage",
    value: function formatMessage(compiledMessage, textFormatter) {
      var _this2 = this;
      if (!Array.isArray(compiledMessage)) {
        return compiledMessage;
      }
      return compiledMessage.map(function (token) {
        if (typeof token === 'string') {
          return token;
        }
        var name = token[0],
          type = token[1],
          format = token[2];
        var replaceValueFormat = format;

        // 如果 format 是对象，函数将递归地对它的每个值调用 formatMessage 后保存，否则直接保存
        if (format && typeof format !== 'string') {
          replaceValueFormat = Object.keys(replaceValueFormat).reduce(function (text, key) {
            text[key] = _this2.formatMessage(format[key], textFormatter);
            return text;
          }, {});
        }
        //调用 getContent 函数来获取给定 name、type 和 interpolateFormat 的值
        var value = textFormatter(name, type, replaceValueFormat);
        return value !== null && value !== void 0 ? value : "{" + name + "}";
      }).join('');
    }
  }]);
  return Translation;
}();

function _createForOfIteratorHelper$1(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray$1(r)) || e && r && "number" == typeof r.length) { t && (r = t); var n = 0, F = function () {}; return { s: F, n: function () { return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }; }, e: function (r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function () { t = t.call(r); }, n: function () { var r = t.next(); return a = r.done, r; }, e: function (r) { u = !0, o = r; }, f: function () { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray$1(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray$1(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0; } }
function _arrayLikeToArray$1(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }

// 用于匹配标签的正则表达式
var tagReg = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/;

// 用于匹配换行符的正则表达式
var nlReg = /(?:\r\n|\r|\n)/g;
function formatElements(value) {
  var elements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var elementKeyID = getElementIndex(0, '$Inula');

  //  value：This is a rich text with a custom component: <1/>
  var arrays = value.replace(nlReg, '').split(tagReg);

  // 若无InulaNode元素，则返回
  if (arrays.length === 1) return value;
  var result = [];
  var before = arrays.shift();
  if (before) {
    result.push(before);
  }
  var _iterator = _createForOfIteratorHelper$1(getElements(arrays)),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _step.value,
        index = _step$value[0],
        children = _step$value[1],
        after = _step$value[2];
      var element = elements[index];
      if (!element || voidElementTags[element.type] && children) {
        var errorMessage = !element ? "Index not declared as " + index + " in original translation" : element.type + " , No child element exists. Please check.";
        console.error(errorMessage);

        // 对于异常元素，通过创建<></>来代替，并继续解析现有的子元素和之后的元素，并保证在构建数组时，不会因为缺少元素而导致索引错位。
        element = horizon.createElement(horizon.Fragment, {});
      }

      // 如果存在子元素，则进行递归处理
      var formattedChildren = children ? formatElements(children, elements) : element.props.children;

      // 更新element 的属性和子元素
      var clonedElement = horizon.cloneElement(element, {
        key: elementKeyID()
      }, formattedChildren);
      result.push(clonedElement);
      if (after) {
        result.push(after);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return result;
}

/**
 *  从arrays数组中解析出标签元素和其子元素
 * @param arrays
 */
function getElements(arrays) {
  // 如果 arrays 数组为空，则返回空数组
  if (!arrays.length) return [];

  /**
   * pairedIndex: 第一个元素表示配对标签的内容，即 <1>...</1> 形式的标签。
   * children: 第二个元素表示配对标签内的子元素内容。
   * unpairedIndex: 第三个元素表示自闭合标签的内容，即 <1/> 形式的标签。
   * textAfter: 第四个元素表示标签之后的文本内容，即标签后紧跟着的文本。
   * eg: [undefined,undefined,1,""]
   */
  var _arrays$splice = arrays.splice(0, 4),
    pairedIndex = _arrays$splice[0],
    children = _arrays$splice[1],
    unpairedIndex = _arrays$splice[2],
    textAfter = _arrays$splice[3];

  // 解析当前标签元素和它的子元素，返回一个包含标签索引、子元素和后续文本的数组
  var currentElement = [parseInt(pairedIndex || unpairedIndex),
  // 解析标签索引，如果是自闭合标签，则使用 unpaired
  children || '', textAfter || ''];

  // 递归调用 getElements 函数，处理剩余的 arrays 数组
  var remainingElements = getElements(arrays);

  // 将当前元素和递归处理后的元素数组合并并返回
  return [currentElement].concat(remainingElements);
}

// 对传入富文本元素的位置标志索引
function getElementIndex() {
  var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  return function () {
    return prefix + "_" + count++;
  };
}

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

function getFormatMessage(i18n, id) {
  var _i18n$cache;
  var values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var components = arguments.length > 4 ? arguments[4] : undefined;
  var messages = options.messages,
    context = options.context;
  var formatOptions = options.formatOptions;
  var cache = (_i18n$cache = i18n.cache) !== null && _i18n$cache !== void 0 ? _i18n$cache : creatI18nCache();
  if (typeof id !== 'string') {
    values = values || id.defaultValues;
    messages = id.messages || id.defaultMessage;
    context = id.context;
    id = id.id;
  }

  // 对messages进行判空处理
  var isMissingMessage = !context && !i18n.messages[id];
  var isMissingContextMessage = context && !i18n.messages[context][id];
  var messageUnavailable = isMissingContextMessage || isMissingMessage;

  // 对错误消息进行处理
  var messageError = i18n.onError;
  if (messageError && messageUnavailable) {
    if (typeof messageError === 'function') {
      return messageError(i18n.locale, id, context);
    } else {
      return messageError;
    }
  }
  var compliedMessage;
  if (context) {
    compliedMessage = i18n.messages[context][id] || messages || id;
  } else {
    compliedMessage = i18n.messages[id] || messages || id;
  }

  // 对解析的message进行parse解析，并输出解析后的Token
  compliedMessage = typeof compliedMessage === 'string' ? utils.compile(compliedMessage) : compliedMessage;
  var translation = new Translation(compliedMessage, i18n.locale, i18n.locales, i18n.localeConfig, cache);
  var formatResult = translation.translate(values, formatOptions);

  // 如果存在inula元素，则返回包含格式化的Inula元素的数组
  return formatElements(formatResult, components);
}

function _callSuper$1(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct$1() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$1 = function () { return !!t; })(); }
var I18n = /*#__PURE__*/function (_EventDispatcher) {
  _inherits(I18n, _EventDispatcher);
  function I18n(props) {
    var _props$cache;
    var _this;
    _classCallCheck(this, I18n);
    _this = _callSuper$1(this, I18n);
    _this.locale = void 0;
    _this.locales = void 0;
    _this.defaultLocale = void 0;
    _this.timeZone = void 0;
    _this.allMessages = void 0;
    _this._localeConfig = void 0;
    _this.onError = void 0;
    _this.cache = void 0;
    _this.$t = void 0;
    _this.defaultLocale = 'en';
    _this.locale = _this.defaultLocale;
    _this.locales = _this.locale || '';
    _this.allMessages = {};
    _this._localeConfig = {};
    _this.onError = props.onError;
    _this.timeZone = '';
    _this.loadMessage(props.messages);
    if (props.localeConfig) {
      _this.loadLocaleConfig(props.localeConfig);
    }
    if (props.messages) {
      _this.changeMessage(props.messages);
    }
    if (props.locale || props.locales) {
      _this.changeLanguage(props.locale, props.locales);
    }
    _this.$t = _this.formatMessage.bind(_assertThisInitialized(_this));
    _this.formatMessage = _this.formatMessage.bind(_assertThisInitialized(_this));
    _this.formatDate = _this.formatDate.bind(_assertThisInitialized(_this));
    _this.formatNumber = _this.formatNumber.bind(_assertThisInitialized(_this));
    _this.cache = (_props$cache = props.cache) !== null && _props$cache !== void 0 ? _props$cache : creatI18nCache();
    return _this;
  }
  _createClass(I18n, [{
    key: "messages",
    get: function () {
      if (this.locale in this.allMessages) {
        var _this$allMessages$thi;
        return (_this$allMessages$thi = this.allMessages[this.locale]) !== null && _this$allMessages$thi !== void 0 ? _this$allMessages$thi : {};
      } else {
        var _this$allMessages;
        return (_this$allMessages = this.allMessages) !== null && _this$allMessages !== void 0 ? _this$allMessages : {};
      }
    }
  }, {
    key: "localeConfig",
    get: function () {
      var _this$_localeConfig$t;
      return (_this$_localeConfig$t = this._localeConfig[this.locale]) !== null && _this$_localeConfig$t !== void 0 ? _this$_localeConfig$t : {};
    }
  }, {
    key: "setLocaleConfig",
    value: function setLocaleConfig(locale, localeData) {
      if (this._localeConfig[locale]) {
        _extends(this._localeConfig, localeData);
      } else {
        this._localeConfig[locale] = localeData;
      }
    }

    // 将热语言环境的本地化数据加载
  }, {
    key: "loadLocaleConfig",
    value: function loadLocaleConfig(localeOrAllData, localeConfig) {
      var _this2 = this;
      if (localeConfig) {
        this.setLocaleConfig(localeOrAllData, localeConfig);
      } else {
        Object.keys(localeOrAllData).forEach(function (locale) {
          _this2.setLocaleConfig(locale, localeOrAllData[locale]);
        });
      }
      this.emit('change');
    }
  }, {
    key: "setMessage",
    value: function setMessage(locale, messages) {
      if (this.allMessages[locale]) {
        this.allMessages[locale] = _extends({}, this.allMessages[locale], messages);
      } else {
        this.allMessages[locale] = messages;
      }
    }
  }, {
    key: "changeMessage",
    value: function changeMessage(messages) {
      this.allMessages = messages;
      this.emit('change');
    }

    // 加载messages
  }, {
    key: "loadMessage",
    value: function loadMessage(localeOrMessages, messages) {
      var _this3 = this;
      if (messages) {
        //当 message 为空的时候，加载单一的message信息
        this.setMessage(localeOrMessages, messages);
      } else {
        // 加载多对locale-message信息
        localeOrMessages && Object.keys(localeOrMessages).forEach(function (locale) {
          return _this3.setMessage(locale, localeOrMessages[locale]);
        });
      }
      this.emit('change');
    }

    // 改变当前的语言环境
  }, {
    key: "changeLanguage",
    value: function changeLanguage(locale, locales) {
      this.locale = locale;
      if (locales) {
        this.locales = locales;
      }
      this.emit('change', {
        locale: locale,
        id: ''
      });
    }
  }, {
    key: "formatMessage",
    value: function formatMessage(id) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        messages = _ref.messages,
        context = _ref.context,
        formatOptions = _ref.formatOptions;
      // 在多次渲染时，保证存储component不丢失
      var components = {};
      var tempValues = _extends({}, values);
      if (tempValues) {
        Object.keys(tempValues).forEach(function (key, index) {
          var value = tempValues[key];
          if (!horizon.isValidElement(value)) return;
          // 将inula元素暂存
          components[index] = value;
          tempValues[key] = "<" + index + "/>";
        });
      }
      return getFormatMessage(this, id, tempValues, {
        messages: messages,
        context: context,
        formatOptions: formatOptions
      }, components);
    }
  }, {
    key: "formatDate",
    value: function formatDate(value, formatOptions) {
      var dateTimeFormatter = new DateTimeFormatter(this.locale || this.locales, formatOptions, this.cache);
      return dateTimeFormatter.dateTimeFormat(value);
    }
  }, {
    key: "formatNumber",
    value: function formatNumber(value, formatOptions) {
      var numberFormatter = new NumberFormatter(this.locale || this.locales, formatOptions, this.cache);
      return numberFormatter.numberFormat(value);
    }
  }]);
  return I18n;
}(EventDispatcher);
function createI18nInstance() {
  var i18nProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new I18n(i18nProps);
}

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
function FormattedMessage(props) {
  var _useIntl = useIntl(),
    formatMessage = _useIntl.formatMessage;
  var id = props.id,
    values = props.values,
    messages = props.messages,
    formatOptions = props.formatOptions,
    context = props.context,
    _props$tagName = props.tagName,
    TagName = _props$tagName === void 0 ? horizon.Fragment : _props$tagName,
    children = props.children,
    comment = props.comment;
  var formatMessageOptions = {
    comment: comment,
    messages: messages,
    context: context,
    formatOptions: formatOptions
  };
  var formattedMessage = formatMessage(id, values, formatMessageOptions);
  if (typeof children === 'function') {
    var childNodes = Array.isArray(formattedMessage) ? formattedMessage : [formattedMessage];
    return children(childNodes);
  }
  if (TagName) {
    return jsxRuntime.jsx(TagName, {
      children: horizon.Children.toArray(formattedMessage)
    });
  }
  return jsxRuntime.jsx(jsxRuntime.Fragment, {
    children: formattedMessage
  });
}

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
var staticsMap = new Map();
staticsMap.set(horizon.ForwardRef, INULA_FORWARD_REF_STATICS);

// 确定给定的组件是否为Memo组件，并返回相应的静态属性
function getStatics(component) {
  if (horizon.isMemo(component)) {
    return INULA_MEMO_STATICS;
  }
  if (staticsMap.has(component['vtype'])) {
    return staticsMap.get(component['vtype']) || INULA_STATICS;
  }
}

/**
 * 判断给定的对象属性描述是否有效
 * @param sourceComponent
 * @param key
 */
function isDescriptorValid(sourceComponent, key) {
  var descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
  return descriptor && (!descriptor.get || descriptor.get.prototype);
}

// 将一个对象的非react静态属性复制到另一个对象上，并返回马目标对象
function copyStaticProps(targetComponent, sourceComponent) {
  if (typeof sourceComponent === 'string') {
    return targetComponent;
  }
  // 递归拷贝静态属性
  var inheritedComponent = Object.getPrototypeOf(sourceComponent);
  if (inheritedComponent && inheritedComponent !== Object.prototype) {
    copyStaticProps(targetComponent, inheritedComponent);
  }

  // 获取源组件的属性列表
  var keys = [].concat(Object.getOwnPropertyNames(sourceComponent), Object.getOwnPropertySymbols(sourceComponent));

  // 获取目标组件和源组件的静态属性
  var targetStatics = getStatics(targetComponent);
  var sourceStatics = getStatics(sourceComponent);
  keys.forEach(function (key) {
    if (!NATIVE_STATICS[key] && !(targetStatics && targetStatics[key]) && !(sourceStatics && sourceStatics[key]) && isDescriptorValid(sourceComponent, key)) {
      try {
        // 在一个已有的targetComponent对象上增加sourceComponent的属性
        Object.defineProperty(targetComponent, key, Object.getOwnPropertyDescriptor(sourceComponent, key));
      } catch (e) {
        console.log('Error occurred while copying static props:', e);
      }
    }
  });
  return targetComponent;
}

// 创建国际化组件对象上下文
var I18nContext = horizon.createContext(null);
var Consumer = I18nContext.Consumer,
  Provider = I18nContext.Provider;
var InjectProvider = Provider;

/**
 * 用于实现国际化的高阶组件，将国际化功能注入到组件中，使组件能够使用国际化的本文格式化功能
 * @param Component
 * @param options
 */
function injectI18n(Component, options) {
  var _ref = options || {},
    _ref$isUsingForwardRe = _ref.isUsingForwardRef,
    isUsingForwardRef = _ref$isUsingForwardRe === void 0 ? false : _ref$isUsingForwardRe,
    _ref$ensureContext = _ref.ensureContext,
    ensureContext = _ref$ensureContext === void 0 ? false : _ref$ensureContext;

  // 定义一个名为 WrappedI18n 的函数组件，接收传入组件的 props 和 forwardedRef，返回传入组件并注入 i18n
  var WrappedI18n = function (props) {
    return jsxRuntime.jsx(Consumer, {
      children: function (context) {
        if (ensureContext) {
          isVariantI18n(context.i18nInstance);
        }
        var i18nProps = {
          intl: context.i18nInstance
        };
        return jsxRuntime.jsx(Component, _extends({}, props, i18nProps, {
          ref: isUsingForwardRef ? props.forwardedRef : null
        }));
      }
    });
  };
  WrappedI18n.WrappedComponent = Component;

  // 通过copyStatics方法，复制组件中的静态属性
  return copyStaticProps(isUsingForwardRef ? horizon.forwardRef(function (props, ref) {
    return jsxRuntime.jsx(WrappedI18n, _extends({}, props, {
      forwardedRef: ref
    }));
  }) : WrappedI18n, Component);
}

/**
 * 用于为应用程序提供国际化的格式化功能，管理程序中的语言文本信息和本地化资源信息
 * @param props
 * @constructor
 */
var I18nProvider = function (props) {
  // 使用 useMemo 创建或获取 i18n 实例
  var locale = props.locale,
    messages = props.messages,
    i18n = props.i18n,
    children = props.children;
  var i18nInstance = horizon.useMemo(function () {
    return i18n || createI18nInstance({
      locale: locale,
      messages: messages
    });
  }, [i18n, locale, messages]);

  // 监听message和locale的变化
  var _useI18nSync = useI18nSync(i18nInstance),
    currentLocale = _useI18nSync.currentLocale,
    currentMessages = _useI18nSync.currentMessages;

  // 创建一个 memoized 的 context 值
  var contextValue = horizon.useMemo(function () {
    return _extends({}, i18nInstance, {
      i18nInstance: i18nInstance,
      locale: currentLocale,
      messages: currentMessages,
      changeLanguage: i18nInstance.changeLanguage,
      changeMessage: i18nInstance.changeMessage
    });
  }, [i18nInstance, currentLocale, currentMessages]);
  // 提供一个 Provider 组件
  return jsxRuntime.jsx(InjectProvider, {
    value: contextValue,
    children: children
  });
};
var useI18nSync = function (i18nInstance) {
  var _useState = horizon.useState(i18nInstance.locale),
    currentLocale = _useState[0],
    setCurrentLocale = _useState[1];
  var _useState2 = horizon.useState(i18nInstance.messages),
    currentMessages = _useState2[0],
    setCurrentMessages = _useState2[1];
  var handleChange = horizon.useCallback(function () {
    if (currentLocale !== i18nInstance.locale) {
      setCurrentLocale(i18nInstance.locale);
    }
    if (currentMessages !== i18nInstance.messages) {
      setCurrentMessages(i18nInstance.messages);
    }
  }, [i18nInstance, currentLocale, currentMessages]);
  horizon.useEffect(function () {
    // 清理函数
    return i18nInstance.on('change', handleChange);
  }, [i18nInstance, handleChange]);
  return {
    currentLocale: currentLocale,
    currentMessages: currentMessages
  };
};

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
 *  useI18n hook，与 Inula 组件一起使用。
 *  使用 useI18n 钩子函数可以更方便地在函数组件中进行国际化操作
 */
function useIntl() {
  var ContextI18n = horizon.useContext(I18nContext);
  isVariantI18n(ContextI18n);

  // 用于兼容通过createI18n对象直接创建一个I18n实例.
  var i18nInstance = ContextI18n.i18nInstance ? ContextI18n.i18nInstance : ContextI18n;
  utils.isVariantI18n(i18nInstance);
  return horizon.useMemo(function () {
    return createI18nProps(i18nInstance);
  }, [i18nInstance]);
}

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
 * createIntl hook函数，用于创建国际化i8n实例，以进行相关的数据操作
 */

var createIntl = function (config, cache) {
  var locale = config.locale,
    defaultLocale = config.defaultLocale,
    messages = config.messages;
  var i18nInstance = createI18nInstance({
    locale: locale || defaultLocale || 'en',
    messages: messages,
    cache: cache !== null && cache !== void 0 ? cache : creatI18nCache()
  });
  return createI18nProps(i18nInstance);
};

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}

function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get.bind();
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }
      return desc.value;
    };
  }
  return _get.apply(this, arguments);
}

function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

// 动作常量
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// 状态常量
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;
var pathStateMachine = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, BEFORE_PATH, {
  ws: [BEFORE_PATH],
  ident: [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  eof: [AFTER_PATH]
}), IN_PATH, {
  ws: [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  eof: [AFTER_PATH]
}), BEFORE_IDENT, {
  ws: [BEFORE_IDENT],
  ident: [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  number: [IN_IDENT, APPEND]
}), IN_IDENT, {
  ident: [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  number: [IN_IDENT, APPEND],
  ws: [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  eof: [AFTER_PATH, PUSH]
}), IN_SUB_PATH, {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  eof: ERROR,
  else: [IN_SUB_PATH, APPEND]
}), IN_SINGLE_QUOTE, {
  "'": [IN_SUB_PATH, APPEND],
  eof: ERROR,
  else: [IN_SINGLE_QUOTE, APPEND]
}), IN_DOUBLE_QUOTE, {
  '"': [IN_SUB_PATH, APPEND],
  eof: ERROR,
  else: [IN_DOUBLE_QUOTE, APPEND]
});
var numberFormatKeys = ['compactDisplay', 'currency', 'currencyDisplay', 'currencySign', 'localeMatcher', 'notation', 'numberingSystem', 'signDisplay', 'style', 'unit', 'unitDisplay', 'useGrouping', 'minimumIntegerDigits', 'minimumFractionDigits', 'maximumFractionDigits', 'minimumSignificantDigits', 'maximumSignificantDigits'];
var dateTimeFormatKeys = ['dateStyle', 'timeStyle', 'calendar', 'localeMatcher', 'hour12', 'hourCycle', 'timeZone', 'formatMatcher', 'weekday', 'era', 'year', 'month', 'day', 'hour', 'minute', 'second', 'timeZoneName'];

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

function includes(arr, item) {
  return !!~arr.indexOf(item);
}
function dealNumberOrTimesArgs(args, numericOrTimeConstansArr) {
  var locale = 'en';
  var key;
  var options = {};
  if (args.length === 1) {
    if (typeof args[0] == 'string') {
      key = args[0];
    } else if (typeof args[0] == 'object') {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }
      options = Object.keys(args[0]).reduce(function (acc, key) {
        if (includes(numericOrTimeConstansArr, key)) {
          return _extends({}, acc, _defineProperty({}, key, args[0][key]));
        }
        return acc;
      }, {});
    }
  } else if (args.length === 2) {
    if (typeof args[0] == 'string') {
      key = args[0];
    }
    if (typeof args[1] == 'string') {
      locale = args[1];
    }
  }
  var dealLocale = locale.substring(0, 2);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return {
    dealLocale: dealLocale,
    key: key,
    options: options
  };
}
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

// eslint-disable-next-line @typescript-eslint/ban-types
var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}
function isString(val) {
  return typeof val === 'string';
}
var isArray = Array.isArray;
function isNull(val) {
  return val === null || val === undefined;
}
function isFunction(val) {
  return typeof val === 'function';
}
function dealMsgArgs(pathRet, message, key) {
  if (isArray(pathRet) || isPlainObject(pathRet)) {
    return pathRet;
  }
  var ret;
  if (isNull(pathRet)) {
    /* istanbul ignore else */
    if (isPlainObject(message)) {
      ret = message[key];
      if (!(isString(ret) || isFunction(ret))) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn("Value of key '" + key + "' is not a string or function !");
        }
        return null;
      }
    } else {
      return null;
    }
  } else {
    /* istanbul ignore else */
    if (isString(pathRet) || isFunction(pathRet)) {
      ret = pathRet;
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("Value of key '" + key + "' is not a string or function!");
      }
      return null;
    }
  }
  return ret;
}

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var n = 0, F = function () {}; return { s: F, n: function () { return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }; }, e: function (r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function () { t = t.call(r); }, n: function () { var r = t.next(); return a = r.done, r; }, e: function (r) { u = !0, o = r; }, f: function () { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var I18nPath = /*#__PURE__*/function () {
  function I18nPath() {
    _classCallCheck(this, I18nPath);
    // 使用严格类型的缓存对象
    this._cache = Object.create(null);
  }
  _createClass(I18nPath, [{
    key: "parsePath",
    value:
    /**
     * External parse that check for a cache hit first
     */
    function parsePath(path) {
      var hit = this._cache[path];
      if (!hit) {
        hit = parse(path);
        if (hit) {
          this._cache[path] = hit;
        }
      }
      return hit || [];
    }
  }, {
    key: "getPathValue",
    value: function getPathValue(obj, id) {
      // 如果传入的不是对象，则返回null
      if (!isObject(obj)) {
        return null;
      }
      // 解析路径
      var paths = this.parsePath(id);
      if (paths.length === 0) {
        return null;
      } else {
        var last = obj;
        var _iterator = _createForOfIteratorHelper(paths),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var path = _step.value;
            var value = last[path];
            // 如果路径对应的值为undefined或null，则返回null
            if (value === undefined || value === null) {
              return null;
            }
            last = value;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return last;
      }
    }
  }]);
  return I18nPath;
}();
function parse(path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c;
  var key;
  var newChar;
  var type;
  var transition;
  var action;
  var typeMap;
  var actions = [];
  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };
  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };
  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      if (key === undefined) {
        return false;
      }
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };
  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }
  while (mode !== null) {
    index++;
    c = path[index];
    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }
    type = getPathCharType(c);

    //  根据不同的字符串，进行匹配对应的状态模式
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;
    if (transition === ERROR) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return; // parse error
    }
    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return;
      }
    }
    if (mode === AFTER_PATH) {
      return keys;
    }
  }
}

// 格式化子路径
function formatSubPath(path) {
  var trimmed = path.trim();
  if (path.charAt(0) === '0' && isNaN(Number(path))) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}
var literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function isLiteral(exp) {
  return literalValueRE.test(exp);
}

/**
 * 剥离引号
 */
function stripQuotes(str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}
function getPathCharType(ch) {
  if (ch === undefined || ch === null) {
    return 'eof';
  }
  var code = ch.charCodeAt(0);
  switch (code) {
    case 0x5b: // [
    case 0x5d: // ]
    case 0x2e: // .
    case 0x22: // "
    case 0x27:
      // '
      return ch;
    case 0x5f: // _
    case 0x24: // $
    case 0x2d:
      // -
      return 'ident';
    case 0x09: // Tab
    case 0x0a: // Newline
    case 0x0d: // Return
    case 0xa0: // No-break space
    case 0xfeff: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029:
      // Paragraph Separator
      return 'ws';
  }
  return 'ident';
}

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
var VueI18n$1 = /*#__PURE__*/function (_I18n) {
  _inherits(VueI18n, _I18n);
  function VueI18n(_options) {
    var _this;
    _classCallCheck(this, VueI18n);
    _this = _callSuper(this, VueI18n, [_options]);
    _this.locale = void 0;
    _this.localMessages = void 0;
    _this.dateTimeFormats = void 0;
    _this.datetimeFormats = void 0;
    _this.numberFormats = void 0;
    _this.vueMessages = void 0;
    _this.path = void 0;
    _this.listeners = void 0;
    // 重写 loadMessage 方法以支持加载局部消息
    _this.loadMessage = function (localeOrMessages, messages) {
      _superPropGet((_assertThisInitialized(_this), VueI18n), "loadMessage", _assertThisInitialized(_this), 3)([localeOrMessages, messages]);
      _this.emit('change');
    };
    _this.changeLanguage = function (locale) {
      _this.locale = locale;
      _superPropGet((_assertThisInitialized(_this), VueI18n), "changeLanguage", _assertThisInitialized(_this), 3)([locale]);
    };
    _this.changeMessage = function (messages) {
      _superPropGet((_assertThisInitialized(_this), VueI18n), "changeMessage", _assertThisInitialized(_this), 3)([messages]);
    };
    _this.$t = function (msgKey, values) {
      var _assertThisInitialize = _assertThisInitialized(_this),
        messages = _assertThisInitialize.messages;
      var pathRet = _this.path.getPathValue(messages, msgKey);
      var msgId = pathRet !== null ? dealMsgArgs(pathRet, messages, msgKey) : msgKey;
      return _superPropGet((_assertThisInitialized(_this), VueI18n), "formatMessage", _assertThisInitialized(_this), 3)([msgId, values]);
    };
    _this.$n = function (value) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      var _dealNumberOrTimesArg = dealNumberOrTimesArgs(args, numberFormatKeys),
        dealLocale = _dealNumberOrTimesArg.dealLocale,
        key = _dealNumberOrTimesArg.key,
        options = _dealNumberOrTimesArg.options;
      // 如果自己传入新的语言，则更新
      _superPropGet((_assertThisInitialized(_this), VueI18n), "changeLanguage", _assertThisInitialized(_this), 3)([dealLocale ? dealLocale : 'en']);
      if (key) {
        var formatOptions = _this.numberFormats[dealLocale][key];
        return _superPropGet((_assertThisInitialized(_this), VueI18n), "formatNumber", _assertThisInitialized(_this), 3)([value, formatOptions]);
      }
      return _superPropGet((_assertThisInitialized(_this), VueI18n), "formatNumber", _assertThisInitialized(_this), 3)([value, options]);
    };
    _this.$d = function (value) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      var _dealNumberOrTimesArg2 = dealNumberOrTimesArgs(args, dateTimeFormatKeys),
        dealLocale = _dealNumberOrTimesArg2.dealLocale,
        key = _dealNumberOrTimesArg2.key,
        options = _dealNumberOrTimesArg2.options;
      _superPropGet((_assertThisInitialized(_this), VueI18n), "changeLanguage", _assertThisInitialized(_this), 3)([dealLocale ? dealLocale : 'en']);
      if (key) {
        var formatOptions = _this.dateTimeFormats[dealLocale][key];
        return _superPropGet((_assertThisInitialized(_this), VueI18n), "formatDate", _assertThisInitialized(_this), 3)([value, formatOptions]);
      }
      return _superPropGet((_assertThisInitialized(_this), VueI18n), "formatDate", _assertThisInitialized(_this), 3)([value, options]);
    };
    _this.locale = _options.locale || 'en';
    _this.localMessages = new Map();
    _this.vueMessages = _options.messages || {};
    _this.numberFormats = _options.numberFormats || {};
    _this.dateTimeFormats = _options.dateTimeFormats || {};
    _this.datetimeFormats = _options.datetimeFormats || {};
    _this.path = new I18nPath();
    _this.listeners = new Set();
    _this.loadMessage(_this.vueMessages);
    return _this;
  }

  // 重写 messages getter
  _createClass(VueI18n, [{
    key: "messages",
    get: function () {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (this.locale in this.vueMessages) {
        var _this$vueMessages$thi;
        return (_this$vueMessages$thi = this.vueMessages[this.locale]) !== null && _this$vueMessages$thi !== void 0 ? _this$vueMessages$thi : {};
      } else {
        var _this$vueMessages;
        return (_this$vueMessages = this.vueMessages) !== null && _this$vueMessages !== void 0 ? _this$vueMessages : {};
      }
    }
  }]);
  return VueI18n;
}(I18n);
function createVueI18nInstance() {
  var i18nProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new VueI18n$1(i18nProps);
}

function createI18n(options) {
  var locale = options.locale,
    messages = options.messages;
  var i18nInstance = createVueI18nInstance({
    locale: locale || 'en',
    messages: messages
  });
  return {
    global: _extends({}, i18nInstance, {
      // 这里需要手动把on属性带上，因为on来自i18nInstance的原型链上，...展开会丢失
      on: i18nInstance.on.bind(i18nInstance),
      t: i18nInstance.$t.bind(i18nInstance),
      messages: i18nInstance.allMessages
    }),
    // 用于注册到全局国际化插件
    install: function (app) {
      // 将 vueIi18n 实例提供给I18nProvider
      app.rootComponent = horizon.createElement(I18nProvider, {
        i18n: i18nInstance
      }, app.rootComponent);
    }
  };
}

var useI18n = function (options) {
  var contextI18n = horizon.useContext(I18nContext);
  if (contextI18n && !options) {
    return i18nInstance(contextI18n);
  }
  if (!options) {
    throw new Error('I18nProvider is not used and options are not provided');
  }
  if (options.messages) {
    Object.entries(options.messages).forEach(function (_ref) {
      var _contextI18n$i18nInst;
      var locale = _ref[0],
        messages = _ref[1];
      contextI18n === null || contextI18n === void 0 ? void 0 : (_contextI18n$i18nInst = contextI18n.i18nInstance) === null || _contextI18n$i18nInst === void 0 ? void 0 : _contextI18n$i18nInst.loadMessage(_defineProperty({}, locale, _extends({}, contextI18n.messages[locale], messages)));
    });
  }
  horizon.useEffect(function () {
    if (options !== null && options !== void 0 && options.locale) {
      contextI18n === null || contextI18n === void 0 ? void 0 : contextI18n.changeLanguage(options.locale);
    }
    if (options !== null && options !== void 0 && options.messages) {
      contextI18n === null || contextI18n === void 0 ? void 0 : contextI18n.loadMessage(options.messages);
    }
  }, [options === null || options === void 0 ? void 0 : options.locale, options === null || options === void 0 ? void 0 : options.messages]);
  return i18nInstance(contextI18n);
};
function i18nInstance(i18nContext) {
  var i18nInstance = i18nContext.i18nInstance ? i18nContext.i18nInstance : i18nContext;
  return _extends({}, i18nInstance, {
    on: i18nInstance.on.bind(i18nInstance),
    n: i18nInstance.$n.bind(i18nInstance),
    d: i18nInstance.$d.bind(i18nInstance),
    t: i18nInstance.$t.bind(i18nInstance)
  });
}

var useLocalMessage = function (messages) {
  var instance = useI18n();
  var t = instance.t,
    formatMessage = instance.formatMessage,
    path = instance.path,
    on = instance.on,
    locale = instance.locale;
  var currentLocale = horizon.useRef(locale);
  horizon.useMemo(function () {
    on('change', function (_ref) {
      var locale = _ref.locale;
      currentLocale.current = locale;
    });
  }, []);
  var $t = function (msgKey, values) {
    var currentMessages = messages[currentLocale.current] || {};
    var pathRet = path.getPathValue(currentMessages, msgKey);
    if (pathRet || currentMessages[msgKey]) {
      var msgId = pathRet !== null ? dealMsgArgs(pathRet, currentMessages, msgKey) : currentMessages[msgKey];
      return formatMessage(msgId, values);
    }
    return t(msgKey, values);
  };
  return {
    $t: $t,
    t: $t
  };
};

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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
// type for $api
var VueI18n = {
  VueI18n: VueI18n$1
};

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

var index = {
  I18n: I18n,
  createIntlCache: creatI18nCache,
  createIntl: createIntl,
  DateTimeFormatter: DateTimeFormatter,
  NumberFormatter: NumberFormatter,
  useIntl: useIntl,
  FormattedMessage: FormattedMessage,
  I18nContext: I18nContext,
  IntlProvider: I18nProvider,
  injectIntl: injectI18n,
  RawIntlProvider: InjectProvider,
  VueI18n: VueI18n
};

// 用于定义文本
function defineMessages(msgs) {
  return msgs;
}
function defineMessage(msg) {
  return msg;
}

exports.DateTimeFormatter = DateTimeFormatter;
exports.FormattedMessage = FormattedMessage;
exports.I18n = I18n;
exports.I18nProvider = I18nProvider;
exports.IntlContext = I18nContext;
exports.IntlProvider = I18nProvider;
exports.NumberFormatter = NumberFormatter;
exports.RawIntlProvider = InjectProvider;
exports.createI18n = createI18n;
exports.createIntl = createIntl;
exports.createIntlCache = creatI18nCache;
exports.default = index;
exports.defineMessage = defineMessage;
exports.defineMessages = defineMessages;
exports.injectIntl = injectI18n;
exports.useI18n = useI18n;
exports.useIntl = useIntl;
exports.useLocalMessage = useLocalMessage;
//# sourceMappingURL=intl.js.map
