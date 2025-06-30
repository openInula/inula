import { traverse } from '@babel/core';
import { capitalizeFirstLetter } from '../jsUtils.js';

/**
 * 解析Vue组件中的组件注册信息
 *
 * 该函数用于处理Vue组件中注册的子组件,主要完成以下工作:
 * 1. 扫描export default中的components配置项
 * 2. 收集所有注册的组件名称
 * 3. 对首字母小写的组件名进行大写转换(如: todoItem -> TodoItem)
 * 4. 将组件注册信息存储到reactCovert上下文中
 *
 * 示例:
 * Vue 组件代码:
 * ```
 * // TodoList.vue
 * import todoItem from './todoItem.vue'
 * import TodoItem2 from './todoItem2.vue'
 *
 * export default {
 *   components: {
 *     todoItem,
 *     TodoItem2
 *   },
 *   data() {
 *     return {
 *       items: []
 *     }
 *   }
 * }
 * ```
 *
 * 转换后的 Horizon 组件代码:
 * ```
 * // TodoList.jsx
 * import TodoItem from './TodoItem'
 * import TodoItem2 from './TodoItem2'
 *
 * const TodoList = () => {
 *   const [items, setItems] = useState([])
 *
 *   return (
 *     <div>
 *       <TodoItem />
 *       <TodoItem2 />
 *     </div>
 *   )
 * }
 * ```
 *
 * @param {Object} ast - 代码的AST(抽象语法树)
 * @param {Object} reactCovert - React转换上下文对象
 * @returns {void}
 */
export function componentsParser(ast, reactCovert) {
  const registerComponentMap = new Map();

  traverse(ast, {
    ObjectProperty(path) {
      // 判断节点是export default下的components定义
      if (path.node.key.name === 'components' && path.parentPath.parentPath.type === 'ExportDefaultDeclaration') {
        const componentsNode = path.node.value;
        if (componentsNode.type === 'ObjectExpression') {
          componentsNode.properties.forEach(prop => {
            if (prop.key.type === 'Identifier') {
              const componentName = prop.key.name;
              // todoItem -> TodoItem
              registerComponentMap.set(componentName, capitalizeFirstLetter(prop.value.name));
            }
          });
        }
      }
    },
  });

  reactCovert.sourceCodeContext.importComponents = registerComponentMap;
}
