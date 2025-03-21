/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import babel, { NodePath, PluginObj } from '@babel/core';
import { types as t } from '@openinula/babel-api';
import type { InulaNextOption } from '../types';
import { register } from '@openinula/babel-api';
import { COMPONENT, CURRENT_COMPONENT, importMap } from '../constants';

function transformJSXSlice(path: NodePath<t.JSXElement> | NodePath<t.JSXFragment>) {
  // don't handle the jsx in three cases:
  // 1. return statement, like `return <div></div>`
  // 2. jsx as a children of other jsx, like `<div><span></span></div>`
  if (
    (path.parentPath.isReturnStatement() && !path.parentPath.parentPath.parentPath?.isArrowFunctionExpression()) || // handle return statement in component
    path.parentPath.isJSXElement() ||
    path.parentPath.isJSXFragment()
  ) {
    // skip the children
    return;
  }

  // don't transform extracted component to prevent
  if (path.parentPath.isArrowFunctionExpression() && path.node.extra?.transformJSXSlice) {
    return;
  }

  let parentPath: NodePath<babel.types.Node> | null = path.parentPath;
  if (parentPath.isReturnStatement() || parentPath.isArrowFunctionExpression()) {
    while (parentPath) {
      // don't transform jsxslice in return of for tag or () => </> in for
      if (parentPath.isJSXElement()) {
        const indetifier = parentPath.get('openingElement')?.node?.name;
        if (t.isJSXIdentifier(indetifier) && indetifier.name === 'for') {
          return;
        }
      }
      if (parentPath.isDeclaration()) {
        break;
      }
      parentPath = parentPath.parentPath;
    }
  }

  // skip jsx in return in component
  if (path.parentPath.isReturnStatement()) {
    const callExpression = path.parentPath.scope.path.parentPath;
    if (callExpression?.isCallExpression()) {
      const id = callExpression.get('callee');
      if (id.isIdentifier() && id.node?.name === COMPONENT) {
        return;
      }
    }
  }

  const sliceCompNode = t.callExpression(t.identifier('Component'), [t.arrowFunctionExpression([], path.node)]);
  // extract the jsx slice into a subcomponent,
  // like const a = type? <div></div> : <span></span>
  // transform it into:
  // ```jsx
  //   const Div$$ = (() => {
  //     return <div>{count}</div>
  //   });
  //   const Span$$ = Component(() => {
  //     return <span></span>
  //   });
  //   const a = type?  $$createComponentNode(Div$$) : $$createComponentNode(Span$$);
  //  const a = type ? slice(()=>createHTMLNode(div, () => {xxx(count})) : createHTMLNode(span)

  //   <div>{a}</div>
  // ```
  const sliceId = path.scope.generateUidIdentifier(genName(path.node));
  sliceId.name = 'JSX' + sliceId.name;

  // insert the subcomponent
  const sliceComp = t.variableDeclaration('const', [t.variableDeclarator(sliceId, sliceCompNode)]);
  path.node.extra = { ...path.node.extra, transformJSXSlice: true };
  if (path.parentPath.isArrowFunctionExpression()) {
    const block = t.blockStatement([
      sliceComp,
      t.returnStatement(t.callExpression(t.identifier(importMap.createCompNode), [sliceId])),
    ]);
    path.replaceWith(block);
  } else {
    // insert into the previous statement
    const stmt = path.getStatementParent();
    if (!stmt) {
      throw new Error('Cannot find the statement parent');
    }
    stmt.insertBefore(sliceComp);
    path.replaceWith(t.callExpression(t.identifier(importMap.createCompNode), [sliceId]));
  }
}

function genName(node: t.JSXElement | t.JSXFragment) {
  if (t.isJSXFragment(node)) {
    return 'Fragment';
  }

  const jsxName = node.openingElement.name;
  if (t.isJSXIdentifier(jsxName)) {
    return jsxName.name;
  } else if (t.isJSXMemberExpression(jsxName)) {
    // connect all parts with _
    let result = jsxName.property.name;
    let current: t.JSXMemberExpression | t.JSXIdentifier = jsxName.object;
    while (t.isJSXMemberExpression(current)) {
      result = current.property.name + '_' + result;
      current = current.object;
    }
    result = current.name + '_' + result;
    return result;
  } else {
    // JSXNamespacedName
    return jsxName.name.name;
  }
}

/**
 * Analyze the JSX slice in the function component
 * 1. VariableDeclaration, like `const a = <div />`
 * 2. SubComponent, like `function Sub() { return <div /> }`
 *
 * i.e.
 * ```jsx
 *   let jsxSlice = <div>{count}</div>
 *   // =>
 *   function Comp_$id$() {
 *     return <div>{count}</div>
 *   }
 *   let jsxSlice = Comp_$id$()
 * ```
 */
export default function (api: typeof babel, options: InulaNextOption): PluginObj {
  register(api);
  return {
    visitor: {
      Program(program) {
        program.traverse({
          JSXElement(path: NodePath<t.JSXElement>) {
            transformJSXSlice(path);
          },
          JSXFragment(path: NodePath<t.JSXFragment>) {
            transformJSXSlice(path);
          },
        });
      },
    },
  };
}
