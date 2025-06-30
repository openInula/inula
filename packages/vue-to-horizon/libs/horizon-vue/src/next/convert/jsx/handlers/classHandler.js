import t from '@babel/types';

/**
 * 合并多个className属性为单个classnames调用
 *
 * 示例1 - 合并多个字符串类型的className:
 * 转换前:
 * <div className="foo" className="bar baz" />
 * 转换后:
 * <div className={classnames("foo bar baz")} />
 *
 * 示例2 - 合并字符串和条件类名:
 * 转换前:
 * <div className="base" className={classnames(active && 'active')} />
 * 转换后:
 * <div className={classnames("base", active && 'active')} />
 *
 * 示例3 - 合并多个classnames调用:
 * 转换前:
 * <div
 *   className={classnames('btn', primary && 'btn-primary')}
 *   className={classnames(disabled && 'disabled')}
 * />
 * 转换后:
 * <div className={classnames('btn', primary && 'btn-primary', disabled && 'disabled')} />
 */
export function mergeClassNames(path) {
  const newAttrs = [];
  const classNameAttrs = [];

  // 收集所有className属性
  path.node.openingElement.attributes.forEach(n => {
    try {
      if (n?.name?.name === 'className') {
        classNameAttrs.push(n);
      } else {
        newAttrs.push(n);
      }
    } catch (error) {
      console.log(error, path);
    }
  });

  if (classNameAttrs.length > 1) {
    let classNamesArgs = [];
    let stringLiterals = [];

    // 处理每个className属性
    classNameAttrs.forEach(attr => {
      const value = attr.value;
      if (value.type === 'JSXExpressionContainer') {
        const expr = value.expression;
        if (t.isCallExpression(expr) && expr.callee.name === 'classnames') {
          // 如果是classnames调用，收集其参数
          classNamesArgs = [...classNamesArgs, ...expr.arguments];
        } else if (t.isStringLiteral(expr)) {
          // 字符串字面量
          stringLiterals.push(expr.value);
        } else {
          // 其他表达式
          classNamesArgs.push(expr);
        }
      } else if (t.isStringLiteral(value)) {
        // 直接的字符串字面量
        stringLiterals.push(value.value);
      }
    });

    // 如果有字符串字面量，将它们合并并添加到参数列表
    if (stringLiterals.length > 0) {
      const combinedString = stringLiterals.join(' ').trim();
      if (combinedString) {
        classNamesArgs.push(t.stringLiteral(combinedString));
      }
    }

    // 创建新的classnames调用
    const classNamesCall = t.callExpression(
      t.identifier('classnames'),
      classNamesArgs
    );

    // 创建新的className属性
    const newClassAttr = t.jsxAttribute(
      t.jsxIdentifier('className'),
      t.jsxExpressionContainer(classNamesCall)
    );

    newAttrs.push(newClassAttr);
    path.node.openingElement.attributes = newAttrs;
  }
}
