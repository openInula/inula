import { type types as t, NodePath } from '@babel/core';
import * as babel from '@babel/core';
import { Option } from './types';
import type { Scope } from '@babel/traverse';

const DECORATOR_PROPS = 'Prop';
const DECORATOR_CHILDREN = 'Children';
const DECORATOR_WATCH = 'Watch';

function replaceFnWithClass(path: NodePath<t.FunctionDeclaration>, classTransformer: ClassComponentTransformer) {
  const originalName = path.node.id.name;
  const tempName = path.node.id.name + 'Temp';
  const classComp = classTransformer.genClassComponent(tempName);
  path.replaceWith(classComp);
  path.scope.rename(tempName, originalName);
}

export class PluginProvider {
  // ---- Plugin Level ----
  private readonly babelApi: typeof babel;
  private readonly t: typeof t;

  private programNode: t.Program | undefined;

  constructor(babelApi: typeof babel, options: Option) {
    this.babelApi = babelApi;
    this.t = babelApi.types;
  }

  functionDeclarationVisitor(path: NodePath<t.FunctionDeclaration>): void {
    // find Component function by:
    // 1. has JSXElement as return value
    // 2. name is capitalized
    if (path.node.id?.name[0] !== path.node.id?.name[0].toUpperCase()) return;
    const returnStatement = path.node.body.body.find(n => this.t.isReturnStatement(n)) as t.ReturnStatement;
    if (!returnStatement) return;
    if (!(this.t.isJSXElement(returnStatement.argument) || this.t.isJSXFragment(returnStatement.argument))) return;
    const classTransformer = new ClassComponentTransformer(this.babelApi, path);
    // transform the parameters to props
    const params = path.node.params;
    const props = params[0];
    classTransformer.transformProps(props);
    // iterate the function body orderly
    const body = path.node.body.body;
    body.forEach((node, idx) => {
      if (this.t.isVariableDeclaration(node)) {
        classTransformer.transformStateDeclaration(node);
        return;
      }
      // handle method
      if (this.t.isFunctionDeclaration(node)) {
        classTransformer.transformMethods(node);
        return;
      }

      // ---- handle lifecycles
      const lifecycles = ['willMount', 'didMount', 'willUnmount', 'didUnmount'];
      if (this.t.isLabeledStatement(node) && lifecycles.includes(node.label.name)) {
        // transform the lifecycle statement to lifecycle method
        classTransformer.transformLifeCycle(node);
        return;
      }

      // handle watch
      if (this.t.isLabeledStatement(node) && node.label.name === 'watch') {
        // transform the watch statement to watch method
        classTransformer.transformWatch(node);
        return;
      }

      // handle return statement
      if (this.t.isReturnStatement(node)) {
        // handle early return
        if (idx !== body.length - 1) {
          // transform the return statement to render method
          // TODO: handle early return
          throw new Error('Early return is not supported yet.');
        }
        // transform the return statement to render method
        classTransformer.transformRenderMethod(node);
        return;
      }
    });

    // replace the function declaration with class declaration
    replaceFnWithClass(path, classTransformer);
  }
}

type ToWatchNode =
  | t.ExpressionStatement
  | t.ForStatement
  | t.WhileStatement
  | t.IfStatement
  | t.SwitchStatement
  | t.TryStatement;

class ClassComponentTransformer {
  properties: (t.ClassProperty | t.ClassMethod)[] = [];
  // The expression to bind the nested destructuring props with prop
  nestedDestructuringBindings: t.Expression[] = [];
  private readonly babelApi: typeof babel;
  private readonly t: typeof t;
  private readonly functionScope: Scope;

  valueWrapper(node) {
    return this.t.file(this.t.program([this.t.isStatement(node) ? node : this.t.expressionStatement(node)]));
  }

  addProperty(prop: t.ClassProperty | t.ClassMethod, name?: string) {
    this.properties.push(prop);
  }

  constructor(babelApi: typeof babel, fnNode: NodePath<t.FunctionDeclaration>) {
    this.babelApi = babelApi;
    this.t = babelApi.types;
    // get the function body scope
    this.functionScope = fnNode.scope;
  }

  // transform function component to class component extends View
  genClassComponent(name: string) {
    // generate ctor and push this.initExpressions to ctor
    let nestedDestructuringBindingsMethod: t.ClassMethod | null = null;
    if (this.nestedDestructuringBindings.length) {
      nestedDestructuringBindingsMethod = this.t.classMethod(
        'method',
        this.t.identifier('$$bindNestDestructuring'),
        [],
        this.t.blockStatement([...this.nestedDestructuringBindings.map(exp => this.t.expressionStatement(exp))])
      );
      nestedDestructuringBindingsMethod.decorators = [this.t.decorator(this.t.identifier(DECORATOR_WATCH))];
    }
    return this.t.classDeclaration(
      this.t.identifier(name),
      this.t.identifier('View'),
      this.t.classBody(
        nestedDestructuringBindingsMethod ? [...this.properties, nestedDestructuringBindingsMethod] : this.properties
      ),
      []
    );
  }

  /**
   * Transform state declaration to class property
   * if the variable is declared with `let` or `const`, it should be transformed to class property
   * @param node
   */
  transformStateDeclaration(node: t.VariableDeclaration) {
    // iterate the declarations
    node.declarations.forEach(declaration => {
      const id = declaration.id;
      // handle destructuring
      if (this.t.isObjectPattern(id)) {
        return this.transformPropsDestructuring(id);
      } else if (this.t.isArrayPattern(id)) {
        // TODO: handle array destructuring
      } else if (this.t.isIdentifier(id)) {
        // clone the id
        const cloneId = this.t.cloneNode(id);
        this.addProperty(this.t.classProperty(cloneId, declaration.init), id.name);
      }
    });
  }

  /**
   * Transform render method to Body method
   * The Body method should return the original return statement
   * @param node
   */
  transformRenderMethod(node: t.ReturnStatement) {
    const body = this.t.classMethod(
      'method',
      this.t.identifier('Body'),
      [],
      this.t.blockStatement([node]),
      false,
      false
    );
    this.addProperty(body, 'Body');
  }

  transformLifeCycle(node: t.LabeledStatement) {
    // transform the lifecycle statement to lifecycle method
    const methodName = node.label.name;
    const method = this.t.classMethod(
      'method',
      this.t.identifier(methodName),
      [],
      this.t.blockStatement(node.body.body),
      false,
      false
    );
    this.addProperty(method, methodName);
  }

  transformComputed() {}

  transformMethods(node: t.FunctionDeclaration) {
    // transform the function declaration to class method
    const methodName = node.id?.name;
    if (!methodName) return;
    const method = this.t.classMethod(
      'method',
      this.t.identifier(methodName),
      node.params,
      node.body,
      node.generator,
      node.async
    );
    this.addProperty(method, methodName);
  }

  transformProps(param: t.Identifier | t.RestElement | t.Pattern) {
    if (!param) return;
    // handle destructuring
    if (this.isObjDestructuring(param)) {
      this.transformPropsDestructuring(param);
      return;
    }
    if (this.t.isIdentifier(param)) {
      // TODO: handle props identifier
      return;
    }
    throw new Error('Unsupported props type, please use object destructuring or identifier.');
  }

  /**
   * transform node to watch label to watch decorator
   * e.g.
   *
   * watch: console.log(state)
   * // transform into
   * @Watch
   * _watch() {
   *   console.log(state)
   * }
   */
  transformWatch(node: t.LabeledStatement) {
    const id = this.functionScope.generateUidIdentifier(DECORATOR_WATCH.toLowerCase());
    const method = this.t.classMethod('method', id, [], this.t.blockStatement([node.body]), false, false);
    method.decorators = [this.t.decorator(this.t.identifier(DECORATOR_WATCH))];
    this.addProperty(method);
  }

  private isObjDestructuring(param: t.Identifier | t.RestElement | t.Pattern): param is t.ObjectPattern {
    return this.t.isObjectPattern(param);
  }

  /**
   *  how to handle default value
   *  ```js
   *  // 1. No alias
   *  function({name = 'defaultName'}) {}
   *  class A extends View {
   *    @Prop name = 'defaultName';
   *
   *  // 2. Alias
   *  function({name: aliasName = 'defaultName'}) {}
   *  class A extends View {
   *   @Prop name = 'defaultName';
   *   aliasName
   *   @Watch
   *   bindAliasName() {
   *     this.aliasName = this.name;
   *   }
   *  }
   *
   *  // 3. Children with default value and alias
   *  function({children: aliasName = 'defaultName'}) {}
   *  class A extends View {
   *    @Children aliasName = 'defaultName';
   *  }
   * ```
   */
  private transformPropsDestructuring(param: t.ObjectPattern) {
    const propNames: t.Identifier[] = [];
    param.properties.forEach(prop => {
      if (this.t.isObjectProperty(prop)) {
        let key = prop.key;
        let defaultVal: t.Expression;
        if (this.t.isIdentifier(key)) {
          let alias: t.Identifier | null = null;
          if (this.t.isAssignmentPattern(prop.value)) {
            const propName = prop.value.left;
            defaultVal = prop.value.right;
            if (this.t.isIdentifier(propName)) {
              // handle alias
              if (propName.name !== key.name) {
                alias = propName;
              }
            } else {
              throw Error(`Unsupported assignment type in object destructuring: ${propName.type}`);
            }
          } else if (this.t.isIdentifier(prop.value)) {
            // handle alias
            if (key.name !== prop.value.name) {
              alias = prop.value;
            }
          } else if (this.t.isObjectPattern(prop.value)) {
            // TODO: handle nested destructuring
            this.transformPropsDestructuring(prop.value);
          }

          const isChildren = key.name === 'children';
          if (alias) {
            if (isChildren) {
              key = alias;
            } else {
              this.addClassPropertyForPropAlias(alias, key);
            }
          }
          this.addClassProperty(key, isChildren ? DECORATOR_CHILDREN : DECORATOR_PROPS, defaultVal);
          propNames.push(key);
          return;
        }

        // handle default value
        if (this.t.isAssignmentPattern(prop.value)) {
          const defaultValue = prop.value.right;
          const propName = prop.value.left;
          //handle alias
          if (this.t.isIdentifier(propName) && propName.name !== prop.key.name) {
            this.addClassProperty(propName, null, undefined);
          }

          if (this.t.isIdentifier(propName)) {
            this.addClassProperty(propName, DECORATOR_PROPS, defaultValue);
            propNames.push(propName);
          }
          // TODO: handle nested destructuring
          return;
        }
        throw new Error('Unsupported props destructuring, please use simple object destructuring.');
      } else {
        // TODO: handle rest element
      }
    });

    return propNames;
  }

  private addClassPropertyForPropAlias(propName: t.Identifier, key: t.Identifier) {
    // handle alias, like class A { foo: bar = 'default' }
    this.addClassProperty(propName, null, undefined);
    // push alias assignment in Watch , like this.bar = this.foo
    this.nestedDestructuringBindings.push(
      this.t.assignmentExpression('=', this.t.identifier(propName.name), this.t.identifier(key.name))
    );
  }

  // add prop to class, like @prop name = '';
  private addClassProperty(key: t.Identifier, decorator: string | null, defaultValue?: t.Expression) {
    // clone the key to avoid reference issue
    const id = this.t.cloneNode(key);
    this.addProperty(
      this.t.classProperty(
        id,
        defaultValue ?? undefined,
        undefined,
        // use prop decorator
        decorator ? [this.t.decorator(this.t.identifier(decorator))] : undefined,
        undefined,
        false
      ),
      key.name
    );
  }

  /**
   * Check if the node should be transformed to watch method, including:
   * 1. call expression.
   * 2. for loop
   * 3. while loop
   * 4. if statement
   * 5. switch statement
   * 6. assignment expression
   * 7. try statement
   * 8. ++/-- expression
   * @param node
   */
  shouldTransformWatch(node: t.Node): node is ToWatchNode {
    if (this.t.isExpressionStatement(node)) {
      if (this.t.isCallExpression(node.expression)) {
        return true;
      }
      if (this.t.isAssignmentExpression(node.expression)) {
        return true;
      }
      if (this.t.isUpdateExpression(node.expression)) {
        return true;
      }
    }
    if (this.t.isForStatement(node)) {
      return true;
    }
    if (this.t.isWhileStatement(node)) {
      return true;
    }
    if (this.t.isIfStatement(node)) {
      return true;
    }
    if (this.t.isSwitchStatement(node)) {
      return true;
    }
    if (this.t.isTryStatement(node)) {
      return true;
    }

    return false;
  }
}
