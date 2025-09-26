import t from '@babel/types';
import { traverse } from '@babel/core';
import { addInstance } from './instanceHandler.js';
import { INSTANCE, TO_INSTANCE } from '../consts.js';
import { globalLibPaths } from '../../defaultConfig.js';
import { isUppercaseTag } from '../../nodeUtils.js';
import { V_FOR } from './directives/forDirective.js';

/**
 * 转换ref属性的处理函数。支持以下几种模式：
 *
 * setup模式：
 * 当元素标签为小写时：
 * <xxx ref="aaa"> ===> (val) => (aaa.value = val)
 * 当元素标签为大写时：
 * <Xxx ref="aaa"> ===> (val) => (aaa.value = toInstance(val))
 *
 * options模式：
 * 动态引用 - 使用变量：
 * :ref="item.id" ===> ref={(val) => (instance.$refs[item.id] = val)}
 * :ref="xxx" ===> ref={(val) => (instance.$refs.xxx = val)}
 *
 * 动态引用 - 使用表达式：
 * :ref="'inputEx' + index" ===> ref={(val) => (instance.$refs['inputEx' + index] = val)}
 *
 * 静态引用：
 * ref="inputEx" ===> ref={(val) => (instance.$refs.inputEx = val)}
 *
 * v-for循环中的ref处理：
 * 1. 使用索引的场景:
 * v-for="(item, index) in items"
 * :ref="'input' + index" ===> ref={(val) => {
 *   // 确保引用数组存在
 *   instance.$refs['input' + index] = instance.$refs['input' + index] || [];
 *   // 将元素存储在对应索引位置
 *   instance.$refs['input' + index][index] = toInstance(val);
 * }}
 *
 * 2. 使用项目ID的场景:
 * v-for="item in items"
 * :ref="item.id" ===> ref={(val) => {
 *   // 确保引用数组存在
 *   instance.$refs[item.id] = instance.$refs[item.id] || [];
 *   // 将元素存储在对应索引位置
 *   instance.$refs[item.id][index] = toInstance(val);
 * }}
 *
 * @param templateAst 需要转换的模板AST对象
 * @param reactCovert React转换上下文对象，包含转换时需要的配置和状态
 */
export function transformRefProperty(templateAst, reactCovert) {
  traverse(templateAst, {
    JSXAttribute(path) {
      if (path.get('name').isJSXIdentifier({ name: 'ref' })) {
        const val = path.get('value');

        // 获取JSX元素名称并检查是否小写开头
        const elementPath = path.findParent(p => p.isJSXOpeningElement());
        const elementName = elementPath.node.name.name;
        const isElementUpperCase = isUppercaseTag(elementName[0]);

        // 检查是否在v-for上下文中
        const vForContext = checkVForContext(path);

        if (reactCovert.isSetup) {
          let refValue;

          if (t.isJSXExpressionContainer(val.node)) {
            // 处理动态ref，如 :ref="xxx"
            if (t.isIdentifier(val.node.expression)) {
              // 简单标识符，如 :ref="inputRef"
              refValue = t.identifier(val.node.expression.name);
            } else {
              // 复杂表达式，如 :ref="'input' + index" 或 :ref="item.id"
              refValue = val.node.expression;
            }
          } else if (t.isStringLiteral(val.node)) {
            // 处理静态ref，如 ref="inputRef"
            refValue = t.identifier(val.node.value);
          }

          // 创建 .value 成员表达式
          const memberExp = t.memberExpression(refValue, t.identifier('value'));

          // 创建函数调用表达式，根据元素名是否大写决定使用 useInstance(val) 还是 val
          const functionCall = isElementUpperCase
            ? t.callExpression(t.identifier(TO_INSTANCE), [t.identifier('val')]) // 元素名大写时使用 useInstance(val)
            : t.identifier('val'); // 元素名小写时直接使用 val

          // 创建箭头函数
          const arrowFunction = t.arrowFunctionExpression(
            [t.identifier('val')],
            t.assignmentExpression('=', memberExp, functionCall)
          );

          // 创建新的JSX表达式容器
          const newVal = t.jsxExpressionContainer(arrowFunction);

          // 替换原来的值
          val.replaceWith(newVal);

          // 只有在元素名非小写的情况下才添加 useInstance 导入
          if (isElementUpperCase) {
            reactCovert.sourceCodeContext.addExtrasImport(TO_INSTANCE, globalLibPaths.vue);
          }
        } else {
          // 非 setup 模式的处理
          let isComputed = true;
          let refValue;

          if (t.isJSXExpressionContainer(val.node)) {
            if (t.isIdentifier(val.node.expression)) {
              isComputed = false;
              refValue = t.identifier(val.node.expression.name);
            } else {
              isComputed = true;
              refValue = val.node.expression;
            }
          } else {
            isComputed = false;
            refValue = t.identifier(val.node.value);
          }

          let assignmentBody;
          if (vForContext) {
            // v-for场景的ref赋值逻辑
            const refsAccess = t.memberExpression(
              t.memberExpression(t.identifier(INSTANCE), t.identifier('$refs')),
              refValue,
              isComputed
            );

            // 创建函数调用表达式，根据元素名是否大写决定使用 useInstance(val) 还是 val
            const functionCall = isElementUpperCase
              ? t.callExpression(t.identifier(TO_INSTANCE), [t.identifier('val')]) // 元素名大写时使用 useInstance(val)
              : t.identifier('val'); // 元素名小写时直接使用 val

            assignmentBody = t.blockStatement([
              // instance.$refs.xxx = instance.$refs.xxx || []
              t.expressionStatement(
                t.assignmentExpression('=', refsAccess, t.logicalExpression('||', refsAccess, t.arrayExpression([])))
              ),
              // instance.$refs.xxx.push(val)
              t.expressionStatement(
                t.callExpression(t.memberExpression(refsAccess, t.identifier('push')), [functionCall])
              ),
            ]);

            reactCovert.sourceCodeContext.addExtrasImport(TO_INSTANCE, globalLibPaths.vue);
          } else {
            // 非v-for场景的简单赋值
            assignmentBody = t.assignmentExpression(
              '=',
              t.memberExpression(
                t.memberExpression(t.identifier(INSTANCE), t.identifier('$refs')),
                refValue,
                isComputed // 使用方括号表示法
              ),
              t.identifier('val')
            );
          }

          // 创建箭头函数
          const arrowFunction = t.arrowFunctionExpression([t.identifier('val')], assignmentBody);

          // 创建新的JSX表达式容器
          const newVal = t.jsxExpressionContainer(arrowFunction);

          // 替换原来的值
          val.replaceWith(newVal);

          // 添加instance相关的import
          addInstance(reactCovert);
        }
      }
    },
  });

  // 因为v-for转换后，增加了V_FOR属性，用于给ref判断是否在v-for里面，这里用完后需要删除
  removeVFor(templateAst);
}

/**
 * 检查节点是否在 v-for 循环内
 * @param {Object} path - 当前节点路径
 * @returns {Object|null} 返回包含v-for信息的对象或null
 */
function checkVForContext(path) {
  let currentPath = path;
  while (currentPath) {
    const openingElement = currentPath.node.openingElement;
    if (openingElement && openingElement.attributes) {
      for (const attr of openingElement.attributes) {
        if (attr.type === 'JSXAttribute' && attr.name.name === V_FOR) {
          // 从v-for属性值中提取index变量名
          // 假设v-for的格式为 "(item, index) in items" 或 "item in items"
          const vForExp = attr.value.value || attr.value.expression;
          let indexVar = vForExp || 'index';

          return {
            exists: true,
            indexVar,
          };
        }
      }
    }
    currentPath = currentPath.parentPath;
  }
  return null;
}

/**
 * 删除模板中所有的 V_FOR 属性
 * 因为v-for转换后，增加了V_FOR属性，用于给ref判断是否在v-for里面
 * @param {Object} templateAst - 要处理的模板 AST
 */
export function removeVFor(templateAst) {
  traverse(templateAst, {
    JSXAttribute(path) {
      const attrName = path.get('name');

      // 检查并删除 v-for 或 v:for 属性
      if (attrName.isJSXIdentifier({ name: V_FOR })) {
        path.remove();
      }
    },
  });
}
