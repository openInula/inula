import { convertJsToAst } from './nodeUtils.js';
import LOG from '../logHelper.js';
import { traverse } from '@babel/core';
import t from '@babel/types';
import SourceCodeContext from './sourceCodeContext.js';
import { globalLibPaths } from './defaultConfig.js';
import { INSTANCE } from './jsx/consts.js';
import { addInstance } from './jsx/handlers/instanceHandler.js';

export default class BaseCovertHandler {
  targetAst = null;
  name = '';
  sourceCodeContext = new SourceCodeContext();
  exportDefaultFunction = null;
  componentInitCall = null;
  actionCache = null;
  hasUseReactiveProps = false;

  /**
   * react 转换处理
   * @param {*} name
   * @param {*} option
   */
  constructor(name, path, option) {
    this.name = name;
    this.path = path;
    this.isSetup = option.isSetup;
    this.actionCache = new Set();
    this.targetAst = convertJsToAst(createBlankReactStr(this.name, option.css, option.template));
    this.exportDefaultFunction = getAstExportDefaultFunction(this.targetAst, this.name);
    if (!this.exportDefaultFunction) {
      throw 'new react has no exportDefaultFunction -> ' + this.name;
    }
  }

  setI18n(content) {
    this.sourceCodeContext.i18n = content;
  }

  /**
   * react组件的ast语法树
   */
  get targetAst() {
    return this.targetAst;
  }

  /**
   * 源码中存储组建的入参，状态，引入等等场景
   */
  get sourceCodeContext() {
    return this.sourceCodeContext;
  }

  /**
   * 将import添加到Horizon文件中
   * @param {*} importDeclaration
   */
  addImportDeclaration(importDeclaration) {
    // 将原有的import添加到Horizon中
    const nodes = this.targetAst.program.body;
    // 在export default前面加入
    nodes.splice(nodes.length - 1, 0, importDeclaration);
  }

  /**
   * 增加 const props = useReactiveProps(rawProps, {});
   * @param {*} properties
   */
  addUseReactiveProps(properties) {
    if (this.hasUseReactiveProps) {
      return;
    }

    this.hasUseReactiveProps = true;

    // 创建变量声明器 props = useReactiveProps(rawProps, { tbodyId: { default: '' }, mergeHeaders: { default() { return []; }}})
    const args = [t.identifier('rawProps')];
    if (properties) {
      args.push(t.objectExpression(properties));
    }
    const callExpression = t.callExpression(t.identifier('useReactiveProps'), args);

    const variableDeclarator = t.variableDeclarator(t.identifier(this.sourceCodeContext.propsName), callExpression);

    // 创建 const 声明 const props = useReactiveProps(rawProps);
    const variableDeclaration = t.variableDeclaration('const', [variableDeclarator]);

    this.addCodeAstToHorizon(variableDeclaration, false);

    this.sourceCodeContext.addExtrasImport('useReactiveProps', globalLibPaths.vue);

    // 创建 instance.props = props;
    const instancePropsAssignment = t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(INSTANCE), t.identifier(this.sourceCodeContext.propsName)),
        t.identifier(this.sourceCodeContext.propsName)
      )
    );
    // 添加注释
    const comment = t.addComment(
      instancePropsAssignment,
      'leading',
      ' 专门用于其它组件通过refs获得props的数据，如：instance.$refs[refId].xxx，如果没有该场景可删除。',
      true
    );
    this.addCodeAstToHorizon(comment);

    addInstance(this);
  }

  /**
   * 将函数逻辑填充到react 组件函数中
   * @param {*} astToAdd
   * @param {*} unshift
   */
  addCodeAstToHorizon(astToAdd, unshift = false) {
    if (unshift) {
      this.exportDefaultFunction.body.body.unshift(astToAdd);
    } else {
      const body = this.exportDefaultFunction.body.body;
      // 要在return的前面加入
      body.splice(body.length - 1, 0, astToAdd);
    }
  }

  /**
   * 将函数逻辑填充到react 组件函数中 (批量)
   * @param {*} astToAdd
   */
  addCodesAstToHorizon(astToAdd, unshift = false) {
    if (unshift) {
      this.exportDefaultFunction.body.body.unshift(...astToAdd);
    } else {
      const body = this.exportDefaultFunction.body.body;
      // 要在return的前面加入
      body.splice(body.length - 1, 0, ...astToAdd);
    }
  }

  /**
   * 只添加一次
   *  @param {*} tag
   * @param {*} astToAdd
   * @returns
   */
  addCodeAstToHorizonForOnce(tag, astToAdd, unshift = true) {
    if (this.actionCache.has(tag)) {
      return;
    }
    this.actionCache.add(tag);
    this.addCodeAstToHorizon(astToAdd(), unshift);
  }

  createComponentInitCall() {
    // 创建空的箭头函数 () => {}
    const arrowFunctionExpression = t.arrowFunctionExpression([], t.blockStatement([]));
    // 创建空数组 []
    const arrayExpression = t.arrayExpression([]);
    // 创建 useEffect 调用表达式 useEffect(() => {}, [])
    const useEffectCallExpression = t.callExpression(t.identifier('useEffect'), [
      arrowFunctionExpression,
      arrayExpression,
    ]);
    this.componentInitCall = arrowFunctionExpression;
    // 封装在一个表达式语句中，使其可以作为代码的一部分
    const expressionStatement = t.expressionStatement(useEffectCallExpression);
    this.addCodeAstToHorizon(expressionStatement);
    this.sourceCodeContext.addExtrasImport('useEffect', globalLibPaths.horizon);
  }

  addExpressionToComponentInit(expression) {
    if (!this.componentInitCall) {
      this.createComponentInitCall();
    }
    this.componentInitCall.body.body.push(expression);
  }

  setComponentProps(props) {
    this.sourceCodeContext.setProps(props);
  }

  setGlobalProperties(config) {
    this.sourceCodeContext.setGlobalProperties(config.globalProperties);
  }

  /**
   * 将<TEMPLATE/>替换为转换后的JSX
   * @param {*} sourceAst
   * @param {*} targetAst
   */
  setHorizonJSX(targetTemplateAst) {
    traverse(this.targetAst, {
      JSXElement: path => {
        if (path.node.openingElement.name.name === 'TEMPLATE' && path.node.closingElement === null) {
          if (targetTemplateAst !== null) {
            path.replaceWith(targetTemplateAst?.program?.body?.[0]);
          } else {
            const mes = `can no find the <TEMPLATE> to replace ->  ${this.name}`;
            LOG.error(mes);
            throw mes;
          }
          // 找到节点快速退出遍历
          path.stop();
        }
      },
    });
  }

  /**
   * 将被动需要的import语句插入Horizon组件中
   */
  insertExtrasImport() {
    const extrasImport = this.sourceCodeContext.extrasImport;

    if (extrasImport.size > 0) {
      [...extrasImport.keys()].forEach(source => {
        const specifiersMap = extrasImport.get(source);
        if (specifiersMap && specifiersMap.size > 0) {
          const importDeclaration = t.importDeclaration(
            [...specifiersMap.keys()].map(name => {
              if (specifiersMap.get(name) === false) {
                return t.importSpecifier(
                  t.identifier(name), // 导入的绑定名称
                  t.identifier(name) // 引入的名称（通常用于重命名导入）
                );
              } else {
                return t.importDefaultSpecifier(t.identifier(name));
              }
            }), // 导入的绑定列表，可以是多个
            t.stringLiteral(source) // 来源模块名称
          );
          this.addImportDeclaration(importDeclaration);
        }
      });
    }
  }

  /**
   * 在代码末尾增加 export default 语句
   */
  addExportDefault() {
    // 在代码末尾增加 export default 语句
    const exportDefaultStatement = t.exportDefaultDeclaration(t.identifier(this.name || 'Component'));

    // 检查 targetAst 是否为数组
    if (Array.isArray(this.targetAst)) {
      this.targetAst.push(exportDefaultStatement);
    } else if (this.targetAst.program && Array.isArray(this.targetAst.program.body)) {
      this.targetAst.program.body.push(exportDefaultStatement);
    } else {
      console.warn('Unable to add export default statement: unexpected AST structure');
    }
  }

  /**
   * 生成：const globalProperties = useGlobalProperties();
   */
  addUseGlobalProperties() {
    if (this.sourceCodeContext.usedGlobalProperties.length) {
      this.sourceCodeContext.addExtrasImport('useGlobalProperties', globalLibPaths.vue);

      this.addCodeAstToHorizonForOnce('useGlobalProperties', () => {
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(this.sourceCodeContext.globalPropertiesName),
            t.callExpression(t.identifier('useGlobalProperties'), [])
          ),
        ]);
      });
    }
  }

  /**
   * 根据has$l、has$t和i18n的不同组合生成代码:
   * 当存在i18n时:
   * 1. 如果只有has$l: const { t as $l } = useLocalMessage(i18n);
   * 2. 如果只有has$t: const { t as $t } = useLocalMessage(i18n);
   * 3. 如果同时有has$l和has$t: const { t as $t, t as $l } = useLocalMessage(i18n);
   *
   * 当不存在i18n时:
   * 1. 如果只有has$l: const { t as $l } = useI18n();
   * 2. 如果只有has$t: const { t as $t } = useI18n();
   * 3. 如果同时有has$l和has$t: const { t as $t, t as $l } = useI18n();
   *
   * 额外处理:
   * 如果has$i18n为true: const $i18n = useI18n();
   *
   * 如果都没有: 不生成代码
   */
  addUseI18n() {
    // 处理$i18n的情况
    if (this.sourceCodeContext.has$i18n) {
      const useMethod = this.sourceCodeContext.i18n ? 'useLocalMessage' : 'useI18n';
      this.sourceCodeContext.addExtrasImport(useMethod, globalLibPaths.$t);

      this.addCodeAstToHorizonForOnce('$i18n', () => {
        return t.variableDeclaration('const', [
          t.variableDeclarator(t.identifier('$i18n'), t.callExpression(t.identifier('useI18n'), [])),
        ]);
      });
    }

    if (this.sourceCodeContext.has$t || this.sourceCodeContext.has$l) {
      // 根据是否存在i18n决定导入的函数名和使用的方法
      const useMethod = this.sourceCodeContext.i18n ? 'useLocalMessage' : 'useI18n';
      this.sourceCodeContext.addExtrasImport(useMethod, globalLibPaths.$t);

      this.addCodeAstToHorizonForOnce('$t&$l', () => {
        // 创建一个用于存储属性的数组
        const properties = [];

        // 根据条件添加相应的属性
        if (this.sourceCodeContext.has$t) {
          properties.push(t.objectProperty(t.identifier('t'), t.identifier('$t'), false, true));
        }
        if (this.sourceCodeContext.has$l) {
          properties.push(t.objectProperty(t.identifier('t'), t.identifier('$l'), false, true));
        }

        // 只有在有属性时才生成代码
        if (properties.length > 0) {
          // 创建函数调用参数数组
          const callArgs = [];
          // 如果存在i18n，添加i18n参数
          if (this.sourceCodeContext.i18n) {
            callArgs.push(t.identifier(this.sourceCodeContext.i18n));
          }

          return t.variableDeclaration('const', [
            t.variableDeclarator(t.objectPattern(properties), t.callExpression(t.identifier(useMethod), callArgs)),
          ]);
        }

        // 如果没有属性，返回null表示不生成代码
        return null;
      });
    }
  }
}

function createBlankReactStr(name, css = [], template = '') {
  // 将连字符转换为驼峰命名，确保函数名合法
  const validFunctionName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

  const cssStr = css.map(c => `import './${name}${c.scoped ? '.scoped' : ''}.${c.lang}';`).join('\r\n');
  const componentBody = template.trim() ? 'return <TEMPLATE/>;' : 'return <Fragment />;';
  const reactImport = template.trim()
    ? "import React from '@cloudsop/horizon';"
    : "import React, { Fragment } from '@cloudsop/horizon';";

  return `
    ${reactImport}
    ${cssStr}
    function ${validFunctionName}(rawProps){
     ${componentBody}
    }
    `;
}

/**
 * 遍历目标react组件的ast，找到export default的方法函数
 * @param {*} ast
 * @returns
 */
function getAstExportDefaultFunction(ast, name) {
  // 将连字符转换为驼峰命名，确保函数名匹配
  const validFunctionName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

  let exportDefaultFunction = null;
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      // 这个函数会在遍历到 ExportDefaultDeclaration 节点时被调用
      if (
        path.node.declaration.type === 'FunctionExpression' ||
        path.node.declaration.type === 'ArrowFunctionExpression'
      ) {
        exportDefaultFunction = path.node.declaration;
        path.stop();
      }
    },
    FunctionDeclaration(path) {
      if (path.node.id.name === validFunctionName) {
        exportDefaultFunction = path.node;
        path.stop();
      }
    },
  });

  return exportDefaultFunction;
}
