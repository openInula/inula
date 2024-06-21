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

function transformJSXSlice(path: NodePath<t.JSXElement> | NodePath<t.JSXFragment>) {
  path.skip();

  // don't handle the jsx in return statement or in the arrow function return
  if (path.parentPath.isReturnStatement() || path.parentPath.isArrowFunctionExpression()) {
    // skip the children
    return;
  }

  const sliceCompNode = t.callExpression(t.identifier('Component'), [t.arrowFunctionExpression([], path.node)]);
  // handle the jsx in assignment, like `const a = <div></div>`
  // transform it into:
  // ```jsx
  //   const a = Component(() => {
  //     return <div></div>
  //   })
  // ```
  if (path.parentPath.isVariableDeclarator()) {
    path.replaceWith(sliceCompNode);
  } else {
    // extract the jsx slice into a subcomponent, like const a = type? <div></div> : <span></span>
    // transform it into:
    // ```jsx
    //   const Div$$ = (() => {
    //     return <div></div>
    //   });
    //   const Span$$ = Component(() => {
    //     return <span></span>
    //   });
    //   const a = type? <Div$$/> : <Span$$/>;
    // ```
    const sliceId = path.scope.generateUidIdentifier(genName(path.node));
    sliceId.name = 'JSX' + sliceId.name;

    // insert the subcomponent
    const sliceComp = t.variableDeclaration('const', [t.variableDeclarator(sliceId, sliceCompNode)]);
    // insert into the previous statement
    const stmt = path.getStatementParent();
    if (!stmt) {
      throw new Error('Cannot find the statement parent');
    }
    stmt.insertBefore(sliceComp);
    // replace the jsx slice with the subcomponent
    const sliceJsxId = t.jSXIdentifier(sliceId.name);
    path.replaceWith(t.jsxElement(t.jsxOpeningElement(sliceJsxId, [], true), null, [], true));
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
 *   let jsxSlice = <Comp_$id$/>
 * ```
 */
export default function (api: typeof babel, options: InulaNextOption): PluginObj {
  register(api);
  return {
    visitor: {
      JSXElement(path: NodePath<t.JSXElement>) {
        transformJSXSlice(path);
      },
      JSXFragment(path: NodePath<t.JSXFragment>) {
        transformJSXSlice(path);
      },
    },
  };
}
