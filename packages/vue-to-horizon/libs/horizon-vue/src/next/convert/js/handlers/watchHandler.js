import t from '@babel/types';
import { globalLibPaths } from '../../defaultConfig.js';
import { createNodeByVueVariable } from '../../jsx/handlers/expressionHandler.js';
import LOG from '../../../logHelper.js';

/**
 * Vue watch 属性转换为 Horizon watch 的解析器
 *
 * 示例1 - 基础watch写法:
 * 转换前 (Vue):
 * watch: {
 *   count(newValue, oldValue) {
 *     console.log('count changed')
 *   }
 * }
 *
 * 转换后 (Horizon):
 * watch(() => count, (newValue, oldValue) => {
 *   console.log('count changed')
 * })
 *
 * 示例2 - 带选项的watch:
 * 转换前 (Vue):
 * watch: {
 *   count: {
 *     handler(newValue) {
 *       console.log('count changed')
 *     },
 *     immediate: true,
 *     deep: true
 *   }
 * }
 *
 * 转换后 (Horizon):
 * watch(() => count, (newValue) => {
 *   console.log('count changed')
 * }, { immediate: true, deep: true })
 *
 * 示例3 - 监听路由变化:
 * 转换前 (Vue):
 * watch: {
 *   $route(newValue, oldValue) {
 *     console.log('route changed')
 *   }
 * }
 *
 * 转换后 (React):
 * useRouteWatch((newValue, oldValue) => {
 *   console.log('route changed')
 * })
 *
 * 示例4 - 监听路由变化(带选项):
 * 转换前 (Vue):
 * watch: {
 *   $route: {
 *     handler(newValue) {
 *       console.log('route changed')
 *     },
 *     immediate: true,
 *     deep: true
 *   }
 * }
 *
 * 转换后 (React):
 * useRouteWatch((newValue, oldValue) => {
 *   console.log('route changed')
 * }, { immediate: true, deep: true })
 */
export function watchParser(ast, reactCovert) {
  ast?.properties.forEach(prop => {
    const key = prop.key.name || prop.key.value;

    // 特殊处理 $route 的情况
    if (key === '$route') {
      const routeWatchCallee = t.identifier('useRouteWatch');

      if (prop.type === 'ObjectMethod') {
        // 处理简单函数形式
        const funcBody = prop.body;
        const param = prop.params;
        const async = prop.async;
        const handlerCall = t.arrowFunctionExpression(param, funcBody, async);
        const callExpression = t.callExpression(routeWatchCallee, [handlerCall]);
        reactCovert.addCodeAstToHorizon(callExpression);
      } else if (prop.type === 'ObjectProperty' && prop.value.type === 'ObjectExpression') {
        // 处理带选项的对象形式
        let handlerCall = null;
        let handlerOption = t.objectExpression([]);

        prop.value.properties.forEach(p => {
          if (p.key.name === 'handler') {
            if (p.type === 'ObjectMethod') {
              // 处理 handler(newValue, oldValue) {} 场景
              const funcBody = p.body;
              const param = p.params;
              const async = p.async;
              handlerCall = t.arrowFunctionExpression(param, funcBody, async);
            } else if (p.type === 'ObjectProperty') {
              const handlerValue = p.value;
              if (t.isFunctionExpression(handlerValue)) {
                handlerCall = t.arrowFunctionExpression(handlerValue.params, handlerValue.body, handlerValue.async);
              } else if (t.isArrowFunctionExpression(handlerValue)) {
                handlerCall = handlerValue;
              } else if (t.isStringLiteral(handlerValue)) {
                // 转换字符串到identifier
                handlerCall = t.identifier(handlerValue.value);
              } else {
                handlerCall = handlerValue;
              }
            }
          } else if (p.type === 'ObjectProperty') {
            handlerOption.properties.push(t.objectProperty(p.key, p.value));
          }
        });

        const callExpression = t.callExpression(routeWatchCallee, [handlerCall, handlerOption]);
        reactCovert.addCodeAstToHorizon(callExpression);
      }

      // 添加 useRouteWatch 的导入
      reactCovert.sourceCodeContext.addExtrasImport('useRouteWatch', globalLibPaths['vue-router']);
      return;
    }

    // 需要特殊处理，如 watch(a.b, () => {}) 修改为 watch(a.value.bm, () => {})
    const keys = key.split('.');
    let watchTarget = t.identifier(key);

    // watch(() => checkItem, () => {}) ==> watch(() => dataReactive.checkItem, () => {})
    if (keys[0]) {
      const reactiveVal = createNodeByVueVariable(keys[0], reactCovert) || t.identifier(keys[0]);
      watchTarget = keys.slice(1).reduce((r, v) => {
        const prop = t.identifier(v);
        return t.memberExpression(r, prop, false);
      }, reactiveVal);
    }

    const watchTargetFunction = t.arrowFunctionExpression([], watchTarget, false);
    const watchCallee = t.identifier('watch');
    if (prop.type === 'ObjectMethod') {
      const funcBody = prop.body;
      const param = prop.params;
      const async = prop.async;
      const computedBody = t.arrowFunctionExpression(param, funcBody, async);
      // 创建函数调用表达式
      const callExpression = t.callExpression(watchCallee, [watchTargetFunction, computedBody]);
      reactCovert.addCodeAstToHorizon(callExpression);
    } else if (prop.type === 'ObjectProperty') {
      if (prop.value.type === 'StringLiteral') {
        // 创建函数调用表达式
        const callExpression = t.callExpression(watchCallee, [watchTargetFunction, t.identifier(prop.value.value)]);
        reactCovert.addCodeAstToHorizon(callExpression);
      } else if (prop.value.type === 'ObjectExpression') {
        let handlerCall = null;
        let handlerOption = t.objectExpression([]);
        prop.value.properties.forEach(p => {
          if (p.key.name === 'handler') {
            if (p.type === 'ObjectMethod') {
              // 处理 handler(newValue, oldValue) {} 场景
              const funcBody = p.body;
              const param = p.params;
              const async = p.async;
              handlerCall = t.arrowFunctionExpression(param, funcBody, async);
            } else if (p.type === 'ObjectProperty') {
              // 处理函数表达式
              const handlerValue = p.value;
              if (t.isFunctionExpression(handlerValue)) {
                // 处理 handler: function(newValue, oldValue) {} 场景
                handlerCall = t.arrowFunctionExpression(handlerValue.params, handlerValue.body, handlerValue.async);
              } else if (t.isArrowFunctionExpression(handlerValue)) {
                // 处理 handler: (newValue, oldValue) => {} 场景
                handlerCall = handlerValue;
              } else if (t.isStringLiteral(handlerValue)) {
                // 转换字符串到identifier
                handlerCall = t.identifier(handlerValue.value);
              } else {
                // 处理其他可能的情况，如引用其他地方定义的函数
                handlerCall = handlerValue;
              }
            }
          } else if (p.type === 'ObjectProperty') {
            handlerOption.properties.push(t.objectProperty(p.key, p.value));
          } else {
            const mes = ' not support yet the [watch option]' + p.key.name;
            LOG.error(mes);
            throw mes;
          }
        });
        // 创建函数调用表达式
        const callExpression = t.callExpression(watchCallee, [watchTargetFunction, handlerCall, handlerOption]);
        reactCovert.addCodeAstToHorizon(callExpression);
      } else if (prop.value.type === 'FunctionExpression') {
        const funcBody = prop.value.body;
        const param = prop.value.params;
        const async = prop.value.async;
        const handlerCall = t.arrowFunctionExpression(param, funcBody, async);
        const callExpression = t.callExpression(watchCallee, [watchTargetFunction, handlerCall]);
        reactCovert.addCodeAstToHorizon(callExpression);
      } else if (prop.value.type === 'ArrayExpression') {
        const callExpression = t.callExpression(watchCallee, [watchTargetFunction, prop.value]);
        reactCovert.addCodeAstToHorizon(callExpression);
      }
    } else {
      const mes = ' not support yet the [watch option]' + p.key.name;
      LOG.error(mes);
      throw mes;
    }
  });

  if (ast.properties.length > 0) {
    reactCovert.sourceCodeContext.addExtrasImport('watch', globalLibPaths.vue);
  }
}
