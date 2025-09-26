import { traverse } from '@babel/core';
import { isThisNode } from '../../jsx/handlers/expressionHandler.js';
import t from '@babel/types';

/**
 * 国际化解析器函数
 * 主要功能：
 * 1. 转换和标准化 $t、$l、$i18n 的调用方式
 * 2. 移除 this 或 _this 的引用
 * 3. 记录这些国际化函数的使用情况
 *
 * @param {Object} ast - 需要处理的抽象语法树
 * @param {Object} reactCovert - React转换器对象，用于存储上下文信息
 */
export function i18nParser(ast, reactCovert) {
  traverse(ast, {
    MemberExpression(path) {
      // 将所有的 $t 调用改为简单的 $t，去掉 this 或 _this
      if (isThisNode(path.node.object) && path.get('property').isIdentifier({ name: '$t' })) {
        path.replaceWith(t.identifier('$t'));
        reactCovert.sourceCodeContext.setHas$t(true);
      }

      // 检查是否直接使用了 $t
      if (path.get('object').isIdentifier({ name: '$t' })) {
        reactCovert.sourceCodeContext.setHas$t(true);
      }

      // 同样转换 $l
      if (isThisNode(path.node.object) && path.get('property').isIdentifier({ name: '$l' })) {
        path.replaceWith(t.identifier('$l'));
        reactCovert.sourceCodeContext.setHas$l(true);
      }

      // 检查是否直接使用了 $l
      if (path.get('object').isIdentifier({ name: '$l' })) {
        reactCovert.sourceCodeContext.setHas$l(true);
      }

      // 同样转换 $i18n
      if (isThisNode(path.node.object) && path.get('property').isIdentifier({ name: '$i18n' })) {
        reactCovert.sourceCodeContext.setHas$i18n(true);
      }

      // 检查是否直接使用了 $i18n
      if (path.get('object').isIdentifier({ name: '$i18n' })) {
        reactCovert.sourceCodeContext.setHas$i18n(true);
      }
    },
  });
}
