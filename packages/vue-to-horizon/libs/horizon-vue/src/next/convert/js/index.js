import t from '@babel/types';
import { traverse } from '@babel/core';
import LOG from '../../logHelper.js';
import { globalLibPaths, GlobalMethod } from '../defaultConfig.js';
import vueSetupModelToReactHandler from './vueSetupParser.js';
import parseVueOption from './vueOptionParser.js';
import { importDeclarationHandler, importVueToJSX, toNamingFunction } from './handlers/importDeclarationHandler.js'
import {
  createNodeByVueVariable, getThisProperty,
  isThisNode,
} from '../jsx/handlers/expressionHandler.js'
import { JSWarnings } from '../../errors.js'
import { handlerVariableDeclarator } from './handlers/variableDeclaratorHandler.js'
import { componentsParser } from './handlers/componentsHandler.js'
import { i18nParser } from './handlers/i18nHandler.js'
import { threePartyLibsParser } from './handlers/threePartyLibsHandler.js'
import { handleThis, handleThisAssignment } from './handlers/thisHandler.js'


/**
 * 将源vue js ast切换到新组装的react ast
 * @param {*} sourceAst
 * @param {*} reactCovert
 */
export default function convertJS(sourceAst, reactCovert, { component, config }) {

  // vue3 解析，针对函数式组件
  if (reactCovert.isSetup) {
    // 处理import相关
    const { aliasApiSet } = importDeclarationHandler(sourceAst, reactCovert, { component });
    // 处理 export default出去的函数组件
    vueSetupModelToReactHandler(sourceAst, reactCovert, aliasApiSet);

    // 在Setup模式下为顶层变量声明添加useMemo包装
    handlerVariableDeclarator(reactCovert);
  } else {
    // 处理 components
    componentsParser(sourceAst, reactCovert);

    traverse(sourceAst, {
      CallExpression(path) {
        const callee = path.node.callee;
        //删除defineComponent
        if (callee.name === 'defineComponent') {
          path.replaceWith(path.node.arguments[0]);
          reactCovert.sourceCodeContext.removeImport('defineComponent', 'vue');
        }
      },
    });

    // 转换和标准化 $t、$l、$i18n 的调用方式
    i18nParser(sourceAst, reactCovert);

    // 处理jquery和underscore 等
    threePartyLibsParser(sourceAst, reactCovert, { config });

    // 处理import相关
    importDeclarationHandler(sourceAst, reactCovert, { importRenameMap: reactCovert.sourceCodeContext.importComponents, component });

    // 核心：处理vue文件中 export default { ... }
    parseVueOption(sourceAst, reactCovert);

    // 找到所有this.赋值场景。如：用户自定义的 this.xxx = () => {} 等场景
    handleThisAssignment(reactCovert.targetAst, reactCovert);

    handleThis(reactCovert.targetAst, reactCovert);
  }

  // import的 .vue 转 .jsx
  // 如：() => import('../views/HomeView.vue') ===> () => import('../views/HomeView.jsx')
  importVueToJSX(reactCovert.targetAst);

  // export default (props) => {} ===> function Xxx(props) => {}; export default Xxx;
  toNamingFunction(reactCovert.targetAst, reactCovert);
};
