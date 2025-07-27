import { traverse } from '@babel/core';
import t from '@babel/types';
import { globalLibPaths } from '../../defaultConfig.js';

const EXCLUDE_CALL_LIST = [
  'ref',
  'reactive',
  'shallowRef',
  'useStore',
  'computed',
  'defineExpose',
  'defineEmits',
  'defineProps',
  'defineOptions',
  'useSlots',
  'useAttrs',
  'useReactiveProps',
  'useI18n',
];

/**
 * 在Setup模式下为顶层变量声明添加useMemo包装
 *
 * 示例 - 变量声明转换:
 * 转换前:
 * ```
 * let count = 0;
 * let items = [];
 * let data = getData();
 * ```
 * 转换后:
 * ```
 * let count = useMemo(() => 0, []);
 * let items = useMemo(() => [], []);
 * let data = useMemo(() => getData(), []);
 * ```
 *
 * 功能说明:
 * 1. 仅在Setup模式下处理声明
 * 2. 仅处理顶层的变量声明
 * 3. 使用useMemo包装初始化表达式以防止重复执行
 * 4. 通过EXCLUDE_CALL_LIST排除特定函数调用(如ref、reactive等)
 *
 * @param {Object} reactCovert - 转换上下文对象
 */
export function handlerVariableDeclarator(reactCovert) {
  traverse(reactCovert.targetAst, {
    VariableDeclarator(path) {
      if (!reactCovert.isSetup) {
        return;
      }

      // 只处理顶层变量声明
      if (path.parentPath?.parentPath?.parentPath?.parentPath?.type !== 'Program') {
        return;
      }

      const init = path.node.init;

      // 跳过没有初始化值的声明
      if (!init) {
        return;
      }

      // 如果已经是 useMemo 调用，跳过
      if (init.type === 'CallExpression' && init.callee.name === 'useMemo') {
        return;
      }

      // 跳过黑名单中的函数调用
      if (
        init.type === 'CallExpression' &&
        init.callee.type === 'Identifier' &&
        EXCLUDE_CALL_LIST.includes(init.callee.name)
      ) {
        return;
      }

      // 创建简洁形式的箭头函数，直接返回表达式
      const arrowFunction = t.arrowFunctionExpression(
        [], // 参数
        init // 直接使用初始化表达式，不包装在 block statement 中
      );

      // 创建依赖数组
      const depsArray = t.arrayExpression([]);

      // 创建 useMemo 调用
      const useMemoCall = t.callExpression(t.identifier('useMemo'), [arrowFunction, depsArray]);

      // 替换原始初始化表达式
      path.node.init = useMemoCall;

      reactCovert.sourceCodeContext.addExtrasImport('useMemo', globalLibPaths.horizon);
    },
  });
}
