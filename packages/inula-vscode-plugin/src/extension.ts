// 入口文件，负责插件的激活和命令注册
import * as vscode from 'vscode';
import OpenInulaHoverProvider from './hover/HoverProviderCore';
import * as babel from '@babel/core';
import inulaPlugin from './plugin';
import presetTypescript from '@babel/preset-typescript';
import presetReact from '@babel/preset-react';

// 插件的激活函数，当插件被激活时调用
export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Inula Analyzer is now active!');
    let disposable = vscode.commands.registerCommand('openinula.analyzeFile', async () => {
        try {
            // 获取当前活动的文本编辑器
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('没有活动的编辑器窗口。');
                return;
            }

            const document = editor.document;
            const filePath = document.fileName;
            // 优先使用 editor.document.getText() 获取代码，这样可以处理未保存的修改
            const code = document.getText();

            // 使用 await 等待 babel.transformAsync 的异步结果
            const result = await babel.transformAsync(code, {
                // 使用当前正在编辑的文件路径，而不是插件本身的路径
                filename: filePath,
                plugins: [
                    [inulaPlugin, { /* 插件选项 */ }],
                ],
                presets: [
                    // Babel 的 preset 加载顺序是反向的，所以 react 在前
                    [presetReact, { runtime: 'automatic' }],
                    [presetTypescript]
                ],
                babelrc: false,
                configFile: false,
                ast: true,
            });

            if (result && result.metadata) {
                const analysis = result.metadata as any;

                if (analysis.components && Object.keys(analysis.components).length > 0) {
                    console.log('Inula 分析结果:', analysis.components);
                    vscode.window.showInformationMessage(`成功分析了 ${Object.keys(analysis.components).length} 个 Inula 组件。`);

                    const keysToRemove = new Set([
                        'loc', 'extra', 'leadingComments', 'trailingComments', 'innerComments',
                        'parent', 'hub', 'scope', 'file', 'path', 'node',
                        'parentPath', 'fnNode', '_traverseFlags', 'skipKeys', 'contexts', 'opts',
                        '_exploded', '_verified', 'shorthand', 'computed', 'decorators',
                        'interpreter', 'sourceType', 'errors', 'id', 'generator', 'async'
                    ]);

                    function simplifyObject(obj: any): any {
                        if (obj === null || typeof obj !== 'object') {
                            return obj;
                        }

                        if (Array.isArray(obj)) {
                            return obj.map(simplifyObject);
                        }

                        const newObj: { [key: string]: any } = {};
                        for (const key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key) && !keysToRemove.has(key)) {
                                const value = obj[key];
                                if (typeof value === 'string' && (value === '[Omitted for brevity]' || value === '[Circular]')) {
                                    // Skip properties with these placeholder values
                                } else {
                                    newObj[key] = simplifyObject(value);
                                }
                            }
                        }
                        return newObj;
                    }

                                if (result && result.ast) {
                const simplifiedAst = simplifyObject(result.ast);
                const astString = JSON.stringify(simplifiedAst, null, 2);
                const astDocument = await vscode.workspace.openTextDocument({
                    content: astString,
                    language: 'json',
                });
                await vscode.window.showTextDocument(astDocument, vscode.ViewColumn.Beside);
                vscode.window.showInformationMessage('AST 已生成并显示。');
            }

                    // 显示原始（未简化）的分析结果
                    const getCircularReplacerForOriginal = () => {
                        const seen = new WeakSet();
                        return (key: string, value: any) => {
                            if (typeof value === 'object' && value !== null) {
                                if (seen.has(value)) {
                                    return '[Circular]';
                                }
                                seen.add(value);
                            }
                            return value;
                        };
                    };
                    const originalAnalysisString = JSON.stringify(analysis.components, getCircularReplacerForOriginal(), 2);
                    const originalDocument = await vscode.workspace.openTextDocument({
                        content: originalAnalysisString,
                        language: 'json',
                    });
                    await vscode.window.showTextDocument(originalDocument, vscode.ViewColumn.Beside);


                    // 显示简化后的分析结果
                    const simplifiedAnalysis = simplifyObject(analysis.components);                    

                    const analysisString = JSON.stringify(simplifiedAnalysis, null, 2);                    

                    const newDocument = await vscode.workspace.openTextDocument({
                        content: analysisString,
                        language: 'json',
                    });
                    await vscode.window.showTextDocument(newDocument, vscode.ViewColumn.Beside);
                } else {
                    vscode.window.showInformationMessage('在当前文件中没有找到 Inula 组件。');
                }
            } else {
                vscode.window.showInformationMessage('分析未产生结果。');
            }
        } catch (error) {
            console.error('命令执行异常:', error);
            vscode.window.showErrorMessage(`分析 Inula 代码时出错: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    // 创建一个 OpenInulaHoverProvider 实例
    const hoverProvider = new OpenInulaHoverProvider();
    // 注册悬停提供器，为指定的语言提供悬停信息
    const hoverdisposable = vscode.languages.registerHoverProvider(
        ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
        hoverProvider
    );

    // 将命令和悬停提供器添加到上下文的订阅中
    context.subscriptions.push(hoverdisposable);
    context.subscriptions.push(disposable);
    context.subscriptions.push(
        vscode.commands.registerCommand('simpleJump.jump', (arg: { uri: string; position: { line: number; character: number } }) => {
            const uri = vscode.Uri.parse(arg.uri);
            const position = new vscode.Position(arg.position.line, arg.position.character);

            vscode.window.showTextDocument(uri).then(editor => {
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);

                OpenInulaHoverProvider.setVirtualPosition(position);
                setTimeout(() => {
                    vscode.commands.executeCommand('editor.action.showDefinitionPreviewHover');
                }, 150);
            });
        })
    );
}

export function deactivate() {}