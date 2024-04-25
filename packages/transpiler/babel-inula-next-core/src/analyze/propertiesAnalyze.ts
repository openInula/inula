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

import { AnalyzeContext, Visitor } from './types';
import { addMethod, addProperty, createComponentNode } from './nodeFactory';
import { isValidPath } from './utils';
import { type types as t, type NodePath } from '@babel/core';
import { reactivityFuncNames } from '../const';
import { types } from '../babelTypes';
import { COMPONENT } from '../constants';
import { analyzeFnComp } from '.';

/**
 * collect all properties and methods from the node
 * and analyze the dependencies of the properties
 * @returns
 */
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
          // --- properties: the state / computed / plain properties / methods---
          const init = declaration.get('init');
          let deps: string[] | null = null;
          if (isValidPath(init)) {
            // the property is a method
            if (init.isArrowFunctionExpression() || init.isFunctionExpression()) {
              addMethod(ctx.current, id.node.name, init.node);
              return;
            }
            // Should like Component(() => {})
            if (
              init.isCallExpression() &&
              init.get('callee').isIdentifier() &&
              (init.get('callee').node as t.Identifier).name === COMPONENT &&
              (init.get('arguments')[0].isFunctionExpression() || init.get('arguments')[0].isArrowFunctionExpression())
            ) {
              const fnNode = init.get('arguments')[0] as
                | NodePath<t.ArrowFunctionExpression>
                | NodePath<t.FunctionExpression>;
              const subComponent = createComponentNode(id.node.name, fnNode, ctx.current);

              analyzeFnComp(fnNode, subComponent, ctx);
              deps = getDependenciesFromNode(id.node.name, init, ctx);
              addProperty(ctx.current, id.node.name, subComponent, !!deps?.length);
              return;
            }
            deps = getDependenciesFromNode(id.node.name, init, ctx);
          }
          addProperty(ctx.current, id.node.name, init.node || null, !!deps?.length);
        }
      });
    },
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>, { current }) {
      const fnId = path.node.id;
      if (!fnId) {
        throw new Error('Function declaration must have an id');
      }

      const functionExpression = types.functionExpression(
        path.node.id,
        path.node.params,
        path.node.body,
        path.node.generator,
        path.node.async
      );
      addMethod(current, fnId.name, functionExpression);
    },
  };
}

/**
 * @brief Get all valid dependencies of a babel path
 * @param propertyKey
 * @param path
 * @param ctx
 * @returns
 */
function getDependenciesFromNode(
  propertyKey: string,
  path: NodePath<t.Expression | t.ClassDeclaration>,
  { current }: AnalyzeContext
) {
  // ---- Deps: console.log(this.count)
  const deps = new Set<string>();
  // ---- Assign deps: this.count = 1 / this.count++
  const assignDeps = new Set<string>();
  const visitor = (innerPath: NodePath<t.Identifier>) => {
    const propertyKey = innerPath.node.name;
    if (isAssignmentExpressionLeft(innerPath) || isAssignmentFunction(innerPath)) {
      assignDeps.add(propertyKey);
    } else if (current.availableProperties.includes(propertyKey)) {
      deps.add(propertyKey);
    }
  };
  if (path.isIdentifier()) {
    visitor(path);
  }
  path.traverse({
    Identifier: visitor,
  });

  // ---- Eliminate deps that are assigned in the same method
  //      e.g. { console.log(this.count); this.count = 1 }
  //      this will cause infinite loop
  //      so we eliminate "count" from deps
  assignDeps.forEach(dep => {
    deps.delete(dep);
  });

  const depArr = [...deps];
  if (deps.size > 0) {
    current.dependencyMap[propertyKey] = depArr;
  }

  return depArr;
}

/**
 * @brief Check if it's the left side of an assignment expression, e.g. count = 1
 * @param innerPath
 * @returns assignment expression
 */
function isAssignmentExpressionLeft(innerPath: NodePath): NodePath | null {
  let parentPath = innerPath.parentPath;
  while (parentPath && !parentPath.isStatement()) {
    if (parentPath.isAssignmentExpression()) {
      if (parentPath.node.left === innerPath.node) return parentPath;
      const leftPath = parentPath.get('left') as NodePath;
      if (innerPath.isDescendant(leftPath)) return parentPath;
    } else if (parentPath.isUpdateExpression()) {
      return parentPath;
    }
    parentPath = parentPath.parentPath;
  }

  return null;
}

/**
 * @brief Check if it's a reactivity function, e.g. arr.push
 * @param innerPath
 * @returns
 */
function isAssignmentFunction(innerPath: NodePath): boolean {
  let parentPath = innerPath.parentPath;

  while (parentPath && parentPath.isMemberExpression()) {
    parentPath = parentPath.parentPath;
  }
  if (!parentPath) return false;
  return (
    parentPath.isCallExpression() &&
    parentPath.get('callee').isIdentifier() &&
    reactivityFuncNames.includes((parentPath.get('callee').node as t.Identifier).name)
  );
}
