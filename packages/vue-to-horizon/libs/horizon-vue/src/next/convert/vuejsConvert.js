import { traverse } from '@babel/core';
import generate from '@babel/generator';
import t from '@babel/types';
import LOG from '../logHelper.js';
import { globalLibPaths } from './defaultConfig.js';
import { convertJsToAst, convertUIComponentImported } from './nodeUtils.js';

let babelGenerate = generate;
if (typeof generate.default === 'function') {
  babelGenerate = generate.default;
}
/**
 * 将js解析为ast树,通过对模板,样式，js的处理
 * @param {*} source
 * @param {*} option
 * @returns
 */
export default class VueJSConvert {
  source = '';
  option = { ts: false };
  sourceAst = null;
  targetPath = '';
  sourcePath = '';
  constructor(source, option, fileConfig) {
    if (!source) {
      throw 'no convert context';
    }
    this.source = source;
    this.option = option;
    this.targetPath = fileConfig.targetPath;
    this.sourcePath = fileConfig.sourcePath;
  }

  async convert() {
    const jsStr = this.source;
    let { ts = false, component } = this.option;

    try {
      // 转换vuejs到react，同时收集ref等等变量

      const sourceAst = convertJsToAst(jsStr, { lang: ts ? 'ts' : 'js' });
      // 需要动态添加的import 字段
      const readyAddImport = new Map();
      traverse(sourceAst, {
        ImportDeclaration(path) {
          convertUIComponentImported(path, t, component);
        },
        Import(path) {
          const source = path.parent.arguments[0];
          if (source.type === 'TemplateLiteral') {
            const quasis = source.quasis;
            quasis.forEach(qua => {
              if (qua.value.raw.endsWith('.vue')) {
                qua.value.raw = qua.value.raw.replace('.vue', '.jsx');
              }
              if (qua.value.cooked.endsWith('.vue')) {
                qua.value.cooked = qua.value.cooked.replace('.vue', '.jsx');
              }
            });
          } else {
            if (source.value.endsWith('.vue')) {
              path.parent.arguments[0].value = path.parent.arguments[0]?.value.replace('.vue', '.jsx');
            }
          }
          // 找到类似语句: () => import('./views/HomeView.vue')
          const importCallPath = path.parentPath.parentPath;
          // 判断importCallPath有没有被defineAsyncComponent包裹
          if (
            importCallPath.parentPath.type !== 'CallExpression' ||
            importCallPath.parentPath?.node?.callee?.name !== 'defineAsyncComponent'
          ) {
            importCallPath.replaceWith(t.callExpression(t.identifier('defineAsyncComponent'), [importCallPath.node]));
            if (!readyAddImport.has('adapters/vueAdapter')) {
              readyAddImport.set('adapters/vueAdapter', new Set());
            }
            readyAddImport.get('adapters/vueAdapter').add('defineAsyncComponent');
          }
        },
      });
      traverse(sourceAst, {
        // 指定节点类型和对应的函数
        ImportDeclaration: path => {
          // LOG.info('deal an importDeclarationHanlder!');
          // 在这里可以进行一些操作，比如：
          // 取得当前的 import 声明节点
          const importDeclaration = path.node;
          const replaceTarget = globalLibPaths?.[importDeclaration.source.value];
          if (replaceTarget) {
            const replaceStr = typeof replaceTarget === 'string' ? replaceTarget : replaceTarget.path;
            importDeclaration.source.value = replaceStr;
            if (readyAddImport.has(replaceStr)) {
              const readyToAddspecifiers = readyAddImport.get(replaceStr);
              const specifiers = importDeclaration.specifiers;
              // 如果当前已经引入了，则在待增加列表中删除
              specifiers.forEach(s => {
                const importName = s.imported.name;
                readyToAddspecifiers.delete(importName);
              });
              // 将剩下的加入列表
              readyToAddspecifiers.forEach(name => {
                importDeclaration.specifiers.push(
                  t.importSpecifier(
                    t.identifier(name), // 导入的本地名称
                    t.identifier(name) // 导入的源名称
                  )
                );
              });
              readyToAddspecifiers.clear();
              readyAddImport.delete(replaceStr);
            }
          }

          // specifiers[0].imported.name  === 'createApp'
          // 比如，这里我要输出这个表达式语句的源码
          // LOG.info(`Original Source: ${path.toString()}`);
          if (path?.node?.source?.type === 'StringLiteral') {
            if (path.node.source.value.endsWith('.vue')) {
              path.node.source.value = path.node.source.value.replace('.vue', '.jsx');
            }
          }
        },
      });

      readyAddImport.forEach((specifiers, key) => {
        const newImport = t.importDeclaration(
          [...specifiers].map(v => {
            return t.importSpecifier(t.identifier(v), t.identifier(v));
          }),
          t.stringLiteral(key)
        );
        sourceAst.program.body.unshift(newImport);
      });
      readyAddImport.clear();

      return new Promise((resolve, reject) => {
        resolve(babelGenerate(sourceAst).code);
      });
    } catch (error) {
      LOG.error('trans js code error in VueJSConvert: ', error.message, `[${this.sourcePath}]`);
    }
  }
}
