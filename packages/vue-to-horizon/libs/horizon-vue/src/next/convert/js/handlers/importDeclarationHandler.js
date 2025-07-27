import t from '@babel/types';
import { traverse } from '@babel/core';
import { globalLibPaths } from '../../defaultConfig.js';
import { convertUIComponentImported } from '../../nodeUtils.js';

/**
 * 处理导入声明语句的转换器
 *
 * 主要功能:
 * 1. 将 Vue 相关的引用切换为对应的适配器引用
 *    示例:
 *    - 输入: import { ref, reactive } from 'vue'
 *    - 输出: import { ref, reactive } from 'adapters/vueAdapter'
 *
 * 2. 将 Vue 组件中的导入语句迁移到新的 AST 语法树中
 *    示例:
 *    - 输入: import { ElMessage } from 'element-plus'
 *    - 输出: import { XXX as ElMessage } from 'YYY'
 *
 * 3. 处理别名导入
 *    示例:
 *    - 输入: import { ref as myRef, computed as myComputed } from 'vue'
 *    - 输出: 将别名信息收集到 aliasApiSet 中: { ref: Set(['myRef']), computed: Set(['myComputed']) }
 *
 * 4. 处理组件引用的扩展名转换
 *    示例:
 *    - 输入: import TodoList from './TodoList.vue'
 *    - 输出: import TodoList from './TodoList.jsx'
 *
 * 5. 处理组件名称的大小写规范化
 *    示例:
 *    - 输入: import todoItem from './todoItem.vue'
 *    - 输出: import TodoItem from './todoItem.jsx'
 *
 * @param {Object} ast - 源代码的抽象语法树
 * @param {Object} reactCovert - React转换上下文对象
 * @param {Object} options - 配置选项
 * @param {Map} options.importRenameMap - 导入重命名映射表，用于存储需要重命名的组件名称
 *                                       例如: new Map([['todoItem', 'TodoItem']])
 * @param {Object} options.component - 组件相关配置信息
 * @returns {Object} 返回处理结果
 * @returns {Object} result.aliasApiSet - 收集的 API 别名集合
 *                                       例如: { ref: Set(['myRef']), computed: Set(['myComputed']) }
 */
export function importDeclarationHandler(ast, reactCovert, { importRenameMap, component }) {
  const aliasApiSet = {
    ref: new Set(),
    computed: new Set(),
    reactive: new Set(),
  };

  const willAppendToImports = [];
  traverse(ast, {
    // 指定节点类型和对应的函数
    ImportDeclaration: path => {
      const importDeclaration = path.node;
      // 取得当前的 import 声明节点
      const sourceName = importDeclaration.source.value;
      if (Reflect.has(globalLibPaths, sourceName)) {
        /*
          import { xx1 as XX, xx2 } from 'vue'
          import { xx3, xx4 } from 'vue'
        */
        const replaceSource = Reflect.get(globalLibPaths, sourceName);
        importDeclaration.source.value = replaceSource?.path || replaceSource || sourceName;
        importDeclaration.specifiers.forEach(node => {
          const localName = node.local.name; // 别名
          const importedName = node.imported?.name;
          if (importedName === 'ref') {
            aliasApiSet.ref.add(localName || importedName);
          } else if (importedName === 'computed') {
            aliasApiSet.computed.add(localName || importedName);
          } else if (importedName === 'reactive') {
            aliasApiSet.reactive.add(localName || importedName);
          }

          /**
           *  如：mapState => 'useMapState'
           */
          if (replaceSource?.imports) {
            node.local.name = replaceSource?.imports[node.imported?.name] || node.local.name;
            node.imported.name = replaceSource?.imports[node.imported?.name] || node.imported.name;
          }
        });
      }

      /*
        例如: import { ElMessage } from 'element-plus';  ElMessage.warn('hello')
        转换成: import { XXX as ElMessage } from 'YYY';  ElMessage.warn('hello')
      */
      convertUIComponentImported(path, t, component);

      if (path?.node?.source?.type === 'StringLiteral') {
        if (path.node.source.value.endsWith('.vue')) {
          path.node.source.value = path.node.source.value.replace('.vue', '.jsx');
        }
      }

      /*
        处理option api类型的组件中，组件名大小写的问题
        import todoItem from './todoItem.vue'
        import TodoItem2 from './todoItem2.vue'
        export default {
          components: {
            todoItem,
            TodoItem2
          },
        }
        =====>
        import TodoItem from './todoItem.vue'
        import TodoItem2 from './todoItem2.vue'
      */
      if (importRenameMap) {
        path?.node?.specifiers.forEach(specifier => {
          const { local, imported } = specifier;
          if (local && importRenameMap.has(local.name)) {
            specifier.local.name = importRenameMap.get(local.name);
          }
          if (imported && importRenameMap.has(imported.name)) {
            specifier.imported.name = importRenameMap.get(imported.name);
          }
        });
      }

      willAppendToImports.push(path.node);
    },
  });

  handleImportantNode(willAppendToImports, reactCovert);

  return {
    aliasApiSet,
  };
}

/**
 * 将导入的节点都缓存在reactCovert.extrasImports，以便于去重
 * @param {*} imports
 * @param {*} reactCovert
 */
function handleImportantNode(imports, reactCovert) {
  imports.forEach(node => {
    if (node.source?.value && node.specifiers.length > 0) {
      node.specifiers.forEach(sNode => {
        const importedName = sNode.imported?.name;
        const localName = sNode.local?.name;
        if (importedName && node.source?.value) {
          const keyName = localName === importedName ? importedName : `${importedName} as ${localName}`;
          reactCovert.sourceCodeContext.addExtrasImport(keyName, node.source?.value);
        } else {
          reactCovert.addImportDeclaration(node);
        }
      });
    } else {
      reactCovert.addImportDeclaration(node);
    }
  });
}

/**
 * import的 .vue 转 .jsx
 * 如：() => import('../views/HomeView.vue') ===> () => import('../views/HomeView.jsx')
 * @param ast
 */
export function importVueToJSX(ast) {
  traverse(ast, {
    Import(path) {
      const argument = path.parent.arguments[0];

      if (t.isTemplateLiteral(argument)) {
        argument.quasis.forEach(templateElement => {
          templateElement.value.raw = templateElement.value.raw.replace('.vue', '.jsx');
          templateElement.value.cooked = templateElement.value.cooked.replace('.vue', '.jsx');
        });
      } else if (t.isStringLiteral(argument)) {
        argument.value = argument.value.replace('.vue', '.jsx');
      }
    },
  });
}

/**
 * 转换前：export default (props) => {}
 * 转换后：function Xxx(props) => {}; export default Xxx;
 * @param ast
 * @param reactCovert
 */
export function toNamingFunction(ast, reactCovert) {
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;

      if (t.isArrowFunctionExpression(declaration) || t.isFunctionExpression(declaration)) {
        // 生成一个组件名称，将连字符转换为驼峰命名
        const componentName = (reactCovert.name || 'Component').replace(/-([a-z])/g, (match, letter) =>
          letter.toUpperCase()
        );

        // 创建命名函数声明
        const functionDeclaration = t.functionDeclaration(
          t.identifier(componentName),
          declaration.params,
          declaration.body,
          declaration.generator,
          declaration.async
        );

        // 替换原来的 export default
        path.replaceWithMultiple([functionDeclaration]);
      }
    },
  });
}
