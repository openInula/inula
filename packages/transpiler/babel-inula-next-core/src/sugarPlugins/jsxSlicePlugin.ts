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

import { NodePath } from '@babel/core';
import { AnalyzeContext, Visitor } from '../analyze/types';
import { createSubCompNode } from '../analyze/nodeFactory';
import * as t from '@babel/types';

function genName(tagName: string, ctx: AnalyzeContext) {
  return `$$${tagName}-Sub${ctx.current.subComponents.length}`;
}

function genNameFromJSX(path: NodePath<t.JSXElement>, ctx: AnalyzeContext) {
  const tagId = path.get('openingElement').get('name');
  if (tagId.isJSXIdentifier()) {
    const jsxName = tagId.node.name;
    return genName(jsxName, ctx);
  }
  throw new Error('JSXMemberExpression is not supported yet');
}

function replaceJSXSliceWithSubComp(name: string, ctx: AnalyzeContext, path: NodePath<t.JSXElement | t.JSXFragment>) {
  // create a subComponent node and add it to the current component
  const subComp = createSubCompNode(name, ctx.current, path.node);
  ctx.current.subComponents.push(subComp);

  // replace with the subComp jsxElement
  const subCompJSX = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(name), [], true),
    t.jsxClosingElement(t.jsxIdentifier(name)),
    [],
    true
  );
  path.replaceWith(subCompJSX);
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
export function jsxSlicesAnalyze(): Visitor {
  return {
    JSXElement(path: NodePath<t.JSXElement>, ctx) {
      const name = genNameFromJSX(path, ctx);
      replaceJSXSliceWithSubComp(name, ctx, path);
      path.skip();
    },
    JSXFragment(path: NodePath<t.JSXFragment>, ctx) {
      replaceJSXSliceWithSubComp('frag', ctx, path);
    },
  };
}

// Analyze the JSX slice in the function component, including:
// 1. VariableDeclaration, like `const a = <div />`
// 2. SubComponent, like `function Sub() { return <div /> }`
function handleFn(fnName: string, fnBody: NodePath<types.BlockStatement>) {
  if (isValidComponentName(fnName)) {
    // This is a subcomponent, treat it as a normal component
  } else {
    //   This is jsx creation function
    //   function jsxFunc() {
    //     // This is a function that returns JSX
    //     // because the function name is smallCamelCased
    //     return <div>{count}</div>
    //   }
    //   =>
    //   function jsxFunc() {
    //     function Comp_$id4$() {
    //       return <div>{count}</div>
    //     }
    //     // This is a function that returns JSX
    //     // because the function name is smallCamelCased
    //     return <Comp_$id4$/>
    //   }
  }
}
