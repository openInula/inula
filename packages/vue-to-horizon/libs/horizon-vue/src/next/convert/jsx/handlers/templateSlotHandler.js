import t from '@babel/types';
import { globalLibPaths } from '../../defaultConfig.js'

/**
 * 把：
 * <template #name>children</template> ==> 屬性 template_name={() => { return <Fragment>children</Fragment>}})
 * <template v-slot:item="{ todo, index }"> ==> template_item={({ todo, index }) => { ... })
 * @param path
 * @param sourceCodeContext
 * @returns {*|JSXAttribute}
 */
function processTemplate(path, sourceCodeContext) {
  const name = path.node.openingElement.name;
  if (name.name === 'template') {
    const attr = path.node.openingElement.attributes.find(attribute => attribute?.name?.namespace?.name === 'v-slot');

    if (attr) {
      let attrNameSuffix = attr.name?.name?.name || 'default';

      // 检查属性名是否以 __ 开头，这是前面故意将 #123 转成 v-slot:__123，因为 v-slot:123 label无法解析
      if (attrNameSuffix.startsWith('__')) {
        attrNameSuffix = attrNameSuffix.slice(2); // 截取 __ 后面的部分
      }

      const attrName = `template_${attrNameSuffix}`;
      const valStr = attr?.value?.value || '';

      // 递归处理子节点
      const processedChildren = path.node.children.map(child => {
        if (t.isJSXElement(child) && child.openingElement.name.name === 'template') {
          return processTemplate(
            path.get('children').find(p => p.node === child),
            sourceCodeContext
          );
        }
        return child;
      });

      const jsxElement = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('Fragment'), [], false),
        t.jsxClosingElement(t.jsxIdentifier('Fragment')),
        processedChildren,
        false
      );

      sourceCodeContext.addExtrasImport('Fragment', globalLibPaths.horizon);

      const newAttribute = t.jsxAttribute(
        t.jsxIdentifier(attrName),
        t.jsxExpressionContainer(
          t.arrowFunctionExpression(
            valStr ? [t.identifier(`(${valStr})`)] : [],
            t.blockStatement([t.returnStatement(jsxElement)]),
            false
          )
        )
      );

      // 返回新的属性，而不是直接修改父节点
      return newAttribute;
    }
  }

  // 如果不是 template 或没有 v-slot 属性，返回原始节点
  return path.node;
}

export function convertNestedTemplates(path, sourceCodeContext) {
  const name = path.node.openingElement.name;
  if (name.name !== 'template') {
    // 处理非 template 节点的子节点
    path.node.children = path.node.children.map(child => {
      if (t.isJSXElement(child)) {
        if (child.openingElement.name.name === 'template') {
          return processTemplate(
            path.get('children').find(p => p.node === child),
            sourceCodeContext
          );
        } else {
          // 递归处理其他元素
          convertNestedTemplates(
            path.get('children').find(p => p.node === child),
            sourceCodeContext
          );
        }
      }
      return child;
    });

    // 将处理后的 template 属性添加到当前节点
    path.node.openingElement.attributes = [
      ...path.node.openingElement.attributes,
      ...path.node.children.filter(t.isJSXAttribute),
    ];

    // 移除已转换为属性的 template 节点
    path.node.children = path.node.children.filter(child => !t.isJSXAttribute(child));
  } else {
    // 如果顶层节点是 template，直接处理它
    const result = processTemplate(path, sourceCodeContext);
    if (t.isJSXAttribute(result)) {
      path.replaceWith(result);
    }
  }
}


