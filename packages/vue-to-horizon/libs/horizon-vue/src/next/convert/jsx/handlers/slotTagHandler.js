import { traverse } from '@babel/core';
import t from '@babel/types';
import { kebabToPascalCase } from '../../nodeUtils.js';

/**
 * 示例1 - 处理默认插槽:
 * 转换前:
 * <MyComponent>
 *   <slot></slot>
 * </MyComponent>
 * 转换后:
 * <MyComponent>
 *   {props.template_default?.() || props.children}
 * </MyComponent>
 *
 * 示例2 - 处理具名插槽:
 * 转换前:
 * <MyComponent>
 *   <slot name="header"></slot>
 * </MyComponent>
 * 转换后:
 * // 先生成插槽组件变量
 * const SlotHeader = props['template_header'];
 * // 然后在JSX中使用
 * <MyComponent>
 *   {SlotHeader?.({name: "header"})}
 * </MyComponent>
 *
 * 示例3 - 处理动态插槽:
 * 转换前:
 * <MyComponent>
 *   <slot :name="dynamicName"></slot>
 * </MyComponent>
 * 转换后:
 * <MyComponent>
 *   {props[`template_${dynamicName}`]?.()}
 * </MyComponent>
 *
 * 示例4 - 处理带属性的具名插槽:
 * 转换前:
 * <MyComponent>
 *   <slot name="icon" size="small" :active="isActive"></slot>
 * </MyComponent>
 * 转换后:
 * // 先生成插槽组件变量
 * const SlotIcon = props['template_icon'];
 * // 然后在JSX中使用，将属性作为参数传递
 * <MyComponent>
 *   {SlotIcon?.({name: "icon", size: "small", active: isActive})}
 * </MyComponent>
 */
export function handleSlotTag(templateAst, reactCovert) {
  const slotNames = []; // 用于追踪已处理的插槽名称，避免重复声明

  // 遍历AST寻找slot标签
  traverse(templateAst, {
    JSXElement: path => {
      const name = path.node.openingElement.name;
      if (name.name === 'slot') {
        reactCovert.addUseReactiveProps();

        // 获取slot的name属性
        const slotAttr = path.node.openingElement.attributes.find(
          v => v.name?.name === 'name' || v.name?.name?.name === 'name'
        );

        if (!slotAttr || slotAttr?.value?.value === 'default') {
          // 处理默认插槽场景
          // 转换 <slot></slot> 为 {props.template_default?.() || props.children}
          const expression = generatePropsChildren(path, reactCovert.sourceCodeContext);
          path.replaceWith(expression);
        } else {
          let templateName;
          let isDynamicSlot = false;

          // 判断是否为动态插槽名称
          if (t.isJSXExpressionContainer(slotAttr.value)) {
            // 动态插槽场景: <slot :name="item.id">
            isDynamicSlot = true;
            templateName = slotAttr.value.expression;
          } else {
            // 静态插槽场景: <slot name="header">
            templateName = slotAttr.value.value || 'default';
          }

          if (isDynamicSlot) {
            // 处理动态插槽
            // 生成: {props[`template_${dynamicName}`]?.()}
            const expression = generatePropsChildren(path, reactCovert.sourceCodeContext, templateName);
            path.replaceWith(expression);
          } else {
            // 处理静态具名插槽
            // 生成变量声明: const SlotHeader = props['template_header']
            const componentName = `Slot${kebabToPascalCase(templateName)}`;

            // 避免重复声明同名插槽组件
            if (!slotNames.includes(componentName)) {
              slotNames.push(componentName);
              const scriptAst = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier(componentName),
                  t.memberExpression(
                    t.identifier(reactCovert.sourceCodeContext.propsName),
                    t.stringLiteral(`template_${templateName}`),
                    true
                  )
                ),
              ]);
              reactCovert.addCodeAstToHorizon(scriptAst);
            }

            // 收集并转换slot标签上的所有属性
            const attributes = path.node.openingElement.attributes || [];
            const propsProperties = attributes
              .map(attr => {
                if (t.isJSXAttribute(attr)) {
                  const name = attr.name.name;
                  let value;

                  if (t.isJSXExpressionContainer(attr.value)) {
                    value = attr.value.expression;
                  } else if (attr.value === null) {
                    value = t.booleanLiteral(true);
                  } else {
                    value = attr.value;
                  }

                  return t.objectProperty(t.identifier(name), value);
                }
                return null;
              })
              .filter(Boolean);

            // 创建插槽props对象
            const slotProps = t.objectExpression(propsProperties);

            // 生成插槽调用表达式: SlotHeader?.({name: "header"})
            const callExpression = t.optionalCallExpression(t.identifier(componentName), [slotProps], true);

            // 根据上下文决定是否需要JSX表达式容器包装
            const finalExpression = isInJSXExpressionContainer(path)
              ? t.jsxExpressionContainer(callExpression)
              : callExpression;

            path.replaceWith(finalExpression);
          }
        }
      }
    },
  });
}

/**
 * 示例1 - 处理默认插槽:
 * 转换前:
 * <MyComponent>
 *   <slot>默认内容</slot>
 * </MyComponent>
 * 转换后:
 * <MyComponent>
 *   {props.template_default?.() || props.children}
 * </MyComponent>
 *
 * 示例2 - 处理动态插槽:
 * 转换前:
 * <MyComponent>
 *   <slot :name="slotName">动态内容</slot>
 * </MyComponent>
 * 转换后:
 * <MyComponent>
 *   {props[`template_${slotName}`]?.()}
 * </MyComponent>
 */
export function generatePropsChildren(path, sourceCodeContext, dynamicName = null) {
  let templateKey;

  if (dynamicName) {
    // 动态插槽：生成模板字符串键名
    // 例如: 将 slotName 转换为 'template_' + slotName
    templateKey = t.binaryExpression('+', t.stringLiteral('template_'), dynamicName);
  } else {
    // 静态默认插槽：使用固定的 'template_default' 键名
    templateKey = t.stringLiteral('template_default');
  }

  // 构建属性访问表达式
  // 例如: props['template_default'] 或 props['template_' + slotName]
  const templateAccess = t.memberExpression(
    t.identifier(sourceCodeContext.propsName),
    templateKey,
    true // 使用中括号访问以支持动态属性名
  );

  // 构建函数调用表达式
  // 将插槽模板作为函数调用
  // 例如: props['template_default']() 或 props['template_' + slotName]()
  const templateCall = t.callExpression(templateAccess, []);

  // 构建安全的条件调用表达式
  // 确保模板函数存在才调用
  // 例如: props['template_default'] && props['template_default']()
  const templateAndCall = t.logicalExpression('&&', templateAccess, templateCall);

  let finalExpression;

  if (dynamicName) {
    // 动态插槽不需要 fallback 到 children
    finalExpression = templateAndCall;
  } else {
    // 默认插槽需要 fallback 到 children
    // 当默认插槽内容不存在时，使用 props.children 作为后备内容
    const propsChildren = t.memberExpression(t.identifier(sourceCodeContext.propsName), t.identifier('children'));
    // 生成: props['template_default']?.() || props.children
    finalExpression = t.logicalExpression('||', templateAndCall, propsChildren);
  }

  // 根据上下文环境决定是否需要 JSX 表达式容器包装
  // 例如在 v-if 等指令转换场景下需要包装
  // <slot v-if="condition"> -> {condition && (props.template_default?.() || props.children)}
  return isInJSXExpressionContainer(path)
    ? t.jsxExpressionContainer(finalExpression) // 包装为 JSX 表达式
    : finalExpression; // 保持原始表达式
}

// 判断父组件是否是JSX标签
function isInJSXExpressionContainer(path) {
  // 获取父节点
  const parentPath = path.parentPath;

  if (!parentPath) {
    return false;
  }

  // 检查父节点是否是 JSXElement
  return t.isJSXElement(parentPath.node);
}
