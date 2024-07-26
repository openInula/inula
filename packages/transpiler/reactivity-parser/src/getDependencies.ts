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

import type { NodePath } from '@babel/core';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { Bitmap } from './types';

export type Dependency = {
  dependenciesNode: t.ArrayExpression;
  /**
   * Only contains the bit of direct dependencies and not contains the bit of used variables
   * So it's configured in pruneUnusedBit.ts
   */
  depMask?: Bitmap;
  /**
   * The bitmap of each dependency
   */
  allDepBits: Bitmap[];
};

/**
 * @brief Get all valid dependencies of a babel path
 * @returns
 * @param node
 * @param reactiveMap
 * @param reactivityFuncNames
 */
export function getDependenciesFromNode(
  node: t.Expression | t.Statement,
  reactiveMap: Map<string, Bitmap | Bitmap[]>,
  reactivityFuncNames: string[]
): Dependency {
  // ---- Deps: console.log(count)
  const depBitmaps: number[] = [];
  // ---- Assign deps: count = 1 or count++
  let assignDepMask = 0;
  const depNodes: Record<string, t.Node[]> = {};
  const wrappedNode = valueWrapper(node);

  getBabelApi().traverse(wrappedNode, {
    Identifier: (innerPath: NodePath<t.Identifier>) => {
      const propertyKey = innerPath.node.name;
      const reactiveBitmap = reactiveMap.get(propertyKey);

      if (reactiveBitmap !== undefined) {
        if (isAssignmentExpressionLeft(innerPath) || isAssignmentFunction(innerPath, reactivityFuncNames)) {
          // write
          assignDepMask |= Array.isArray(reactiveBitmap)
            ? reactiveBitmap.reduce((acc, cur) => acc | cur, 0)
            : reactiveBitmap;
        } else if (
          (isStandAloneIdentifier(innerPath) && !isMemberInUntrackFunction(innerPath)) ||
          isMemberOfMemberExpression(innerPath)
        ) {
          // read
          if (Array.isArray(reactiveBitmap)) {
            depBitmaps.push(...reactiveBitmap);
          } else {
            depBitmaps.push(reactiveBitmap);
          }

          if (!depNodes[propertyKey]) depNodes[propertyKey] = [];
          depNodes[propertyKey].push(geneDependencyNode(innerPath));
        }
      }
    },
  });

  const fullDepMask = depBitmaps.reduce((acc, cur) => acc | cur, 0);
  // ---- Eliminate deps that are assigned in the same method
  //      e.g. { console.log(count); count = 1 }
  //      this will cause infinite loop
  //      so we eliminate "count" from deps
  if (assignDepMask & fullDepMask) {
    // TODO: We should throw an error here to indicate the user that there is a loop
  }

  // deduplicate the dependency nodes
  let dependencyNodes = Object.values(depNodes).flat();
  // ---- deduplicate the dependency nodes
  dependencyNodes = dependencyNodes.filter((n, i) => {
    const idx = dependencyNodes.findIndex(m => t.isNodesEquivalent(m, n));
    return idx === i;
  });

  return {
    dependenciesNode: t.arrayExpression(dependencyNodes as t.Expression[]),
    allDepBits: depBitmaps,
  };
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
 * @param reactivityFuncNames
 * @returns
 */
function isAssignmentFunction(innerPath: NodePath, reactivityFuncNames: string[]): boolean {
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

function valueWrapper(node: t.Expression | t.Statement): t.File {
  return t.file(t.program([t.isStatement(node) ? node : t.expressionStatement(node)]));
}

/**
 * @brief Generate a dependency node from a dependency identifier,
 *  loop until the parent node is not a binary expression or a member expression
 *  And turn the member expression into an optional member expression, like info.name -> info?.name
 * @param path
 * @returns
 */
function geneDependencyNode(path: NodePath): t.Node {
  let parentPath = path;
  while (parentPath?.parentPath) {
    const pParentPath = parentPath.parentPath;
    if (
      !(t.isMemberExpression(pParentPath.node, { computed: false }) || t.isOptionalMemberExpression(pParentPath.node))
    ) {
      break;
    }
    parentPath = pParentPath;
  }
  const depNode = t.cloneNode(parentPath.node);
  // ---- Turn memberExpression to optionalMemberExpression
  getBabelApi().traverse(valueWrapper(depNode as t.Expression), {
    MemberExpression: innerPath => {
      if (t.isThisExpression(innerPath.node.object)) return;
      innerPath.node.optional = true;
      innerPath.node.type = 'OptionalMemberExpression' as any;
    },
  });
  return depNode;
}

function isMemberInUntrackFunction(innerPath: NodePath): boolean {
  let isInFunction = false;
  let reversePath = innerPath.parentPath;
  while (reversePath) {
    const node = reversePath.node;
    if (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      ['untrack', '$$untrack'].includes(node.callee.name)
    ) {
      isInFunction = true;
      break;
    }
    reversePath = reversePath.parentPath;
  }
  return isInFunction;
}

function isMemberOfMemberExpression(innerPath: NodePath): boolean {
  if (innerPath.parentPath === null) {
    return false;
  }
  return innerPath.parentPath.isMemberExpression() && innerPath.parentPath.node.property === innerPath.node;
}

/**
 * @brief Check if an identifier is a simple stand alone identifier,
 *  i.e., not a member expression, nor a function param
 * @param path
 *  1. not a member expression
 *  2. not a function param
 *  3. not in a declaration
 *  4. not as object property's not computed key
 * @returns is a standalone identifier
 */
function isStandAloneIdentifier(path: NodePath<t.Identifier>): boolean {
  const node = path.node;
  const parentNode = path.parentPath?.node;
  const isMemberExpression = t.isMemberExpression(parentNode) && parentNode.property === node;
  if (isMemberExpression) return false;
  const isFunctionParam = isAttrFromFunction(path, node.name);
  if (isFunctionParam) return false;
  while (path.parentPath) {
    if (t.isVariableDeclarator(path.parentPath.node)) return false;
    if (
      t.isObjectProperty(path.parentPath.node) &&
      path.parentPath.node.key === path.node &&
      !path.parentPath.node.computed
    )
      return false;
    path = path.parentPath as NodePath<t.Identifier>;
  }
  return true;
}

/**
 * @brief check if the identifier is from a function param till the stopNode
 *  e.g:
 *  function myFunc1(ok) { // stopNode = functionBody
 *     const myFunc2 = ok => ok // from function param
 *     console.log(ok) // not from function param
 *  }
 */
function isAttrFromFunction(path: NodePath, idName: string) {
  let reversePath = path.parentPath;

  function checkParam(param: t.Node): boolean {
    // ---- 3 general types:
    //      * represent allow nesting
    // ---0 Identifier: (a)
    // ---1 RestElement: (...a)   *
    // ---1 Pattern: 3 sub Pattern
    // -----0   AssignmentPattern: (a=1)   *
    // -----1   ArrayPattern: ([a, b])   *
    // -----2   ObjectPattern: ({a, b})
    if (t.isIdentifier(param)) return param.name === idName;
    if (t.isAssignmentPattern(param)) return checkParam(param.left);
    if (t.isArrayPattern(param)) {
      return param.elements
        .filter(Boolean)
        .map(el => checkParam(el!))
        .includes(true);
    }
    if (t.isObjectPattern(param)) {
      return (
        param.properties.filter(prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key)) as t.ObjectProperty[]
      )
        .map(prop => (prop.key as t.Identifier).name)
        .includes(idName);
    }
    if (t.isRestElement(param)) return checkParam(param.argument);

    return false;
  }

  while (reversePath) {
    const node = reversePath.node;
    if (t.isArrowFunctionExpression(node) || t.isFunctionDeclaration(node)) {
      for (const param of node.params) {
        if (checkParam(param)) return true;
      }
    }
    reversePath = reversePath.parentPath;
  }

  return false;
}
