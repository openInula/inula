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

import { Visitor } from './types';
import { addMethod, addState } from './nodeFactory';
import { hasJSX, isValidComponentName, isValidPath } from './utils';
import { jsxSlicesAnalyze } from './jsxSliceAnalyze';
import * as t from '@babel/types';

// Analyze the JSX slice in the function component, including:
// 1. VariableDeclaration, like `const a = <div />`
// 2. SubComponent, like `function Sub() { return <div /> }`
function handleFn(fnName: string, fnBody: NodePath<t.BlockStatement>) {
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

// 3. jsx creation function, like `function create() { return <div /> }`
export function propertiesAnalyze(): Visitor {
  return {
    VariableDeclaration(path: NodePath<t.VariableDeclaration>, ctx) {
      const declarations = path.get('declarations');
      // iterate the declarations
      declarations.forEach(declaration => {
        const id = declaration.get('id');
        // handle destructuring
        if (id.isObjectPattern()) {
          throw new Error('Object destructuring is not supported yet');
        } else if (id.isArrayPattern()) {
          // TODO: handle array destructuring
          throw new Error('Array destructuring is not supported yet');
        } else if (id.isIdentifier()) {
          const init = declaration.get('init');
          if (isValidPath(init) && hasJSX(init)) {
            if (init.isArrowFunctionExpression()) {
              const fnName = id.node.name;
              const fnBody = init.get('body');

              // handle case like `const jsxFunc = () => <div />`
              if (fnBody.isExpression()) {
                // turn expression into block statement for consistency
                fnBody.replaceWith(t.blockStatement([t.returnStatement(fnBody.node)]));
              }

              // We switched to the block statement above, so we can safely call handleFn
              handleFn(fnName, fnBody as NodePath<t.BlockStatement>);
            }
            // handle jsx slice
            ctx.traverse(path, ctx);
          }
          addState(ctx.currentComponent, id.node.name, declaration.node.init || null);
        }
      });
    },
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>, ctx) {
      const fnId = path.node.id;
      if (!fnId) {
        // This is an anonymous function, collect into lifecycle
        //TODO
        return;
      }

      if (!hasJSX(path)) {
        // This is a normal function, collect into methods
        addMethod(ctx.currentComponent, path);
        return;
      }

      handleFn(fnId.name, path.get('body'));
    },
  };
}
