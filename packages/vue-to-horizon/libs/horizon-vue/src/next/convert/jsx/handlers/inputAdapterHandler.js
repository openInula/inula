import { traverse } from '@babel/core'
import t from '@babel/types'
import {globalLibPaths} from '../../defaultConfig.js';

export function handleInputAdapter(templateAst, reactCovert) {
  traverse(templateAst, {
    JSXElement: path => {
      const { openingElement, closingElement } = path.node;
      const { name } = openingElement;

      // 检查是否是 input 标签
      if (name.name !== 'input' && name.name !== 'textarea') {
        return;
      }
      const typeAttr = openingElement.attributes.find(
        attr => attr.name.name === 'type'
      );
      const valueAttr = openingElement.attributes.find(
        attr => attr.name.name === 'value'
      );

      if (!valueAttr) {
        return;
      }

      // 检查 type 属性是 text 或者没有 type 属性
      const isTypeText = typeAttr ? typeAttr.value?.value === 'text' : true;

      if (!isTypeText) {
        return;
      }

      // 检查 value 属性绑定的 props.XXX 变量
      const isValueBoundToProp = t.isJSXExpressionContainer(valueAttr.value)
        && t.isMemberExpression(valueAttr.value.expression)
        && (valueAttr.value.expression.object.name === 'props' || valueAttr.value.expression.object.name === 'dataReactive');

      if (isValueBoundToProp) {
        // 替换 input 标签为 ReactAdapterInput 标签
        const tag = name.name === 'input' ? 'ReactiveAdapterInput' : 'ReactiveAdapterTextarea';
        openingElement.name.name = tag;
        if (closingElement) {
          closingElement.name.name = tag;
        }
        reactCovert.sourceCodeContext.addExtrasImport(tag, globalLibPaths.vueAdapter);
      }
    },
  });
}
