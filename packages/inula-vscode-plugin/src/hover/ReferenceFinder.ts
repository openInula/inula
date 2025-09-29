import * as vscode from 'vscode';
import { ASTTraversal } from './ASTTraversal';

export class ReferenceFinder {
  private readonly _astTraversal: ASTTraversal;
  private readonly _keysToRemove = new Set([
    'loc', 'extra', 'leadingComments', 'trailingComments', 'innerComments',
    'parent', 'hub', 'scope', 'file', 'path', 'node',
    'parentPath', 'fnNode', '_traverseFlags', 'skipKeys', 'contexts', 'opts',
    '_exploded', '_verified', 'shorthand', 'computed', 'decorators',
    'interpreter', 'sourceType', 'errors', 'id', 'generator', 'async'
  ]);

  constructor() {
    this._astTraversal = new ASTTraversal();
  }
  //查找给定定义节点的所有引用
  public findAllReferences(
    document: vscode.TextDocument,
    analysis: any,
    definitionNode: any
  ): vscode.Location[] {
    const references: vscode.Location[] = [];

    // 统一处理变量声明和函数参数，获取其名称和定义位置
    const definitionName = definitionNode.id?.name ?? definitionNode.name;
    if (!definitionName) {
      return [];
    }
    const definitionIdentifierStart = definitionNode.id?.start ?? definitionNode.start;
    if (definitionIdentifierStart === undefined) {
      return [];
    }
    // 使用声明节点（VariableDeclarator或参数Identifier）的起始位置作为唯一标识
    const definitionStart = definitionNode.start;    

    const traverse = (node: any, scope: Map<string, any>, visited = new Set<any>()): Map<string, any> => {
      if (!node || typeof node !== 'object' || visited.has(node)) {
        return scope;
      }
      visited.add(node);

      // 1. 为当前节点创建新作用域，并添加其内部的声明
      let currentScope = new Map(scope);
      const declarations = this._astTraversal.getDeclarationsInNode(node);
      for (const decl of declarations) {
        currentScope.set(decl.name, decl.node);
      }

      // 2. 检查当前节点是否是目标变量的引用
      if (node.type === 'Identifier' && node.name === definitionName) {
        const resolvedDecl = currentScope.get(node.name);
        
        // 通过比较声明节点的起始位置来确认是否引用了同一个变量
        if (resolvedDecl && resolvedDecl.start === definitionStart) {
          // 排除变量定义本身
          if (node.start !== definitionIdentifierStart) {
            const startPos = document.positionAt(node.start);
            const endPos = document.positionAt(node.end);
            references.push(new vscode.Location(document.uri, new vscode.Range(startPos, endPos)));
          }
        }
      }

      // 3. 递归遍历子节点，并正确传递作用域
      let keysToTraverse: string[];

      // 为我们的自定义 'comp' 节点强制遍历顺序
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
            // 数组（如语句块），按顺序遍历并传递作用域
            for (const item of child) {
              scopeForChildren = traverse(item, scopeForChildren, new Set(visited));
            }
          } else if (typeof child === 'object') {
            const isFunction = child.type === 'ArrowFunctionExpression' || child.type === 'FunctionExpression' || child.type === 'FunctionDeclaration';
            if (isFunction) {
              // 函数有自己的作用域，遍历其内部，但不让其作用域泄漏给兄弟节点
              traverse(child, scopeForChildren, new Set(visited));
            } else {
              // 对于其他对象，继续传递作用域
              scopeForChildren = traverse(child, scopeForChildren, new Set(visited));
            }
          }
        }
      }
      
      return scopeForChildren;
    };

    // 从每个组件的根节点开始遍历
    for (const compName in analysis) {
      if (analysis.hasOwnProperty(compName)) {
        traverse(analysis[compName], new Map(), new Set());
      }
    }

    return references;
  }
  //为给定的 AST 节点生成可交互的操作
  public async getInteractiveActions(
    node: any, 
    scope: Map<string, any>, 
    document: vscode.TextDocument, 
    analysis: any
  ): Promise<string[]> {
    const actions: string[] = [];

    if (node.type === 'comp') {
      const findReferencesCommand = this.getFindReferencesCommand(node, document, analysis);
      if (findReferencesCommand) {
        const commandUri = vscode.Uri.parse(`command:${findReferencesCommand.command}?${encodeURIComponent(JSON.stringify(findReferencesCommand.arguments))}`);
        actions.push(`[${findReferencesCommand.title}](${commandUri})`);
      } 
    }
    return actions;
  }
  //为给定的节点创建一个“查找所有引用”的 VS Code 命令对象
  public getFindReferencesCommand(
    node: any, 
    document: vscode.TextDocument, 
    analysis: any
  ): { title: string; command: string; arguments: any[] } | null {
    const nodeName = node.name || node.id?.name;
    
    if (!nodeName) {
      return null;
    }

    const references = this.findAllReferences(document, analysis, node);
    if (references.length === 0) {
      return null;
    }

    return {
      title: '跳转到引用',
      command: 'editor.action.showReferences',
      arguments: [document.uri, references]
    };
  }
}