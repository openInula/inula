import t from '@babel/types';
import parser from '@babel/parser';
import { traverse } from '@babel/core';
import LOG from '../../../logHelper.js';
import {
  createNodeByVueVariable,
  handlerThisExpression,
  memberExpressionValueReplaceHandler
} from './expressionHandler.js'

export function identifierHandler(path, reactCovert) {
  // 比如 {!items.length && <li>Loading...</li>} or {isLoading && <div>loading</div>}
  const targetString = path.node.name;

  let nodeAst = null;

  try {
    nodeAst = parser.parseExpression(targetString);
  } catch (error) {
    LOG.error('字符串转 AST 解析错误: ', targetString);
  }

  if (!nodeAst) {
    LOG.warn('String to AST Parser null: ', targetString);
    return;
  }

  // 预先判断 nodeAst 的类型
  if (t.isMemberExpression(nodeAst)) {
    // 如果是 MemberExpression，直接处理，因为"this.xxx"场景，无法在下面的babelTraverse中进入MemberExpression
    let replaceNode = memberExpressionValueReplaceHandler(nodeAst, reactCovert, { node: nodeAst });
    if (replaceNode) {
      nodeAst = replaceNode;
    }
  } else {
    traverse(
      nodeAst,
      {
        Identifier(path) {
          processIdentifierPath(path, reactCovert);
        },
        MemberExpression(path) {
          // 找到 MemberExpression
          let replaceNode = memberExpressionValueReplaceHandler(path.node, reactCovert, path);
          if (replaceNode) {
            path.replaceWith(replaceNode);
          }
          path.skip();
        },
      },
      path.scope,
      path
    );
  }

  path.replaceWith(nodeAst);

  processIdentifierPath(path, reactCovert);
}

export function processIdentifierPath(path, reactCovert) {
  if (isFunctionParameter(path)) {
    path.skip();
    return;
  }

  const isObjectPropertyKey =
    path.parent.type === 'ObjectProperty' && path.parent.key === path.node && !path.parent.computed;

  const isObjectMethodKey =
    path.parent.type === 'ObjectMethod' && path.parent.key === path.node && !path.parent.computed;

  if (!isObjectPropertyKey && !isObjectMethodKey) {
    const newNode = processIdentifier(path.node, reactCovert);
    if (newNode !== path.node) {
      // 检查 Identifier 是否是 MemberExpression 的一部分
      const isMemberExpression =
        path.parent.type === 'MemberExpression' || path.parent.type === 'OptionalMemberExpression';

      if (isMemberExpression) {
        if (t.isIdentifier(path.parent.object) && path.parent.object === path.node) {
          path.parent.object = newNode;
        }
      } else {
        path.replaceWith(newNode);
      }
    }
  }

  path.skip();
}

export function processIdentifier(node, reactCovert) {
  const idName = node.name;
  if (idName) {
    const rootProp = idName.split('.')[0];
    const targetExpr = createNodeByVueVariable(rootProp, reactCovert);
    if (targetExpr) {
      if (idName.includes('.')) {
        const parts = idName.split('.');
        return parts.slice(1).reduce((acc, part) => {
          return t.memberExpression(acc, t.identifier(part));
        }, targetExpr);
      }
      return targetExpr;
    }
  }
  return node;
}


// 判断node是否是函数的入参，解决函数入参和全局名称相同场景
export function isFunctionParameter(path) {
  if (!path || !path.parentPath) {
    // 如果path或parentPath为空，则无法判断是否为函数参数，返回false
    return false;
  }

  let node = path.node;
  let parentNode = path.parentPath.node;

  // 如果当前节点是 MemberExpression，我们检查它的 object
  if (t.isMemberExpression(node)) {
    node = node.object;
    // 如果 object 不是 Identifier，我们无法确定它是否为函数参数
    if (!t.isIdentifier(node)) {
      return false;
    }
  }

  if ((t.isFunctionDeclaration(parentNode) || t.isFunctionExpression(parentNode) || t.isArrowFunctionExpression(parentNode)) &&
    parentNode.params.includes(node)) {
    return true;
  }

  // 检查 path.scope 是否存在
  if (!path.scope) {
    // 如果 scope 不存在，我们无法确定绑定信息，返回 false
    return false;
  }

  const binding = path.scope.getBinding(node.name);
  if (!binding) {
    return false;
  }

  // Check if the binding kind is 'param'
  if (binding.kind === 'param') {
    return true;
  }

  return false;
}
