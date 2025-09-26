import t from '@babel/types';
import { globalLibPaths } from '../../defaultConfig.js';
import { addInstance, addUsedGlobalProperties } from './instanceHandler.js';
import LOG from '../../../logHelper.js';

import parser from '@babel/parser';
import { traverse } from '@babel/core';
import { isFunctionParameter, processIdentifier, processIdentifierPath } from './identifierHandler.js';
import { JSWarnings } from '../../../errors.js';
import { INSTANCE } from '../consts.js';

/**
 *  处理this 表达式
 *  1.比如在选项式api中，会将原来开的 this.场景需要处理. this.xx
 doubleCount() {
 testa();
 return this.count * 2;  // 计算属性，返回 count 的两倍
 },
 其中因为count已经替换为reactive,所以要替换成 reactivexxx.items

 2,需要将js代码中ref，computed的值 默认加上xx.value,
 * @param {*} path
 */
export function handlerThisExpression(path, reactCovert) {
  if (isThisNode(path.node.object)) {
    // 将 this.xxx 替换为一个不含 this 的标识符 xxx
    let name = getThisProperty(path.node);
    if (name === '') {
      LOG.warn(JSWarnings.not_support_this_templateLiteral + path.toString());
      return;
    }

    let replaceNode = createNodeByVueVariable(name, reactCovert);
    if (replaceNode) {
      path.replaceWith(replaceNode);
    } else {
      path.replaceWith(t.identifier(name));
    }
  }
}

export function getThisProperty(node) {
  let name;
  if (t.isIdentifier(node.property)) {
    // 处理 this.xxx 的情况
    name = node.property.name;
  } else if (t.isStringLiteral(node.property)) {
    // 处理 this['xxx'] 的情况
    name = node.property.value;
  } else if (t.isTemplateLiteral(node.property)) {
    // 处理 this[`xxx`] 的情况
    if (node.property.quasis.length === 1 && node.property.expressions.length === 0) {
      // 只有当模板字符串中没有表达式时，我们才能静态地确定名称
      name = node.property.quasis[0].value.cooked;
    } else {
      // 如果模板字符串包含表达式，我们可能需要更复杂的处理
      // 这里简单地返回，不做替换
      return '';
    }
  } else {
    // 其他类型的属性访问，不做处理
    return '';
  }
  return name;
}

export const THIS_ALIASES = [
  '_this',
  'this_',
  '$this',
  'this$',
  'self',
  '_self',
  'self_',
  'that',
  '_that',
  'that',
  '_serf',
];

/**
 * 检查给定的节点是否表示 this 或其别名（如 self, _that）
 * @param {Object} node - Babel 的 AST 节点
 * @returns {boolean} - 如果节点表示 this 或其别名则返回 true，否则返回 false
 */
export function isThisNode(node) {
  // 检查 this
  if (t.isThisExpression(node)) {
    return true;
  }

  // 检查 this 的别名（如 self, _that）
  if (t.isIdentifier(node)) {
    return THIS_ALIASES.includes(node.name);
  }

  return false;
}

/**
 * 根据 Vue 变量类型创建对应的 AST 节点
 * 处理 props、refs、computed、reactive、globalProperties 等不同类型的变量
 *
 * 示例转换:
 * 1. props: this.title -> props.title
 * 2. refs: this.inputRef -> inputRef.value
 * 3. computed: this.fullName -> fullName.value
 * 4. reactive: this.formData -> dataReactive.formData
 * 5. store: this.$store -> useStore()
 * 6. instance: this.$parent -> instance.$parent
 */
export function createNodeByVueVariable(name, reactCovert) {
  // 处理 props
  if (reactCovert.sourceCodeContext.findKeyInProps(name)) {
    return t.memberExpression(t.identifier(reactCovert.sourceCodeContext.propsName), t.identifier(name));
  }
  // 处理 refs
  else if (reactCovert.sourceCodeContext.findKeyInRefs(name)) {
    return t.memberExpression(t.identifier(name), t.identifier('value'));
  }
  // 处理 computed
  else if (reactCovert.sourceCodeContext.findKeyInComputeds(name)) {
    return t.memberExpression(t.identifier(name), t.identifier('value'));
  }
  // 处理 reactive
  else if (reactCovert.sourceCodeContext.findKeyInReactive(name)) {
    return t.memberExpression(t.identifier(reactCovert.sourceCodeContext.reactive[name]), t.identifier(name));
  }
  // 处理全局属性
  else if (reactCovert.sourceCodeContext.findKeyInGlobalProperties(name)) {
    addUsedGlobalProperties(reactCovert, name);
    return t.memberExpression(t.identifier(reactCovert.sourceCodeContext.globalPropertiesName), t.identifier(name));
  }
  // 处理自定义的 this 定义
  else if (reactCovert.sourceCodeContext.findKeyInSelfThisDefines(name)) {
    return t.memberExpression(
      t.identifier(reactCovert.sourceCodeContext.selfThisDefines.get(name)),
      t.identifier('value')
    );
  }
  // 处理特殊的 $ 开头的属性
  else if (name.startsWith('$')) {
    switch (name) {
      case '$store':
        // 处理 Vuex store
        reactCovert.sourceCodeContext.addExtrasImport('useStore', globalLibPaths.vuex.path);
        reactCovert.addCodeAstToHorizonForOnce('useStore', () => {
          return t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(name), t.callExpression(t.identifier('useStore'), [])),
          ]);
        });
        return t.identifier(name);

      // 处理实例属性
      case '$parent':
      case '$root':
      case '$refs':
      case '$children':
      case '$el':
      case '$props':
        addInstance(reactCovert);
        return t.memberExpression(t.identifier(INSTANCE), t.identifier(name));

      // 处理 Vue 3 的 $attrs
      case '$attrs':
        return t.identifier('attrs');

      // 处理国际化相关方法
      case '$t':
      case '$l':
        return t.identifier(name);

      default:
        console.log('unknown $function: ' + name);
        return t.identifier(name);
    }
  }
  return null;
}

/**
 * 寻找表达式中如果遇到ref、computed等，需要加上 xxx.value
 * @param {*} expression
 * @param {*} reactCovert
 * @returns
 */
export function memberExpressionValueReplaceHandler(expression, reactCovert, path) {
  const processNode = node => {
    if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
      if (isThisNode(node.object)) {
        const name = getThisProperty(node);
        if (name === '') {
          return node.property;
        }

        // {{this.xxx}} ==> {{dataReactive.xxx}}
        return createNodeByVueVariable(name, reactCovert);
      }
      if (node.computed && (t.isIdentifier(node.property) || t.isBinaryExpression(node.property))) {
        node.property = processNode(node.property);
      }
      // 递归处理对象和属性
      node.object = processNode(node.object);
    } else if (t.isIdentifier(node)) {
      return processComplexIdentifier(node, reactCovert);
    } else if (t.isCallExpression(node)) {
      // 处理函数调用
      node.callee = processNode(node.callee);
      node.arguments = node.arguments.map(processNode);
    } else if (t.isBinaryExpression(node)) {
      // 处理二元表达式
      node.left = processNode(node.left);
      node.right = processNode(node.right);
    }
    return node;
  };

  const processComplexIdentifier = (node, reactCovert) => {
    const idName = node.name;
    if (idName) {
      // 尝试解析可能的复杂表达式
      let nodeAst = null;
      try {
        // 处理例如这种identifier: "_getTdValue(title, nodeItemInner)"
        nodeAst = parser.parseExpression(idName);
      } catch (error) {
        console.error('String to AST Parser Error: ', idName);
      }

      if (nodeAst && nodeAst.type !== 'Identifier') {
        // 如果解析成功且结果不是简单的标识符，进行进一步处理
        traverse(
          nodeAst,
          {
            Identifier(path) {
              processIdentifierPath(path, reactCovert);
            },
            MemberExpression(path) {
              path.replaceWith(processNode(path.node));
              path.skip();
            },
          },
          path.scope,
          path
        );
        return nodeAst;
      } else {
        if (!isFunctionParameter(path)) {
          return processIdentifier(node, reactCovert);
        }
      }
    }
    return node;
  };

  return processNode(expression);
}
