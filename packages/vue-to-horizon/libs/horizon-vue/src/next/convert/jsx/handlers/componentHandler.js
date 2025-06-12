import t from '@babel/types';

export function handleCustomComponent(path, targetReact) {
  // <component>转换成自定义组件
  path.node.openingElement.attributes.push(
    t.jSXAttribute(t.jSXIdentifier('components'), t.jSXExpressionContainer(t.identifier('components')))
  );
  const jsxElement = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('DynamicComponent'), path.node.openingElement.attributes, false), // <div>
    t.jsxClosingElement(t.jsxIdentifier('DynamicComponent')), // </div>
    path.node.children, // 子节点
    false // 闭合标签
  );
  path.replaceWith(jsxElement);
  targetReact.sourceCodeContext.addExtrasImport('DynamicComponent', 'adapters/vueAdapter');
}
