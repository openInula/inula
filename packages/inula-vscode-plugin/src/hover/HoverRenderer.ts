import * as vscode from 'vscode';
import { ExpressionEvaluator } from './ExpressionEvaluator';
import { ASTTraversal } from './ASTTraversal';
import { ReferenceFinder } from './ReferenceFinder';

export class HoverRenderer {
  private readonly _expressionEvaluator: ExpressionEvaluator;
  private readonly _astTraversal: ASTTraversal;
  private readonly _referenceFinder: ReferenceFinder;

  constructor() {
    this._expressionEvaluator = new ExpressionEvaluator();
    this._astTraversal = new ASTTraversal();
    this._referenceFinder = new ReferenceFinder();
  }
  //为给定的 AST 节点渲染完整的五层悬停信息。
  public async renderFiveLayerInfo(
    node: any, 
    component: any, 
    scope: Map<string, any>, 
    document: vscode.TextDocument, 
    analysis: any
  ): Promise<vscode.MarkdownString> {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportThemeIcons = true;

    // 1. 标题层：名称
    this.renderTitleLayer(md, node);
    
    // 2. 核心属性层：类型 + 用途
    this.renderCorePropertiesLayer(md, node, component, scope, analysis);

    // 3. 高级属性层：值和依赖关系
    this.renderAdvancedPropertiesLayer(md, node, component, scope, document, analysis);
    
    // 4. 元数据层：位置信息
    this.renderMetadataLayer(md, node);
    
    // 5. 交互层：实用操作
    await this.renderInteractiveLayer(md, node, scope, document, analysis);

    return md;
  }
  //显示节点的名称和图标
  private renderTitleLayer(md: vscode.MarkdownString, node: any): void {
    const nodeName = this.getDisplayName(node);
    md.appendMarkdown(`### ${this.getNodeIcon(node)} ${nodeName}\n\n`);
  }
  //确定 AST 节点最合适的显示名称
  private getDisplayName(node: any): string {
    if (node.name) {return `\`${node.name}\``;}
    if (node.id?.name) {return `\`${node.id.name}\``;}
    if (node.key?.name) {return `\`${node.key.name}\``;}
    if (node.callee?.name) {return `\`${node.callee.name}()\``;}
    if (node.type === 'NumericLiteral') {return `值 \`${node.value}\``;}
    if (node.type === 'StringLiteral') {return `字符串 \`"${node.value}"\``;}
    return this.getNodeTypeDisplay(node.type);
  }
  //将 AST 节点类型映射为人类可读的字符串
  private getNodeTypeDisplay(type: string): string {
    const typeMap: Record<string, string> = {
        'Identifier': '标识符',
        'VariableDeclaration': '变量声明',
        'VariableDeclarator': '变量定义',
        'NumericLiteral': '数值',
        'StringLiteral': '字符串',
        'ArrowFunctionExpression': '箭头函数',
        'CallExpression': '函数调用',
        'ObjectProperty': '属性',
        'ImportDeclaration': '导入',
        'comp': '组件',
        'init': '初始化',
        'viewReturn': '视图',
        'raw': '代码块'
    };
    return typeMap[type] || type;
  }
  //获取 AST 节点类型对应的 VS Code 图标
  private getNodeIcon(node: any): string {
    const iconMap: Record<string, string> = {
        'Identifier': '$(symbol-variable)',
        'VariableDeclaration': '$(symbol-constant)',
        'NumericLiteral': '$(symbol-number)',
        'StringLiteral': '$(symbol-string)',
        'ArrowFunctionExpression': '$(symbol-method)',
        'CallExpression': '$(symbol-function)',
        'ObjectProperty': '$(symbol-property)',
        'ImportDeclaration': '$(file-symlink-file)',
        'comp': '$(symbol-class)',
        'init': '$(rocket)',
        'viewReturn': '$(paintcan)'
    };
    return iconMap[node.type] || '$(symbol-misc)';
  }
  //显示类型和用途信息
  private renderCorePropertiesLayer(md: vscode.MarkdownString, node: any, component: any, scope: Map<string, any>, analysis: any): void {
    const coreInfo = this.getCoreInfo(node, component, scope, analysis);
    if (coreInfo.length === 0) {return;}

    md.appendMarkdown('**类型信息**\n');
    coreInfo.forEach(info => {
        md.appendMarkdown(`- ${info}\n`);
    });
    md.appendMarkdown('\n');
  }
  //收集给定 AST 节点的核心信息
  private getCoreInfo(node: any, component: any, scope: Map<string, any>, analysis: any): string[] {
    const info: string[] = [];
    const nodeType = node.type;    

    switch (node.type) {
        case 'Identifier': {
            const declaration = scope.get(node.name);
            if (declaration) {
                if (declaration.type === 'comp') {
                    info.push(`类型: 组件`);
                } else {
                    const realType = this.getVariableType(declaration.init);
                    info.push(`类型: ${this.getNodeTypeDisplay(realType)}`);
                }
            } else {
                info.push(`类型: 标识符`);
            }
            const usage = this.getIdentifierUsage(node, component, scope, analysis);
            if (usage) { info.push(`用途: ${usage}`); }
            break;
        }

        case 'comp':
            info.push(`类型: 组件`);
            info.push(`用途: 组件定义`);
            break;

        case 'VariableDeclaration':
            info.push(`声明方式: ${node.kind}`);
            break;

        case 'VariableDeclarator':
            info.push(`变量类型: ${this.getVariableType(node.init)}`);
            break;

        case 'NumericLiteral':
            info.push(`类型: 数值字面量`);
            break;

        case 'StringLiteral':
            info.push(`类型: 字符串字面量`);
            break;

        case 'CallExpression':
            info.push(`调用类型: 函数调用`);
            break;

        case 'ArrowFunctionExpression':
            info.push(`类型: 箭头函数`);
            info.push(`参数: ${node.params.length}个`);
            break;

        case 'ObjectProperty':
            info.push(`属性类型: ${node.key.name.startsWith('on') ? '事件' : '数据'}`);
            break;
    }

    return info;
  }
  //从变量的初始化节点推断其类型
  private getVariableType(init: any) {
    if (!init) {return 'any';}
    const typeMap: Record<string, string> = {
        'NumericLiteral': 'number',
        'StringLiteral': 'string',
        'ArrowFunctionExpression': 'function',
        'CallExpression': 'any',
        'BinaryExpression': 'any',
        'ArrayExpression': 'array',
        'ObjectExpression': 'object'
    };
    return typeMap[init.type] || 'object';
  }
  //确定标识符在组件上下文中的具体用途
  private getIdentifierUsage(node: any, component: any, scope: Map<string, any>, analysis: any): string {
    const name = node.name;
    const declaration = scope.get(name);

    if (declaration) {
        if (declaration.type === 'comp') {
            if (node._isReferenceContext) {
                return '组件引用';
            }
            const componentIdNode = declaration.fnNode?.node?.id || declaration.node?.id;
            if (componentIdNode && node.start === componentIdNode.start) {
                return '组件定义';
            }
            return '组件引用';
        }
        if (declaration.type === 'VariableDeclarator') {
            if (declaration.init?.callee?.name === 'useState') {
                if (name.startsWith('set')) {
                    return '状态更新函数';
                }
                return '状态变量';
            }
            
            if (declaration.init) {
                const initType = declaration.init.type;
                if (initType === 'ArrowFunctionExpression' || initType === 'FunctionExpression') {
                    return '函数';
                }
                if (initType === 'ClassExpression') {
                    return '类';
                }
            }

            if (declaration.kind === 'const') {
                return '常量';
            }
            return '变量';
        }
        if (declaration.type.includes('Parameter') || declaration.type === 'Identifier') {
             return '函数参数';
        }
    }
    return '';
  }
  //显示值和依赖关系
  private renderAdvancedPropertiesLayer(md: vscode.MarkdownString, node: any, component: any, scope: Map<string, any>, document: vscode.TextDocument, analysis: any): void {
    const advancedInfo = this.getAdvancedInfo(node, component, scope, document, analysis);
    if (advancedInfo.length === 0) {return;}

    md.appendMarkdown('**详细信息**\n');
    advancedInfo.forEach(info => {
        md.appendMarkdown(`- ${info}\n`);
    });
    md.appendMarkdown('\n');
  }
  //收集节点的高级信息
  private getAdvancedInfo(node: any, component: any, scope: Map<string, any>, document: vscode.TextDocument, analysis: any): string[] {
    const info: string[] = [];
    let declarationNode: any = null;
    let nodeName: string | null = null;

    if (node.type === 'Identifier' || (node.type === 'comp')) {
        const declaration = node.type === 'comp' ? node : scope.get(node.name);
        if (declaration && declaration.type === 'comp') {
            const targetComponent = declaration;
            const paramsCount = targetComponent.fnNode?.node?.params?.length || targetComponent.params?.length || 0;
            info.push(`参数数量: ${paramsCount}`);
            return info;
        }
    }
    
    const memberExprParent = this._astTraversal.findMemberExpressionParent(component, node);
    if (memberExprParent && memberExprParent.property === node) {
        const value = this._expressionEvaluator.evaluateExpression(memberExprParent, component, scope);
        if (value !== null && value !== undefined) {
            const parentExprString = document.getText(new vscode.Range(
                document.positionAt(memberExprParent.start),
                document.positionAt(memberExprParent.end)
            ));
            info.push(`表达式: \`${parentExprString}\``);
            info.push(`值: \`${this._expressionEvaluator.valueToString(value)}\``);
            return info;
        }
    }

    if (node.type === 'Identifier') {
        declarationNode = scope.get(node.name);
        nodeName = node.name;
    } else if (node.type === 'VariableDeclarator') {
        declarationNode = node;
        nodeName = node.id?.name;
    }

    if (declarationNode && nodeName) {
        if (declarationNode.id?.type === 'ArrayPattern' && declarationNode.init?.callee?.name === 'useState') {
            const element = declarationNode.id.elements.find((e: any) => e?.name === nodeName);
            const index = element ? declarationNode.id.elements.indexOf(element) : -1;

            if (index === 0) {
                info.push(`类型: 状态变量`);
                const initialValue = this._expressionEvaluator.evaluateExpression(declarationNode.init, component, scope, new Set());
                if (initialValue !== null) {
                    info.push(`初始值: \`${initialValue}\``);
                }
            } else if (index === 1) {
                info.push(`类型: 状态更新函数`);
            }
            info.push(`依赖: ${this._expressionEvaluator.getValueDescription(declarationNode.init)}`);

        } else if (declarationNode.init) {
            if (declarationNode.init.type === 'ArrowFunctionExpression' || 
                declarationNode.init.type === 'FunctionExpression' ||
                declarationNode.init.type === 'ArrayExpression' ||
                declarationNode.init.type === 'ObjectExpression') {
                const funcNode = declarationNode.init;
                if (funcNode.start !== null && funcNode.end !== null) {
                    const funcRange = new vscode.Range(
                        document.positionAt(funcNode.start),
                        document.positionAt(funcNode.end)
                    );
                    const funcDef = document.getText(funcRange);
                    info.push(`值:\n\`\`\`\n${funcDef}\n\`\`\``);
                } else {
                    info.push(`值: ${this._expressionEvaluator.getValueDescription(funcNode)}`);
                }
            } else {
                const dependency = this._expressionEvaluator.getValueDescription(declarationNode.init);
                const dependenciesContext = { dependencies: new Set<string>() };
                const value = this._expressionEvaluator.evaluateExpression(declarationNode.init, component, scope, new Set([nodeName]), dependenciesContext);
                
                if (value !== null) {
                    info.push(`值: \`${value}\``);
                    if (dependency !== `\`${value}\`` && dependency !== value.toString()) {
                        info.push(`依赖: ${dependency}`);
                    }
                } else {
                    info.push(`值: ${dependency}`);
                }

                if (dependenciesContext.dependencies.size > 0) {
                    const depDetails: string[] = [];
                    const visitedForDeps = new Set([nodeName]);

                    for (const depName of dependenciesContext.dependencies) {
                        if (visitedForDeps.has(depName)) {continue;}
                        
                        const depDeclaration = scope.get(depName);
                        let depString = `* \`${depName}\``;

                        if (depDeclaration) {
                            visitedForDeps.add(depName);
                            const depPosition = document.positionAt(depDeclaration.start);
                            const commandArg = {
                                uri: document.uri.toString(),
                                position: {
                                    line: depPosition.line,
                                    character: depPosition.character
                                }
                            };
                            const commandUri = vscode.Uri.parse(`command:simpleJump.jump?${encodeURIComponent(JSON.stringify(commandArg))}`);
                            depString = `* [${depName}](${commandUri})`;

                            if (depDeclaration.init) {
                                const depValue = this._expressionEvaluator.evaluateExpression(depDeclaration.init, component, scope, visitedForDeps);
                                if (depValue !== null) {
                                    depString += ` = \`${depValue}\``;
                                }
                            }
                        }
                        depDetails.push(depString);
                    }

                    if (depDetails.length > 0) {
                        info.push(`依赖项详情:\n${depDetails.join('\n')}`);
                    }
                }
            }
        } else if (declarationNode.type === 'Identifier') {
            info.push(`来源: 函数参数`);
        }
        const derivedValues = this._astTraversal.findDerivedValues(nodeName, declarationNode, component);
        if (derivedValues.length > 0) {
            info.push(`派生值: ${derivedValues.join(', ')}`);
        }
    }

    // 检查响应性
    if (node.type === 'Identifier' && component?.scope?.reactiveMap?.[node.name]) {
        info.push('响应式: ✅ 是');
    }

    // 对于函数调用，显示参数信息
    if (node.type === 'CallExpression') {
        if (node.arguments.length > 0) {
            const args = node.arguments.map((arg: any) => 
                this._expressionEvaluator.getValueDescription(arg)
            ).join(', ');
            info.push(`参数: ${args}`);
        }
    }

    // 对于数值和字符串，显示具体值
    if (node.type === 'NumericLiteral') {
        info.push(`数值: ${node.value}`);
    }
    if (node.type === 'StringLiteral') {
        info.push(`内容: "${node.value}"`);
    }

    return info;
  }
  //显示节点的源代码位置
  private renderMetadataLayer(md: vscode.MarkdownString, node: any): void {
    if (node.loc?.start) {
        md.appendMarkdown(`**位置**: 第 ${node.loc.start.line} 行, 第 ${node.loc.start.column} 列\n\n`);
    }
  }
  //提供可操作的链接
  private async renderInteractiveLayer(md: vscode.MarkdownString, node: any, scope: Map<string, any>, document: vscode.TextDocument, analysis: any): Promise<void> {
    const nodeName = node.name || node.id?.name;
    const actions = await this._referenceFinder.getInteractiveActions(node, scope, document, analysis);
    if (actions.length > 0) {
        md.appendMarkdown('\n---\n');
        md.appendMarkdown(actions.join(' | '));
    }
    if (!nodeName) { return; }

    const declarationNode = scope.get(nodeName);
    if (!declarationNode || !declarationNode.loc) { return; }

    // 检查当前节点是否是声明节点
    const isDeclaration = (declarationNode === node || declarationNode.id === node);

    if (isDeclaration) {
        const references = this._referenceFinder.findAllReferences(document, analysis, declarationNode);
        
        if (references.length > 0) {
            references.sort((a, b) => a.range.start.compareTo(b.range.start));
            const firstRef = references[0];
            const commandArg = {
                uri: firstRef.uri.toString(),
                position: {
                    line: firstRef.range.start.line,
                    character: firstRef.range.start.character
                }
            };
            const commandUri = vscode.Uri.parse(`command:simpleJump.jump?${encodeURIComponent(JSON.stringify(commandArg))}`);
            
            if (references.length === 1) {
                md.appendMarkdown(`\n\n---\n\n[$(go-to-file) 跳转到引用](${commandUri})`);
            } else {
                md.appendMarkdown(`\n\n---\n\n[$(go-to-file) 跳转到第一个引用](${commandUri}) (共 ${references.length} 处)`);
            }
        }
    } else {
        const targetUri = document.uri;
        const defPosition = document.positionAt(declarationNode.start);
        if (!Number.isNaN(defPosition.line) && !Number.isNaN(defPosition.character)) {
            const commandArg = {
                uri: document.uri.toString(),
                position: {
                    line: defPosition.line,
                    character: defPosition.character
                }
            };
            const commandUri = vscode.Uri.parse(`command:simpleJump.jump?${encodeURIComponent(JSON.stringify(commandArg))}`);
            md.appendMarkdown(`\n\n---\n\n[$(go-to-file) 跳转到定义](${commandUri})`);                
        }

        const allReferences = this._referenceFinder.findAllReferences(document, analysis, declarationNode);

        if (allReferences.length > 1) {
            allReferences.sort((a, b) => a.range.start.compareTo(b.range.start));

            const currentOffset = node.start;
            const currentIndex = allReferences.findIndex(ref => document.offsetAt(ref.range.start) === currentOffset);

            if (currentIndex > -1) {
                const nextIndex = (currentIndex + 1) % allReferences.length;
                const nextRef = allReferences[nextIndex];

                const nextRefPosition = nextRef.range.start;
                
                const nextCommandArg = {
                    uri: nextRef.uri.toString(),
                    position: {
                        line: nextRefPosition.line,
                        character: nextRefPosition.character
                    }
                };
                const nextCommandUri = vscode.Uri.parse(`command:simpleJump.jump?${encodeURIComponent(JSON.stringify(nextCommandArg))}`);
                md.appendMarkdown(` | [跳转到下一引用](${nextCommandUri})`);
            }
        }
    }
  }
}