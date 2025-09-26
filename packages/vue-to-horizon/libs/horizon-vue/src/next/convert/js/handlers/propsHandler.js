import t, { NullLiteral } from '@babel/types';
import LOG from '../../../logHelper.js';

/**
 * 函数用于解析Vue组件的props定义，并将其转换为Horizon组件的props格式
 * 处理包括默认值、类型定义和数组形式的props声明
 *
 * 示例1 - 处理对象形式的props:
 * 转换前:
 * props: {
 *   title: {
 *     type: String,
 *     default: 'Hello'
 *   },
 *   onClick: {
 *     type: Function
 *   }
 * }
 * 转换后:
 * { title: { default: 'Hello' }, onClick: { type: Function } }
 *
 * 示例2 - 处理数组形式的props:
 * 转换前:
 * props: ['message', 'content']
 * 转换后:
 * { message: {}, content: {} }
 *
 * @param {Object} ast - props定义的AST节点
 * @param {Object} reactCovert - 用于存储转换结果的对象实例
 */
export function propsParser(ast, reactCovert) {
  // 用于存储最终转换后的JS对象形式的props
  const propsObj = {};
  // 用于存储转换后的AST属性节点
  const properties = [];

  // 处理数组形式的props定义
  if (ast.type === 'ArrayExpression') {
    ast.elements.forEach(ele => {
      if (ele.type === 'StringLiteral') {
        // 为每个数组项创建一个空对象属性
        properties.push(t.objectProperty(t.stringLiteral(ele.value), t.objectExpression([]), false, true));
        propsObj[ele.value] = ele.value;
      } else {
        LOG.warn('不支持的props定义格式', ele);
      }
    });
  } else {
    // 处理对象形式的props定义
    ast.properties?.forEach(prop => {
      // 收集props定义到functionParamObj
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        let value;
        // 处理嵌套的对象属性
        if (t.isObjectExpression(prop.value)) {
          value = prop.value.properties.reduce((acc, prop2) => {
            if (t.isObjectProperty(prop2) && t.isIdentifier(prop2.key)) {
              acc[prop2.key.name] = convertPropertyValue(prop2.value);
            }
            return acc;
          }, {});
        } else {
          value = convertPropertyValue(prop.value);
        }
        propsObj[prop.key.name] = value;
      }

      // 处理props的类型和默认值
      if (t.isObjectProperty(prop) && t.isObjectExpression(prop.value)) {
        // 查找默认值属性
        let defaultProps = prop.value.properties.find(prop => prop.key.name === 'default');
        let objectExpression = [defaultProps];
        if (defaultProps) {
          // 查找类型属性
          const typeProps = prop.value.properties.find(prop => prop.key.name === 'type');
          if (typeProps && typeProps.value.name === 'Function') {
            // Function类型的props需要特殊处理
            objectExpression.push(t.objectProperty(t.identifier('type'), t.identifier('Function')));
          }
        } else {
          objectExpression = [t.objectProperty(t.identifier('default'), t.identifier('undefined'))];
        }
        properties.push(t.objectProperty(t.identifier(prop.key.name), t.objectExpression(objectExpression)));
      }
    });
  }

  // 更新reactCovert实例的props信息
  reactCovert.addUseReactiveProps(properties);
  reactCovert.setComponentProps(propsObj);
}

/**
 * 将AST节点的值转换为对应的JavaScript值
 * 支持转换基本类型、数组和对象
 *
 * 示例:
 * AST节点: { type: 'StringLiteral', value: 'hello' }
 * 转换结果: 'hello'
 *
 * @param {Object} node - AST节点
 * @returns {*} 转换后的JavaScript值
 */
function convertPropertyValue(node) {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'NumericLiteral' || node.type === 'StringLiteral') return node.value;
  if (node.type === 'BooleanLiteral') return node.value;
  if (node.type === 'ArrayExpression') return node.elements.map(convertPropertyValue);
  if (node.type === 'ObjectExpression') {
    const object = {};
    node.properties.forEach(prop => {
      if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
        object[prop.key.name] = convertPropertyValue(prop.value);
      }
    });
    return object;
  }
  if (node.type === 'NullLiteral') return null;
  return undefined;
}
