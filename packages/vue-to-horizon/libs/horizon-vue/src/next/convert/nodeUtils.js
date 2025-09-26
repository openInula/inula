import t from '@babel/types';
import parser from '@babel/parser';
import tsCompile from './ts/index.js';
import LOG from '../logHelper.js';

const defaultParseOption = {
  sourceType: 'module', // 默认为 "script"
  plugins: [
    'jsx', // 支持 TypeScript
    'typescript', // 其他插件...
  ],
};

/**
 * js生成ast树
 * @param {*} scriptStr
 * @param {*} option
 * @returns
 */
export function convertJsToAst(scriptStr, option = { lang: 'js' }) {
  let sourceScript = scriptStr;
  if (option.lang === 'ts') {
    sourceScript = tsCompile(sourceScript);
  }
  try {
    // 解析 code 生成 AST
    const ast = parser.parse(sourceScript, defaultParseOption);
    return ast;
  } catch (error) {
    const mes = `script js parse Error[${error.message}]  ${scriptStr}`;
    LOG.error(mes);
    throw mes;
  }
}

/***
 * 检查节点是否包含指定属性
 * @param path
 * @param attrName
 */
export function checkHasAttribute(node, attrName) {
  return node.attributes.some(item => {
    return getAttributeNodeName(item) === attrName;
  });
}

/***
 * 检查节点是否包含指定开始的属性
 * @param path
 * @param attrName
 */
export function checkStartWithAttribute(node, attrName) {
  return node.attributes.some(item => {
    return getAttributeNodeName(item).startsWith(attrName);
  });
}

/***
 * 获取属性节点的属性名
 * @param attribute
 * @returns {*}
 */
export function getAttributeNodeName(attribute) {
  if (attribute.type === 'JSXSpreadAttribute') {
    return '';
  }
  if (t.isJSXNamespacedName(attribute.name)) {
    return attribute.name.name.name;
  }
  return attribute.name.name;
}

/**
 * 把短横线命名法（kebab-case）转换为大驼峰命名法（PascalCase）
 * 保持原有单词中的大小写格式不变
 * 例如：
 * drawer-out ===> DrawerOut
 * AaaaBbbb-test ===> AaaaBbbbTest
 *
 * @param {string} str - 输入的短横线命名字符串
 * @returns {string} 转换后的大驼峰命名字符串
 */
export function kebabToPascalCase(str) {
  return str
    .split('-')
    .map(
      (word, index) =>
        // 对于每个单词，只处理首字母大写，其余保持原样
        index === 0 && word
          ? word.charAt(0).toUpperCase() + word.slice(1) // 第一个单词
          : word
            ? word.charAt(0).toUpperCase() + word.slice(1)
            : '' // 其他单词
    )
    .join('');
}

/**
 * 例如：drawer-out ===> drawerOut
 *
 * @param {string} str - 输入的短横线命名字符串
 * @returns {string} 转换后的大驼峰命名字符串
 */
export function convertToCamelCase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

/**
 * 判断标签名是否以大写字母开头
 * @param {string} tagName - 要检查的标签名
 * @returns {boolean} - 如果标签名以大写字母开头则返回true，否则返回false
 */
export function isUppercaseTag(tagName) {
  return /^[A-Z]/.test(tagName);
}

export function isVueCustomTag(tagName) {
  return /^[A-Z]/.test(tagName) || tagName.indexOf('-') > -1;
}

/**
 * 处理UI库中instance api使用的import
 * 例如 import {ElMessage} from ‘element-plus’;  ElMessage.warn("hello")
 * 转换成 import {XXX as ElMessage} from ‘YYY’;  ElMessage.warn("hello")
 */
export function convertUIComponentImported(path, t, component) {
  const sourceName = path.node.source.value;
  if (component?.instance) {
    let componentSource = '';
    const specifiers = path.node?.specifiers?.map(s => {
      const componentConfig = component.instance[s.imported?.name || ''];
      if (componentConfig && componentConfig.source !== sourceName) {
        componentSource = componentConfig.source;
        return t.importSpecifier(t.identifier(s.imported.name), t.identifier(componentConfig.targetTag));
      }
      return s;
    });
    if (componentSource) {
      path.node.specifiers = specifiers;
      path.node.source.value = componentSource;
    }
  }
}

export function getValueByNode(node, isValue) {
  let value;

  if (t.isJSXExpressionContainer(node.value)) {
    // 如果是 JSXExpressionContainer，我们需要获取其中的表达式
    value = node.value.expression;
  } else {
    value = isValue ? node.value.value : node.value;
  }

  return value;
}

/**
 * 解析指令的值
 * @param {string} value - 指令值字符串
 * @returns {string|Object} - 解析后的值
 */
function parseDirectiveValue(value) {
  // 如果值是undefined或null，直接返回
  if (value == null) return value;

  // 将值转换为字符串
  const strValue = String(value);

  // 判断是否是被单引号包裹的字符串
  if (strValue.startsWith("'") && strValue.endsWith("'")) {
    // 去除首尾的单引号
    return strValue.slice(1, -1);
  }

  return t.identifier(strValue);
}

/**
 * 获取指令节点的值
 * @param {Object} node - 指令节点
 * @returns {Object} - 返回处理后的值节点
 *
 * @example
 * // 示例 1: 普通字符串值
 * // <div v-custom="hello" />
 * // 返回: t.identifier("hello")
 *
 * // 示例 2: 被单引号包裹的字符串
 * // <div v-custom="'hello'" />
 * // 返回: t.stringLiteral("hello")
 *
 * // 示例 3: JSX 表达式
 * // <div v-custom={message} />
 * // 返回: t.identifier("message")
 */
export function getDirectiveValueByNode(node) {
  let value = node.value;

  if (t.isJSXExpressionContainer(node.value)) {
    // JSX 表达式容器的情况
    // 例如: v-custom={message}
    // 从容器中提取表达式部分
    value = node.value.expression;
  } else if (t.isStringLiteral(node.value)) {
    // 字符串字面量的情况
    // 例如: v-custom="message" 或 v-custom="'message'"
    const parsedValue = parseDirectiveValue(node.value.value);
    value = typeof parsedValue === 'string' ? t.stringLiteral(parsedValue) : parsedValue;
  }

  return value;
}
