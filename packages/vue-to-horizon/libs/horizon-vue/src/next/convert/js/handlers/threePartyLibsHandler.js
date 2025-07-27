import { traverse } from '@babel/core';
import { globalLibPaths } from '../../defaultConfig.js';

export function threePartyLibsParser(ast, reactCovert, { config }) {
  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;

      // 为$('#id') 增加: import $ from 'jquery';
      if (callee.type === 'Identifier' && callee.name === '$' && config?.importJquery !== false) {
        reactCovert.sourceCodeContext.addExtrasImport('$', globalLibPaths.jquery, true);
      }

      // 为_.throttle() 增加: import _ from '@baize/wdk';
      if (callee.type === 'MemberExpression' && callee.object.name === '_') {
        // 获取当前路径的作用域
        let scope = path.scope;

        // 遍历到最外层作用域
        while (scope.parent) {
          scope = scope.parent;
        }
        // 在作用域中查找 '_' 的绑定
        const binding = scope.getBinding('_');

        // 如果没有找到绑定，或者绑定不是来自导入，则添加导入
        if (!binding || binding.kind !== 'module') {
          reactCovert.sourceCodeContext.addExtrasImport('_', globalLibPaths.wdk, true);
        }
      }
    },
  });
}
