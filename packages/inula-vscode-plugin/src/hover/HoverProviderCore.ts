import * as vscode from 'vscode';
import * as babel from '@babel/core';
import inulaPlugin from '../plugin';
import presetTypescript from '@babel/preset-typescript';
import presetReact from '@babel/preset-react';
import { ASTTraversal } from './ASTTraversal';
import { HoverRenderer } from './HoverRenderer';

class OpenInulaHoverProvider implements vscode.HoverProvider {
  private static virtualPosition: vscode.Position | null = null;
  private readonly _cache = new Map<string, any>();
  private readonly _documentVersions = new Map<string, number>();
  
  // 导入的功能模块实例
  private readonly _astTraversal = new ASTTraversal();
  private readonly _hoverRenderer = new HoverRenderer();
    //设置一个虚拟的悬停位置
  public static setVirtualPosition(position: vscode.Position): void {
    OpenInulaHoverProvider.virtualPosition = position;
  }
  //提供悬停信息
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const positionToShow = OpenInulaHoverProvider.virtualPosition || position;
    OpenInulaHoverProvider.virtualPosition = null;
    try {
      const analysis = await this._getComponentMetadata(document);
      if (!analysis) {
        return null;
      }

      const offset = document.offsetAt(positionToShow);
      console.log(`悬停位置: 偏移量 ${offset}`);

      const globalScope = new Map<string, any>();
      if (analysis.components) {
        for (const compName in analysis.components) {
          if (Object.prototype.hasOwnProperty.call(analysis.components, compName)) {
            const componentInfo = analysis.components[compName];
            
            try {
              const fileHub = componentInfo.fnNode?.parentPath?.parentPath?.parentPath?.parentPath?.hub?.file;
              const binding = fileHub?.scope?.bindings?.[compName];
              
              if (binding && binding.identifier.loc) {
                const loc = binding.identifier.loc;
                const filePath = fileHub?.opts?.filename;
                const start = binding?.identifier?.start;
                
                const enhancedComponentInfo = { ...componentInfo, loc, filePath, start };
                globalScope.set(compName, enhancedComponentInfo);
              } else {
                globalScope.set(compName, componentInfo);
              }
            } catch (e) {
              console.error(`[HoverProvider] Could not retrieve loc/filePath for component ${compName}`, e);
              globalScope.set(compName, componentInfo);
            }
          }
        }
      }

      // 遍历所有组件查找匹配的节点
      let foundNode: any = null;
      let component: any = null;
      let scope: Map<string, any> | null = null;

      if (analysis.components) {
        for (const compName in analysis.components) {
          if (analysis.components.hasOwnProperty(compName)) {
            const currentComponent = analysis.components[compName];
            const result = this._astTraversal.findNodeAndScopeAtOffset(currentComponent, offset, globalScope);
            if (result) {
              console.log(`在组件 ${compName} 中找到节点:`, result.node.type, result.node);
              foundNode = result.node;
              component = currentComponent;
              scope = result.scope;
              break;
            }
          }
        }
      }

      if (!foundNode) {
        const wordRange = document.getWordRangeAtPosition(positionToShow);
        if (wordRange) {
          const hoveredWord = document.getText(wordRange);
          if (globalScope.has(hoveredWord)) {
            console.log("global",globalScope);

            const targetComponent = globalScope.get(hoveredWord);
            console.log(`在组件外部找到对组件 ${hoveredWord}`);
            foundNode = targetComponent;
            foundNode._isReferenceContext = true; 
            component = { type: 'File', start: 0, end: document.getText().length, name: 'File' };
            scope = globalScope;
          }
        }
      }

      if (foundNode && component && scope) {
        const hoverContent = await this._hoverRenderer.renderFiveLayerInfo(foundNode, component, scope, document, analysis);
        return new vscode.Hover(hoverContent);
      }
      
      console.log('未找到匹配的节点');
      return null;
    } catch (error) {
      console.error('[HoverProvider] Error:', error);
      return null;
    }
  }
  //获取并缓存组件的元数据
  private async _getComponentMetadata(document: vscode.TextDocument): Promise<any | null> {
    const uri = document.uri.toString();
    const currentVersion = document.version;

    if (this._cache.has(uri) && this._documentVersions.get(uri) === currentVersion) {
      return this._cache.get(uri)!;
    }

    const code = document.getText();    
    try {
      const result = await babel.transformAsync(code, {
        filename: document.fileName,
        plugins: [
          [inulaPlugin, { /* 插件选项 */ }],
        ],
        presets: [
          [presetReact, { runtime: 'automatic' }],
          [presetTypescript]
        ],
        babelrc: false,
        configFile: false,
      });

      if (!result || !result.metadata) {
        return null;
      }

      const analysis = result.metadata as any;
      
      this._cache.set(uri, analysis);
      this._documentVersions.set(uri, currentVersion);
      return analysis;
    } catch (error) {
      console.error('Babel transform failed in HoverProvider:', error);
      return null;
    }
  }
  //简化编译结果
  private _simplifyObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this._simplifyObject(item));
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && !this._astTraversal['_keysToRemove'].has(key)) {
        const value = obj[key];
        if (typeof value === 'string' && (value === '[Omitted for brevity]' || value === '[Circular]')) {
          // 跳过这些值
        } else {
          newObj[key] = this._simplifyObject(value);
        }
      }
    }
    return newObj;
  }
}

export default OpenInulaHoverProvider;