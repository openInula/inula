import { type types as t, NodePath } from '@babel/core';
import * as babel from '@babel/core';

export class ThisPatcher {
  private readonly babelApi: typeof babel;
  private readonly t: typeof t;

  private programNode: t.Program | undefined;

  constructor(babelApi: typeof babel) {
    this.babelApi = babelApi;
    this.t = babelApi.types;
  }

  patch = (classPath: NodePath<t.Class>) => {
    const classBodyNode = classPath.node.body;
    const availPropNames = classBodyNode.body
      .filter(
        (def): def is Exclude<t.ClassBody['body'][number], t.TSIndexSignature | t.StaticBlock> =>
          !this.t.isTSIndexSignature(def) && !this.t.isStaticBlock(def)
      )
      .map(def => ('name' in def.key ? def.key.name : null));

    for (const memberOrMethod of classBodyNode.body) {
      classPath.scope.traverse(memberOrMethod, {
        Identifier: (path: NodePath<t.Identifier>) => {
          const idNode = path.node;
          if ('key' in memberOrMethod && idNode === memberOrMethod.key) return;
          const idName = idNode.name;
          if (
            availPropNames.includes(idName) &&
            !this.isMemberExpression(path) &&
            !this.isVariableDeclarator(path) &&
            !this.isAttrFromFunction(path, idName, memberOrMethod) &&
            !this.isObjectKey(path)
          ) {
            path.replaceWith(this.t.memberExpression(this.t.thisExpression(), this.t.identifier(idName)));
            path.skip();
          }
        },
      });
    }
  };

  /**
   * check if the identifier is from a function param, e.g:
   * class MyClass {
   *  ok = 1
   *  myFunc1 = () => ok // change to myFunc1 = () => this.ok
   *  myFunc2 = ok => ok // don't change !!!!
   * }
   */
  isAttrFromFunction(path: NodePath<t.Identifier>, idName: string, stopNode: t.ClassBody['body'][number]) {
    let reversePath = path.parentPath;

    const checkParam = (param: t.Node): boolean => {
      // ---- 3 general types:
      //      * represent allow nesting
      // ---0 Identifier: (a)
      // ---1 RestElement: (...a)   *
      // ---1 Pattern: 3 sub Pattern
      // -----0   AssignmentPattern: (a=1)   *
      // -----1   ArrayPattern: ([a, b])   *
      // -----2   ObjectPattern: ({a, b})
      if (this.t.isIdentifier(param)) return param.name === idName;
      if (this.t.isAssignmentPattern(param)) return checkParam(param.left);
      if (this.t.isArrayPattern(param)) {
        return param.elements.map(el => checkParam(el)).includes(true);
      }
      if (this.t.isObjectPattern(param)) {
        return param.properties.map((prop: any) => prop.key.name).includes(idName);
      }
      if (this.t.isRestElement(param)) return checkParam(param.argument);

      return false;
    };

    while (reversePath && reversePath.node !== stopNode) {
      const node = reversePath.node;
      if (this.t.isArrowFunctionExpression(node) || this.t.isFunctionDeclaration(node)) {
        for (const param of node.params) {
          if (checkParam(param)) return true;
        }
      }
      reversePath = reversePath.parentPath;
    }
    if (this.t.isClassMethod(stopNode)) {
      for (const param of stopNode.params) {
        if (checkParam(param)) return true;
      }
    }
    return false;
  }

  /**
   * check if the identifier is already like `this.a` / `xx.a` but not like `a.xx` / xx[a]
   */
  isMemberExpression(path: NodePath<t.Identifier>) {
    const parentNode = path.parentPath.node;
    return this.t.isMemberExpression(parentNode) && parentNode.property === path.node && !parentNode.computed;
  }

  /**
   * check if the identifier is a variable declarator like `let a = 1` `for (let a in array)`
   */
  isVariableDeclarator(path: NodePath<t.Identifier>) {
    const parentNode = path.parentPath.node;
    return this.t.isVariableDeclarator(parentNode) && parentNode.id === path.node;
  }

  isObjectKey(path: NodePath<t.Identifier>) {
    const parentNode = path.parentPath.node;
    return this.t.isObjectProperty(parentNode) && parentNode.key === path.node;
  }
}
