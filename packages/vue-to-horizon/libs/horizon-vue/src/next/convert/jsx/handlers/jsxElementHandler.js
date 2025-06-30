import t from '@babel/types';
import { traverse } from '@babel/core';
import { handleCustomComponent } from './componentHandler.js';
import { globalComponent, globalComponentConfig } from '../../defaultConfig.js';
import { kebabToPascalCase } from '../../nodeUtils.js';

/**
 * 处理JSX元素的转换，包括组件、过渡效果和全局组件的处理
 *
 * 示例1 - 处理自定义组件:
 * 转换前:
 * <component :is="dynamicComponent" :prop="value" />
 * 转换后:
 * <DynamicComponent prop={value} />
 *
 * 示例2 - 处理过渡组件:
 * 转换前:
 * <transition name="fade">
 *   <div>content</div>
 * </transition>
 * 转换后:
 * <div>
 *   <div>content</div>
 * </div>
 *
 * 示例3 - keep-alive转换:
 * 转换前:
 * <keep-alive>
 *   <component-a />
 * </keep-alive>
 * 转换后:
 * <KeepAlive>
 *   <ComponentA />
 * </KeepAlive>
 *
 * 示例4 - 全局组件处理:
 * 转换前:
 * <router-link to="/">Home</router-link>
 * 转换后:
 * <GlobalComponent componentName="RouterLink" to="/">Home</GlobalComponent>
 *
 * @param {Object} templateAst - 模板的AST（抽象语法树）
 * @param {Object} reactCovert - React转换器实例，包含sourceCodeContext等工具方法
 * @param {Object} component - 组件配置信息，包含标签映射等
 */
export function handlerJSXElement(templateAst, reactCovert, component) {
  traverse(templateAst, {
    JSXElement: path => {
      const name = path.node.openingElement.name;
      if (name.name === 'component') {
        handleCustomComponent(path, reactCovert);
      } else if (name.name === 'Transition' || name.name === 'transition') {
        // 不支持<Transition>或<transition>，直接转成<div>保证整体功能正常
        const openingElement = path.node.openingElement;
        const closingElement = path.node.closingElement;

        // 将开始标签改为 <div>
        openingElement.name = t.jsxIdentifier('div');

        // 如果有结束标签，也将其改为 </div>
        if (closingElement) {
          closingElement.name = t.jsxIdentifier('div');
        }
      } else if (name.name === 'keep-alive') {
        // 处理 keep-alive 标签，转换为 Horizon 的 KeepAlive 组件
        const openingElement = path.node.openingElement;
        const closingElement = path.node.closingElement;

        // 将开始标签从 keep-alive 改为 KeepAlive
        openingElement.name = t.jsxIdentifier('KeepAlive');

        // 如果存在闭合标签，将其也改为 KeepAlive
        if (closingElement) {
          closingElement.name = t.jsxIdentifier('KeepAlive');
        }

        // 在代码上下文中添加 KeepAlive 组件的导入语句
        reactCovert.sourceCodeContext.addExtrasImport('KeepAlive', 'adapters/vueAdapter');
      } else if (name.name === 'slot') {
        // 先不处理
      } else if (Reflect.has(globalComponent, name.name)) {
        // 定位要替换的attribute
        const attributes = path.node.openingElement.attributes;
        // 创建新的attribute
        const nameAttribute = t.jSXAttribute(
          t.jSXIdentifier('componentName'),
          t.stringLiteral(kebabToPascalCase(name.name))
        );
        // 添加新的attribute
        const newAttributes = [nameAttribute, ...attributes];
        const closingElement = path.node.closingElement
          ? t.jSXClosingElement(t.jSXIdentifier(globalComponentConfig.render))
          : null;
        // 创建新的JSX元素
        const globalElement = t.jSXElement(
          t.jSXOpeningElement(
            t.jSXIdentifier(globalComponentConfig.render),
            newAttributes,
            path.node.openingElement.selfClosing
          ),
          closingElement,
          path.node.children
        );
        // 用新元素替换旧元素
        path.replaceWith(globalElement);
        // 添加上下文 import GlobalComponent from 'adapters/component.jsx'
        reactCovert.sourceCodeContext.addExtrasImport(globalComponentConfig.render, globalComponentConfig.importPath);
      }

      // 组件库映射
      if (component) {
        // 需要在自定义指令前处理组件库映射
        replaceCustomElementTag(path, reactCovert, component);
      }
    },
  });
}

/**
 * 替换自定义UI组件标签，将Vue组件库标签转换为对应的React组件标签
 *
 * 转换示例:
 * 输入:
 * <el-button type="primary" v-model="value">提交</el-button>
 *
 * 配置:
 * {
 *   tag: {
 *     'el-button': {
 *       targetTag: 'Button',
 *       source: '@/components/Button',
 *       attributesMap: {
 *         'v-model': 'value'
 *       }
 *     }
 *   }
 * }
 *
 * 输出:
 * <Button type="primary" value={value}>提交</Button>
 *
 */
function replaceCustomElementTag(path, reactCovert, component) {
  const name = path.node?.openingElement?.name || '';
  const config = component?.tag[name.name];
  if (!config) {
    return;
  }
  const { targetTag, source, attributesMap = {} } = config;
  name.name = targetTag;
  if (path.node.closingElement) {
    path.node.closingElement.name.name = targetTag;
  }
  path.node.openingElement.attributes.forEach(attr => {
    // 包含namespace场景下获取name结构 attr.name.name.name, 正常是attr.name.name
    const isNameSpace = attr.name.type === 'JSXNamespacedName';
    const attrName = isNameSpace ? attr.name.name.name : attr.name.name;
    if (attrName && attributesMap[attrName]) {
      if (isNameSpace) {
        attr.name.name.name = attributesMap[attrName];
        return;
      }
      attr.name.name = attributesMap[attrName];
    }
  });
  if (source) {
    reactCovert.sourceCodeContext.addExtrasImport(targetTag, source);
  }
}
