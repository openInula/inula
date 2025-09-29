import * as vscode from 'vscode';

export class ASTTraversal {
  private readonly _keysToRemove = new Set([
    'loc', 'extra', 'leadingComments', 'trailingComments', 'innerComments',
    'parent', 'hub', 'scope', 'file', 'path', 'node',
    'parentPath', 'fnNode', '_traverseFlags', 'skipKeys', 'contexts', 'opts',
    '_exploded', '_verified', 'shorthand', 'computed', 'decorators',
    'interpreter', 'sourceType', 'errors', 'id', 'generator', 'async'
  ]);
  //根据偏移量查找最精确匹配的节点及其作用域
  public findNodeAndScopeAtOffset(
    rootNode: any,
    offset: number,
    initialScope: Map<string, any> = new Map()
  ): { node: any; scope: Map<string, any> } | null {
    let bestMatch: { node: any; scope: Map<string, any> } | null = null;
    let smallestRange = Infinity;

    const traverse = (node: any, scope: Map<string, any>, visited = new Set<any>()): Map<string, any> => {
        if (!node || typeof node !== 'object' || visited.has(node)) {
            return scope;
        }
        visited.add(node);

        // 1. 为当前节点上下文创建作用域，并添加其内部的声明
        let currentScope = new Map(scope);
        const declarations = this.getDeclarationsInNode(node);
        for (const decl of declarations) {
            currentScope.set(decl.name, decl.node);
        }

        // 2. 检查当前节点是否是最佳匹配
        if (node.start !== undefined && node.end !== undefined) {
            if (offset >= node.start && offset <= node.end) {
                const nodeRange = node.end - node.start;
                if (nodeRange < smallestRange) {
                    smallestRange = nodeRange;
                    bestMatch = { node: node, scope: currentScope };
                }
            }
        }

        // 3. 递归遍历子节点，并持续更新作用域
        let keysToTraverse: string[];

        if (node.type === 'comp') {
            keysToTraverse = ['fnNode', 'viewReturn'].filter(k => node[k]);
        } else {
            const prioritizedKeys = ['body', 'value', 'content', 'properties', 'arguments', 'elements', 'declarations', 'params'];
            keysToTraverse = [
                ...prioritizedKeys,
                ...Object.keys(node).filter(k => !this._keysToRemove.has(k) && !prioritizedKeys.includes(k))
            ];
        }

        let scopeForChildren = currentScope;
        for (const key of keysToTraverse) {
            if (node[key]) {
                const child = node[key];
                if (Array.isArray(child)) {
                    for (const item of child) {
                        scopeForChildren = traverse(item, scopeForChildren, new Set(visited));
                    }
                } else if (typeof child === 'object') {
                    const isFunction = child.type === 'ArrowFunctionExpression' || child.type === 'FunctionExpression' || child.type === 'FunctionDeclaration';
                    if (isFunction) {
                        traverse(child, scopeForChildren, new Set(visited));
                    } else {
                        scopeForChildren = traverse(child, scopeForChildren, new Set(visited));
                    }
                }
            }
        }
        
        // 4. 返回处理完所有子节点后的最终作用域
        return scopeForChildren;
    };

    traverse(rootNode, initialScope);
    return bestMatch;
  }
  //从给定的 AST 节点中提取所有声明
  public getDeclarationsInNode(node: any): { name: string, node: any }[] {
    const declarations: { name: string, node: any }[] = [];
    
    if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations || []) {
            if (!decl.kind) {
                decl.kind = node.kind;
            }
            if (decl.id.type === 'Identifier') {
                declarations.push({ name: decl.id.name, node: decl });
            } else if (decl.id.type === 'ArrayPattern') {
                for (const element of decl.id.elements) {
                    if (element?.type === 'Identifier') {
                        declarations.push({ name: element.name, node: decl });
                    }
                }
            }
        }
    }
    else if (node.params) {
        for (const param of node.params) {
            if (param.type === 'Identifier') {
                declarations.push({ name: param.name, node: param });
            }
        }
    }
    else if ((node.type === 'raw' || node.type === 'init') && node.value) {
        return this.getDeclarationsInNode(node.value);
    }
    else if (node.type === 'comp' && node.fnNode?.node?.params) {
        for (const param of node.fnNode.node.params) {
             if (param.type === 'Identifier') {
                declarations.push({ name: param.name, node: param });
            }
        }
    }

    return declarations;
  }
  //查找作为给定子节点的父级的 MemberExpression 节点
  public findMemberExpressionParent(root: any, child: any): any | null {
    let foundParent: any = null;
    if (!root || !child) {return null;}

    const visited = new Set();
    const traverse = (node: any) => {
        if (!node || typeof node !== 'object' || visited.has(node)) {
            return;
        }
        visited.add(node);

        if (foundParent) {return;}

        if (node.type === 'MemberExpression' && (node.property === child || node.object === child)) {
            foundParent = node;
            return;
        }

        for (const key of Object.keys(node)) {
            if (this._keysToRemove.has(key)) {continue;}
            const value = node[key];
            if (Array.isArray(value)) {
                for(const item of value) {traverse(item);}
            } else if (value && typeof value === 'object') {
                traverse(value);
            }
        }
    };

    traverse(root);
    return foundParent;
  }
  //在组件中查找从目标变量派生的所有值
  public findDerivedValues(targetName: string, originalDeclaration: any, componentNode: any): string[] {
    const derivedValues: string[] = [];
    if (!originalDeclaration) {
        return [];
    }

    const visited = new Set<any>();

    const traverse = (node: any, scope: Map<string, any>): Map<string, any> => {
        if (!node || typeof node !== 'object' || visited.has(node)) {
            return scope;
        }
        visited.add(node);

        let currentScope = new Map(scope);
        const declarations = this.getDeclarationsInNode(node);
        for (const decl of declarations) {
            currentScope.set(decl.name, decl.node);
        }

        if (node.type === 'VariableDeclarator' && node.init && node.id.type === 'Identifier' && node.id.name !== targetName) {
            const usesTarget = this.expressionContainsIdentifier(node.init, targetName, originalDeclaration, currentScope, new Set());
            if (usesTarget) {
                derivedValues.push(`\`${node.id.name}\``);
            }
        }

        let keysToTraverse: string[];
        if (node.type === 'comp') {
            keysToTraverse = ['fnNode', 'viewReturn'].filter(k => node[k]);
        } else {
            const prioritizedKeys = ['body', 'value', 'content', 'properties', 'arguments', 'elements', 'declarations', 'params'];
            keysToTraverse = [
                ...prioritizedKeys,
                ...Object.keys(node).filter(k => !this._keysToRemove.has(k) && !prioritizedKeys.includes(k))
            ];
        }

        let scopeForChildren = currentScope;
        for (const key of keysToTraverse) {
            if (node[key]) {
                const child = node[key];
                if (Array.isArray(child)) {
                    for (const item of child) {
                        scopeForChildren = traverse(item, scopeForChildren);
                    }
                } else if (typeof child === 'object') {
                    const isFunction = ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration'].includes(child.type);
                    if (isFunction) {
                        traverse(child, scopeForChildren);
                    } else {
                        scopeForChildren = traverse(child, scopeForChildren);
                    }
                }
            }
        }
        return scopeForChildren;
    };

    traverse(componentNode, new Map());
    return [...new Set(derivedValues)];
  }
  //检查表达式是否包含对特定标识符的引用
  public expressionContainsIdentifier(
    expressionNode: any,
    targetName: string,
    originalDeclaration: any,
    scope: Map<string, any>,
    visited: Set<any>
  ): boolean {
    if (!expressionNode || typeof expressionNode !== 'object' || visited.has(expressionNode)) {
        return false;
    }
    visited.add(expressionNode);

    if (expressionNode.type === 'Identifier' && expressionNode.name === targetName) {
        const localDeclaration = scope.get(targetName);
        if (localDeclaration === originalDeclaration) {
            return true;
        }
    }

    for (const key of Object.keys(expressionNode)) {
        if (this._keysToRemove.has(key)) {continue;}

        const child = expressionNode[key];
        if (Array.isArray(child)) {
            for (const item of child) {
                if (this.expressionContainsIdentifier(item, targetName, originalDeclaration, scope, visited)) {
                    return true;
                }
            }
        } else if (typeof child === 'object') {
            if (this.expressionContainsIdentifier(child, targetName, originalDeclaration, scope, visited)) {
                return true;
            }
        }
    }

    return false;
  }
}