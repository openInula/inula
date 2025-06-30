import { getNextJSXElment } from '../../sfc-ast-helpers.js';
import { globalLibPaths } from '../../../defaultConfig.js';
import t from '@babel/types';

export function handleIfDirective(path, value, sourceCodeContext) {
  const parentPath = path.parentPath.parentPath;
  const targetNodes = getNextJSXElment(parentPath);
  const { ifNode, elseNodes = [], elseIfNodes = [] } = targetNodes;

  if (elseIfNodes.length === 0) {
    // 如果只有if， 则只需要用{condition && <IfComponent ...> }
    const ifAttr = findAttr('v-if', ifNode);
    replaceTemplateTag(ifNode, sourceCodeContext);

    // 检查是否已经有!!, !的情况就保持原样
    const condition = ifAttr.value.value;
    const needsDoubleNegation = !condition.startsWith('!');

    // 根据检查结果决定是否添加双重否定
    const ifValue = needsDoubleNegation
      ? t.unaryExpression('!', t.unaryExpression('!', t.identifier(condition)))
      : t.identifier(condition);

    if (elseNodes.length === 0) {
      try {
        if (parentPath.key === 'expression' && parentPath.container.type === 'ExpressionStatement') {
          parentPath.replaceWith(
            t.expressionStatement(
              t.jsxFragment(
                t.jsxOpeningFragment(), // 开始Fragment
                t.jsxClosingFragment(),
                [t.jSXExpressionContainer(t.logicalExpression('&&', ifValue, parentPath.node))]
              )
            )
          );
        } else if (parentPath.container.type === 'LogicalExpression') {
          // 场景：{SlotCustomer && <SlotCustomer v-if="customerArea">} ===> {SlotCustomer && customerArea && <SlotCustomer name="customer"></SlotCustomer>}
          parentPath.replaceWith(t.logicalExpression('&&', ifValue, parentPath.node));
        } else {
          const target = t.jSXExpressionContainer(t.logicalExpression('&&', ifValue, parentPath.node));
          parentPath.replaceWith(target);
        }
      } catch (error) {
        throw error;
      }
    } else {
      // 如果有else 没有 else if 则使用{condition? <IfComponent ...> : <elseComponent ...>}
      const elseNode = elseNodes[0];
      findAttr('v-else', elseNode);
      replaceTemplateTag(elseNode, sourceCodeContext);
      parentPath.replaceWith(
        t.jSXExpressionContainer(
          t.conditionalExpression(t.identifier(ifAttr.value.value), parentPath.node, elseNode.node)
        )
      );
      elseNode.remove();
    }
  } else {
    const conditionNodes = [];

    function hanlderConditions(targetPath, conditionKey, componentTag) {
      let children = targetPath.node;
      let attr = findAttr(conditionKey, targetPath);
      if (attr.value) {
        attr.name.name = 'condition';
        attr.value = t.jsxExpressionContainer(t.identifier(attr.value.value));

        // 创建条件表达式
        const conditionExpression = attr.value.expression;
        const conditionalContent = t.logicalExpression('&&', conditionExpression, targetPath.node);
        // 创建 JSX 表达式容器
        children = t.jsxExpressionContainer(conditionalContent);
      }
      replaceTemplateTag(targetPath, sourceCodeContext);

      conditionNodes.push(
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(componentTag), attr.value ? [attr] : [], false),
          t.jsxClosingElement(t.jsxIdentifier(componentTag)),
          [children], // 使用新创建的 JSX 表达式容器
          false
        )
      );

      sourceCodeContext.addExtrasImport(componentTag, 'adapters/vueAdapter');
    }

    hanlderConditions(ifNode, 'v-if', 'If');

    elseIfNodes.forEach(p => {
      hanlderConditions(p, 'v-else-if', 'ElseIf');
      p.remove();
    });

    elseNodes.forEach(p => {
      hanlderConditions(p, 'v-else', 'Else');
      p.remove();
    });

    ifNode.replaceWith(
      t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('ConditionalRenderer'), [], false),
        t.jsxClosingElement(t.jsxIdentifier('ConditionalRenderer')),
        conditionNodes,
        false
      )
    );
    sourceCodeContext.addExtrasImport('ConditionalRenderer', 'adapters/vueAdapter');
  }
}

/**
 * 将<template if='a' /> 替换为 <Fragment />
 */
function replaceTemplateTag(targetPath, sourceCodeContext) {
  let elementName = targetPath.node.openingElement.name.name;
  if (elementName === 'template') {
    targetPath.node.openingElement.name.name = 'Fragment';
    targetPath.node.closingElement.name.name = 'Fragment';
    sourceCodeContext.addExtrasImport('Fragment', globalLibPaths.horizon);
  }
}

/**
 * 找到path中 if  else  else-if的属性
 * @param {*} key
 * @param {*} targetPath
 * @returns
 */
function findAttr(key, targetPath) {
  let ifAttr = null;
  targetPath.node.openingElement.attributes = targetPath.node.openingElement.attributes.reduce((r, v) => {
    if (v.name && v.name.name === key) {
      ifAttr = v;
    } else {
      r.push(v);
    }
    return r;
  }, []);
  return ifAttr;
}
