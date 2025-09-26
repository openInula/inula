import { globalLibPaths } from '../../../defaultConfig.js';
import t from '@babel/types';

export const V_FOR = 'vfor';

/**
 * 处理 Vue v-for 指令到 Horizon JSX map 表达式的转换
 *
 * 示例1 - 基础数组循环:
 * 转换前:
 * <div v-for="item in items">
 *   {{ item.name }}
 * </div>
 *
 * 转换后:
 * {items && items.map((item, index) => (
 *   <div>
 *     {item.name}
 *   </div>
 * ))}
 *
 * 示例2 - 带索引的循环:
 * 转换前:
 * <li v-for="(item, idx) in items">
 *   {{idx}}: {{item}}
 * </li>
 *
 * 转换后:
 * {items && items.map((item, idx) => (
 *   <li>
 *     {idx}: {item}
 *   </li>
 * ))}
 *
 * 示例3 - 数组解构的循环:
 * 转换前:
 * <div v-for="[name, age] in users">
 *   {{name}} 年龄是 {{age}}
 * </div>
 *
 * 转换后:
 * {users && users.map(([name, age], index) => (
 *   <div>
 *     {name} 年龄是 {age}
 *   </div>
 * ))}
 *
 * 示例4 - 对象解构的循环:
 * 转换前:
 * <div v-for="{name, age} in users">
 *   {{name}} 年龄是 {{age}}
 * </div>
 *
 * 转换后:
 * {users && users.map(({name, age}, index) => (
 *   <div>
 *     {name} 年龄是 {age}
 *   </div>
 * ))}
 *
 * 示例5 - 数字范围循环:
 * 转换前:
 * <span v-for="n in 5">{{ n }}</span>
 *
 * 转换后:
 * {Array.from({ length: 5 }, (_, i) => i + 1).map((n, index) => (
 *   <span>{n}</span>
 * ))}
 *
 * @param {Object} path - AST 路径对象，表示 v-for 指令
 * @param {string} value - v-for 表达式字符串（例如："item in items"）
 * @param {Object} sourceCodeContext - 上下文对象，用于管理导入和其他转换
 */
export function handleForDirective(path, value, sourceCodeContext) {
  // 获取父级路径和子节点，用于重建 JSX 结构
  const parentPath = path.parentPath.parentPath;
  const children = parentPath.node.children;

  // 处理元素名称，如果是 template 标签则转换为 Fragment
  let elementName = parentPath.node.openingElement.name.name;
  if (elementName === 'template') {
    elementName = 'Fragment';
    sourceCodeContext.addExtrasImport('Fragment', globalLibPaths.horizon);
  }

  // 解析 v-for 表达式，获取项目名、索引名和列表名
  const [, item, index = 'index', , list] = parseVFor(value);

  // 处理不同类型的循环项声明（普通变量、数组解构、对象解构）
  const isArrayPattern = item.startsWith('[') && item.endsWith(']');
  const isObjectPattern = item.startsWith('{') && item.endsWith('}');

  // 根据声明类型创建对应的参数模式
  const params = isArrayPattern
    ? t.arrayPattern(
        // 处理数组解构，如 [a, b, c] in items
        item
          .slice(1, -1)
          .split(',')
          .map(el => t.identifier(el.trim()))
      )
    : isObjectPattern
      ? t.objectPattern(
          // 处理对象解构，如 {name, age} in users
          item
            .slice(1, -1)
            .split(',')
            .map(el => t.objectProperty(t.identifier(el.trim()), t.identifier(el.trim()), false, true))
        )
      : t.identifier(item); // 处理普通变量，如 item in items

  // 处理索引参数命名冲突，如果项目名为 index，则使用 _index 作为索引名
  const indexParam = item === 'index' ? t.identifier('_index') : t.identifier(index);

  // 移除原有的 v-for 属性，保留其他属性
  const newAttrs = [];
  parentPath.node.openingElement.attributes.forEach(attr => {
    if (attr.name.name !== 'v-for') {
      newAttrs.push(attr);
    }
  });

  // 处理数字范围循环，如 v-for="n in 5"
  const isNumber = /^\d+$/.test(list);
  let mapList = t.identifier(list);
  if (isNumber) {
    // 将数字转换为数组，并使用 Array.from 生成序列
    mapList = t.callExpression(t.identifier('Array.from'), [
      t.objectExpression([t.objectProperty(t.identifier('length'), t.numericLiteral(parseInt(list)))]),
      t.arrowFunctionExpression(
        [t.identifier('_'), t.identifier('i')],
        t.binaryExpression('+', t.identifier('i'), t.numericLiteral(1))
      ),
    ]);
  }

  // 创建转换后的 JSX 元素结构
  const element = t.jsxElement(
    t.jSXOpeningElement(t.jSXIdentifier(elementName), [
      ...newAttrs,
      // 添加 vfor={true} 属性
      t.jsxAttribute(t.jsxIdentifier(V_FOR), t.stringLiteral(index)),
    ]),
    t.jSXClosingElement(t.jSXIdentifier(elementName)),
    children
  );

  // 创建最终的条件渲染和map表达式
  // 格式：list && list.map((item, index) => (...))
  const checkAndMapExpression = t.logicalExpression(
    '&&',
    mapList,
    t.callExpression(t.memberExpression(mapList, t.identifier('map')), [
      t.arrowFunctionExpression([params, indexParam], t.blockStatement([t.returnStatement(element)])),
    ])
  );

  // 将表达式包装为 JSX 表达式容器
  const expressionContainer = t.jSXExpressionContainer(checkAndMapExpression);

  // 替换原有节点
  if (parentPath.container) {
    parentPath.replaceWith(expressionContainer);
    return;
  }

  // 处理直接嵌套的 v-for 情况
  // 注意：当前实现可能存在嵌套 v-for 的 bug，需要进一步验证和完善
  parentPath.node = expressionContainer;
}

/**
 * 解析 v-for 指令字符串为其组成部分
 *
 * v-for 字符串解析示例:
 * - "item in items" => ["item in items", "item", "index", "in", "items"]
 * - "(item, index) in items" => ["(item, index) in items", "item", "index", "in", "items"]
 * - "[a, b, c] in items" => ["[a, b, c] in items", "[a, b, c]", "index", "in", "items"]
 * - "{a, b, c} in items" => ["{a, b, c} in items", "{a, b, c}", "index", "in", "items"]
 *
 * @param {string} vForString - 要解析的 v-for 指令字符串
 * @returns {Array} 包含匹配组件的数组 [完整匹配, 项目, 索引, 操作符, 列表]
 * @throws {Error} 如果 v-for 字符串无效则抛出错误
 */
export function parseVFor(vForString) {
  // 标准化字符串，移除换行符
  const targetStr = vForString.replace(/(\r\n|\n)/g, ' ');

  // 使用正则表达式匹配 v-for 表达式的各个部分
  // 支持以下格式：
  // - 普通变量: item in items
  // - 带索引: (item, index) in items
  // - 数组解构: [a, b] in items
  // - 对象解构: {a, b} in items
  const regex = /^\(?\s*(\{.*?\}|\[.*?\]|\w+)\s*(?:,\s*([$\w]+)\s*)*\)?\s*(in|of)\s+(.+)\s*$/;
  const match = targetStr.match(regex);

  if (match) {
    return match;
  } else {
    throw new Error('v-for 表达式格式无效');
  }
}
