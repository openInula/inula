import LOG from '../../logHelper.js';
/**
 * 示例用例 const vueCode = `v-bind:[dynamicAttributeName]="attributeValue"`;
 * => {...{[dynamicAttributeName]:attributeValue}}
 * @param input
 * @returns
 */
const convertVueBindingToReact = input => {
  return input.replace(/v-bind:\[([^\]]+)\]="([^"]+)"/g, (match, attributeName, attributeValue) => {
    return `{...{[${attributeName}]:${attributeValue}}}`;
  });
};

/**
 * 简写绑定转换函数
 * <template test=xx y=xx #item="{ body, username, likes }" aa=bb>
 * => <template test=xx y=xx v-slot:item="{ body, username, likes }" aa=bb>
 *
 * <template test=xx y=xx #item aa=bb>
 * => <template test=xx y=xx v-slot:item aa=bb>
 *
 * <template test=xx y=xx #2 aa=bb>
 * => <template test=xx y=xx v-slot:__2 aa=bb>
 *
 * @param {string} input - 输入的模板字符串
 * @returns {string} 转换后的模板字符串
 */
const convertVueShortSlotToReact = input => {
  return input.replace(/<template([^>]*)#(\w+)([^>]*)>/gi, (match, before, slotName, after) => {
    // 检查 slotName 是否为纯数字
    if (/^\d+$/.test(slotName)) {
      // 如果是数字，在前面添加两个下划线
      return `<template${before}v-slot:__${slotName}${after}>`;
    } else {
      // 如果不是数字，保持原来的转换逻辑
      return `<template${before}v-slot:${slotName}${after}>`;
    }
  });
};

/**
 * This quotes v-show value to prevent conversion errors if value is not wrapped
 * <span v-show=someVariable> => <span v-show="someVariable">
 */

const transformVShowSyntax = input => {
  return input.replace(/(\s)(v-show\s*=\s*)(?!["'])(.*?)(?=[\s/>])/g, (match, space, attr, value) => {
    // 移除值两端可能存在的空格
    value = value.trim();

    // 检查值是否已经被引号包裹
    if (value.startsWith('"') || value.startsWith("'")) {
      return match;
    }

    return `${space}${attr}"${value}"`;
  });
}

/**
 * 将模板中的各种类型绑定值转换为字符串
 * 例如: :count=42 ==> :count="42"
 *       :isActive=true ==> :isActive="true"
 *       <div :isWarn=false/> ==> <div :isWarn="false"/>
 *       <div :isWarn=[1,2]/> ==> <div :isWarn="[1,2]"/>
 *       <div :isWarn=ssss/> ==> <div :isWarn="ssss"/>
 *
 * @param {string} input - 输入的 Vue 模板字符串
 * @returns {string} 转换后的字符串
 */
function convertBindings(input) {
  return input.replace(/(\s)(:\w+\s*=\s*)(?!["'])(.*?)(?=[\s/>])/g, (match, space, attr, value) => {
    // 移除值两端可能存在的空格
    value = value.trim();

    // 检查值是否已经被引号包裹
    if (value.startsWith('"') || value.startsWith("'")) {
      return match;
    }

    // 处理布尔值、数字、数组和变量名
    if (
      value === 'true' ||
      value === 'false' ||
      /^\d+$/.test(value) ||
      /^\[.*\]$/.test(value) ||
      /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)
    ) {
      return `${space}${attr}"${value}"`;
    }

    // 如果不匹配任何情况，保持原样
    return match;
  });
}

/**
 * 使用正则表达式匹配所有的v-bind :事件简写，并转换为完整形式
 * :id='compId' ==> v-bind:id='compId'
 * :count=42 ==> v-bind:count="42"
 * :isActive=true ==> v-bind:isActive="true"
 *
 * @param {string} input - 输入的 Vue 模板字符串
 * @returns {string} 转换后的字符串
 */
function convertVBindShorthand(input) {
  input = convertBindings(input);
  return input.replace(/(\s):(?=[_a-zA-Z])/g, '$1v-bind:');
}

/**
 * <div>
  <button v-on:click.stop.prevent="handleClick">Click me</button>
  <button v-on:click.stop="handleClick">Click me</button>
  <button v-on:mouseover.capture="handleMouseOver">Mouse over me</button>
  <table v-addId:test.table />
  <table v-addId.table />
</div>
 ===>
<div>
  <button v-on:click__stop__prevent="handleClick">Click me</button>
  <button v-on:click__stop="handleClick">Click me</button>
  <button v-on:mouseover__capture="handleMouseOver">Mouse over me</button>
  <table v-addId:test__table />
  <table v-addId__table />
</div>
 * @param {*} input
 * @returns
 */
function transformVDirectiveSyntax(input) {
  // 匹配 v-on:click.stop.prevent 等模式
  const regex = /v-([a-zA-Z]+):([a-zA-Z]+)\.([a-zA-Z.]+)\b/g;

  //匹配 v-addId.table 等模式
  const regexShort = /v-([a-zA-Z]+)\.([a-zA-Z.]+)\b/g;

  // 使用替换函数进行替换
  const temp = input.replace(regex, (match, name, event, modifiers) => {
    const transformedModifiers = modifiers.split('.').join('__');
    return `v-${name}:${event}__${transformedModifiers}`;
  });
  return temp.replace(regexShort, (match, name, modifiers) => {
    const transformedModifiers = modifiers.split('.').join('__');
    return `v-${name}__${transformedModifiers}`;
  });
}

/**
 * 使用正则表达式匹配所有的 @ 事件简写
 *  <input @click.stop.prevent  @keyup="submit"  @click.stop="handleClick"  @onClick4GridLinkCaprate="onClick4GridLinkCaprate" />
 * => <input v-on:click__stop__prevent  v-on:keyup="submit"  v-on:click__stop="handleClick"  v-on:onClick4GridLinkCaprate="onClick4GridLinkCaprate" />
 * //  在 JSX 中，你不能直接使用带有点（.）的属性，因为它违反了 JSX 的语法规则 <div class="warning-check" v-if="active" @click.stop>
 * @param {*} input
 * @returns
 */
const convertVueShortEventToReact = input => {
  let result = input.replace(
    /@([a-z0-9]+)((\.[a-z0-9]+)*)(="[^"]*")?/gi,
    (match, eventName, modifiers, _, handler = '') => {
      // 将所有的点号替换为双下划线
      let modStr = modifiers.replace(/\./g, '__');
      // 修饰符后不带值的情况下，确保拼接格式正确
      let result = `v-on:${eventName}${modStr}`;
      // 如果有值（handler)，则添加值
      if (handler) {
        result += `${handler}`;
      }
      return result;
    }
  );
  // 正则表达式匹配 v-on:xxx:yy 并替换为 v-on:xxx_yy
  result = result.replace(/v-on:(\w+):(\w+(:\w+)*)(?=\s*=\s*["{])/g, (match, p1, p2) => {
    return `v-on:${p1}_${p2.replace(/:/g, '_')}`;
  });
  return result;
};
/**
 * babel解析器不识别{{value}} ,识别jsx {value}
 * @param input
 * @returns
 */
const convertDoubleBracket = input => {
  return input.replace(/{{/g, '{').replace(/}}/g, '}');
};

/**
 *  babel解析jsx不识别注释 <!-- xx-->
 * @param input
 * @returns
 */
const convertJSXNotes = input => {
  return input.replaceAll(/<!--(.*?)-->/gs, '');
};

const convertJsxNoCloseTag = input => {
  return input.replaceAll(/<br>/g, '<br/>');
};

// 正则表达式匹配 v-model.xxx 语法
const regex = /v-model\.(\w+)/g;
const removeModelModifiers = input => {
  const modifiedTemplate = input.replace(regex, (match, p1) => {
    LOG.info(`注意：删除了: ${p1}`);
    return 'v-model';
  });
  return modifiedTemplate;
};

const transformXlink = input => {
  return input.replaceAll('xlink:href', 'href');
};

const DefaultHardCodeHandler = {
  DoubleBracket: convertDoubleBracket,
  JSXNotes: convertJSXNotes,
  DynamicBinding: convertVueBindingToReact,
  ShortBinding: convertVBindShorthand,
  ShortOn: convertVueShortEventToReact,
  ShortSlot: convertVueShortSlotToReact,
  vShow: transformVShowSyntax,
  noCloseBr: convertJsxNoCloseTag,
  modelModifiers: removeModelModifiers,
  vOnSyntax: transformVDirectiveSyntax,
  xlink: transformXlink,
};

/**
 * 按照指定的硬编码条件处理code string
 * @param str
 * @param handlers
 * @returns
 */
export function vueTemplateStringHardCoding(str, handlers = DefaultHardCodeHandler) {
  return Object.keys(handlers).reduce((r, handlerKey) => {
    r = handlers[handlerKey]?.(r);
    return r;
  }, str);
}

/**
 * 把 function (str, item) {} ===> (str, item) => {}
 * 因为babel/parser 无法转换匿名函数
 * @param code
 * @returns {*}
 */
export function convertToArrowFunction(code) {
  return code.replace(/function\s*\(([^)]*)\)\s*{([\s\S]*?)}/, (match, params, body) => {
    // 去除 body 开头和结尾的空白字符
    body = body.trim();

    return `(${params}) => {${body}}`;
  });
}
