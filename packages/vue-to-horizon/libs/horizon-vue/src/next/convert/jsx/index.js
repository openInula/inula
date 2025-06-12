import t from '@babel/types';
import parser from '@babel/parser';
import { traverse } from '@babel/core';
import vuesfc from '@vue/compiler-sfc';
import LOG from '../../logHelper.js';
import { memberExpressionValueReplaceHandler } from './handlers/expressionHandler.js';
import { globalLibPaths } from '../defaultConfig.js';
import {
  handleShowDirective,
  handleOnDirective,
  handleTextDirective,
  handleHTMLDirective,
  handleBindDirective,
  handleMutualBindDirective,
  handleCustomDirective,
} from './directives.js';
import { vueTemplateStringHardCoding } from './stringRegexHandler.js';
import { convertToCamelCase, getValueByNode, isUppercaseTag } from '../nodeUtils.js';
import {
  convertNestedTemplates,
} from './handlers/templateSlotHandler.js';
import { mergeClassNames } from './handlers/classHandler.js';
import { transformRefProperty } from './handlers/refHandler.js';
import { identifierHandler, processIdentifier } from './handlers/identifierHandler.js';
import { SEMI_CONTROLLED_INPUT, DEFAULT_COMPONENT_TAG } from './consts.js';
import { isValidHtmlTag } from './jsxUtils.js';
import { handlerJSXElement } from './handlers/jsxElementHandler.js';
import { handleModelDirective } from './handlers/directives/modelDirective.js';
import { handleIfDirective } from './handlers/directives/ifDirective.js';
import { handleForDirective } from './handlers/directives/forDirective.js';
import { handleSlotTag } from './handlers/slotTagHandler.js';

export default function convertTemplate(template, reactCovert, component = {}) {
  const sourceCodeContext = reactCovert.sourceCodeContext;
  // babel解析器不识别{{value}} ,识别jsx {value}  &&  babel解析jsx不识别注释
  let targetTemplate = vueTemplateStringHardCoding(template);

  const vueAst = vuesfc.compileTemplate({
    source: targetTemplate,
  });
  // 如果vue中有多个元素，需要用Fragment包裹；首元素包含v-if场景下需要用branches长度判断
  let needFragment = vueAst?.ast?.children?.length > 1 || vueAst?.ast?.children[0]?.branches?.length > 1;
  if (needFragment) {
    reactCovert.sourceCodeContext.addExtrasImport('Fragment', globalLibPaths.horizon);
  }
  targetTemplate = needFragment ? `<Fragment>${targetTemplate}</Fragment>` : targetTemplate;

  try {
    // AST for template in sfc
    const templateAst = parser.parse(targetTemplate, {
      sourceType: 'module',
      allowTemplateLiterals: true,
      plugins: ['jsx'],
    });

    // 将引入的子组件的名称替换为大写驼峰命名，符合jsx规范：<todo-Item > ==> <TodoItem >
    traverse(templateAst, {
      JSXElement(path) {
        const name = path.node.openingElement.name;
        if (name.name.indexOf('-') > -1) {
          const compareName = kebabLowerCase(name.name);
          let targetComponentName = [...sourceCodeContext.importComponents.keys()].find(
            v => v.toLowerCase() === compareName
          );

          let replaceName;
          if (targetComponentName) {
            replaceName = sourceCodeContext.importComponents.get(targetComponentName);
          }

          // 处理组件自己引用自己的场景
          if (!targetComponentName) {
            if (reactCovert.name.toLowerCase() === compareName) {
              replaceName = reactCovert.name;
            }
          }

          if (replaceName) {
            path.node.openingElement.name.name = replaceName;
            if (path.node.closingElement) {
              path.node.closingElement.name.name = replaceName;
            }
          }
        }
      },
    });

    // 处理v-for:  v-for需要修改dom节点
    traverse(templateAst, {
      JSXAttribute: path => {
        const node = path.node;
        const value = node?.value?.value;
        if (!node.name) {
          return;
        }
        if (node.name.name === 'v-for') {
          handleForDirective(path, value, sourceCodeContext);
        }
      },
    });

    // 处理<template #name>
    traverse(templateAst, {
      JSXElement(path) {
        convertNestedTemplates(path, sourceCodeContext);
      },
    });

    const registerComponent = {tag: {... DEFAULT_COMPONENT_TAG, ...component?.tag}};
    // 处理JSXElement
    handlerJSXElement(templateAst, reactCovert, registerComponent);

    // 处理 v-if，需要修改dom节点（需要在slot处理之后）
    traverse(templateAst, {
      JSXAttribute: {
        exit(path) {
          const node = path.node;
          const value = node?.value?.value;
          if (!node.name) {
            return;
          }
          if (node.name.name === 'v-if') {
            handleIfDirective(path, value, sourceCodeContext);
          }
        },
      },
    });

    // 1、把 v-bind:name='xxx' ==> v-bind:name={xxx};
    // 2、把 v-show='xxx' ==> v-show={xxx}
    traverse(templateAst, {
      JSXAttribute: path => {
        const node = path.node;

        const attrName = node.name?.name;

        // 检查是否是 v-bind: 开头的属性，或 v- 开头
        if (
          (t.isJSXNamespacedName(node.name) && node.name.namespace.name === 'v-bind') ||
          // (typeof attrName === 'string' && attrName.startsWith('v-')) ||
          (typeof attrName === 'string' && attrName === 'v-show') ||
          (typeof attrName === 'string' && attrName === 'v-click-outside') // 临时写死，因为无法判断是要字符串还是变量
        ) {
          const value = node.value;

          // 检查值是否是字符串字面量
          if (t.isStringLiteral(value)) {
            // 创建一个新的 JSXExpressionContainer
            const newValue = t.jsxExpressionContainer(
              // 使用原始的字符串内容创建一个表达式
              t.identifier(value.value)
            );

            // 替换旧的值
            path.node.value = newValue;
          }
        }
      },
    });

    // 处理 v-xxx 指令
    traverse(templateAst, {
      JSXAttribute: path => {
        const node = path.node;
        let value;
        if (node.value) {
          value = getValueByNode(node, true);
        }

        if (!node.name) {
          return;
        }
        if (node.name.name === 'class') {
          path.replaceWith(t.jSXAttribute(t.jSXIdentifier('className'), node.value));
        } else if (node.name.name?.name === 'class') {
          path.replaceWith(
            t.jSXAttribute(t.jSXNamespacedName(t.jSXIdentifier('v-bind'), t.jSXIdentifier('className')), node.value)
          );
        } else if (node.name.name === 'v-model') {
          handleModelDirective(path, value, reactCovert);
        } else if (node.name.name === 'v-bind') {
          // fix <slot name="item" v-bind="item" />
          handleBindDirective(path, node.name.name, node.value);
        } else if (node.name.name === 'v-text') {
          // <div class="loadingTip" v-text="loadingMsg"></div> ===> <div class="loadingTip">{loadingMsg}</div>
          handleTextDirective(path, value);
        } else if (node.name.name === 'v-html') {
          handleHTMLDirective(path, value);
        } else if (t.isJSXNamespacedName(node.name)) {
          // 用于检查 JSX 节点是否是名称空间类型, 比如
          //  <button v-on:click="click">测试
          // v-bind/v-on/v-model
          if (node.name.namespace.name === 'v-model') {
            handleMutualBindDirective(path, value);
          } else if (node.name.namespace.name === 'v-on') {
            handleOnDirective(path, node.name.name.name, value);
          } else if (node.name.namespace.name === 'v-bind') {
            handleBindDirective(path, node.name.name.name, node.value);
            // hard code
            if (node.name.name.name === 'className') {
              reactCovert.sourceCodeContext.addExtrasImport('classnames', 'classnames', true);
            }
          }
        }
      },
    });

    // 把含有“-"的属性名，转成驼峰，如：show-dialog ==> showDialog
    traverse(templateAst, {
      JSXAttribute: {
        exit(path) {
          const node = path.node;
          if (!node.name || typeof node.name.name !== 'string') {
            return;
          }

          const attrName = node.name.name;

          // 排除以 "v-" 开头的属性
          if (attrName.startsWith('v-')) {
            return;
          }

          // 检查属性名是否包含连字符
          if (attrName.includes('-') && !attrName.startsWith('data-')) {
            // 转换为驼峰命名
            const camelCaseName = convertToCamelCase(attrName);
            // 更新节点的属性名
            node.name.name = camelCaseName;
          }
        },
      },
    });

    // vue属性做切换
    traverse(templateAst, {
      JSXSpreadAttribute(path) {
        const argument = path.node.argument;
        if (argument.type === 'Identifier') {
          path.node.argument = processIdentifier(path.node.argument, reactCovert);
          path.skip();
        }
      },
      JSXExpressionContainer: path => {
        path.traverse({
          MemberExpression(path) {
            // 找到 MemberExpression
            let replaceNode = memberExpressionValueReplaceHandler(path.node, reactCovert, path);
            if (replaceNode) {
              path.replaceWith(replaceNode);
            }
            path.skip();
          },
          OptionalMemberExpression(path) {
            // 找到 MemberExpression
            let replaceNode = memberExpressionValueReplaceHandler(path.node, reactCovert, path);
            if (replaceNode) {
              path.replaceWith(replaceNode);
            }
            path.skip();
          },
          UpdateExpression(path) {
            LOG.warn('did not support  UpdateExpression', path.toString());
          },
          Identifier(path) {
            identifierHandler(path, reactCovert);
          },
        });
        path.skip();
      },
    });

    // 处理v-show: v-show需要修改dom节点
    traverse(templateAst, {
      JSXAttribute: path => {
        const node = path.node;
        let value;
        if (node.value) {
          value = getValueByNode(node);
        }

        if (!node.name) {
          return;
        }

        // Check if the parent element's tag name starts with an uppercase letter
        const parentElement = path.parent;
        const tagName = parentElement.name.name;

        if (node.name.name === 'v-show' && !isUppercaseTag(tagName)) {
          // 这里只处理dom中的v-show，组件的v-show当做自定指令处理
          handleShowDirective(path, value);
        }
      },
    });

    // vue 自定义的directive属性做切换
    traverse(templateAst, {
      JSXAttribute: path => {
        // <div v-show="isShowAppDirective"  v-app-click-outside="hideAppDirective">
        const node = path.node;
        if (!node.name) {
          return;
        }
        let name = node.name.name;
        if (name.type === 'JSXIdentifier') {
          name = name.name;
        }
        // TODO  name.nameSpace;
        if (name && name.startsWith('v-')) {
          handleCustomDirective(path, node.name.name, node.value, sourceCodeContext);
        }
      },
    });

    // add import if $t is used
    traverse(templateAst, {
      JSXAttribute(path) {
        const val = path.get('value');
        if (
          val.isJSXExpressionContainer() &&
          val.get('expression').isCallExpression() &&
          val.get('expression.callee').isIdentifier({ name: '$t' })
        ) {
          sourceCodeContext.setHas$t(true);
        } else if (
          val.isJSXExpressionContainer() &&
          val.get('expression').isCallExpression() &&
          val.get('expression.callee').isIdentifier({ name: '$l' })
        ) {
          sourceCodeContext.setHas$l(true);
        }
      },
      JSXExpressionContainer(path) {
        const expression = path.get('expression');

        if (expression.isCallExpression() && expression.get('callee').isIdentifier({ name: '$t' })) {
          sourceCodeContext.setHas$t(true);
        } else if (expression.isCallExpression() && expression.get('callee').isIdentifier({ name: '$l' })) {
          sourceCodeContext.setHas$l(true);
        }
      },
    });

    // process text style attribute
    traverse(templateAst, {
      JSXAttribute(path) {
        if (path.get('name').isJSXIdentifier({ name: 'style' })) {
          sourceCodeContext.addExtrasImport('styles', 'adapters/vueAdapter');
          const val = path.get('value');
          let param = val.node.expression;
          if (!val.node.expression) {
            if (val.node.value) {
              // 去掉字符串中的换行符，style中有换行，被合并到styles()中会有语法错误
              val.node.value = val.node.value
                .replace(/[\r\n]+/g, '') // 移除所有换行符和回车符
                .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
                .trim();
            }
            param = val.node;
          }
          const newVal = t.jSXExpressionContainer(t.callExpression(t.identifier('styles'), [param]));
          val.replaceWith(newVal);
        }
      },
    });

    // ref="xxx" ==> ref={(val) => instance.$refs.xxx = val}
    transformRefProperty(templateAst, reactCovert);

    // 把input替换成SemiControlledInput，因为在Horizon中如果input没有onChange，只有value是无法编辑的
    // 如: <input type="text" value={getCellValueByKey(title.key, row)} /> ==> <SemiControlledInput type="text" value={getCellValueByKey(title.key, row)} />
    traverse(templateAst, {
      JSXElement(path) {
        const node = path.node;

        // 检查是否为 input 标签
        if (t.isJSXIdentifier(node.openingElement.name) && node.openingElement.name.name === 'input') {
          let hasValue = false;
          let hasOnChange = false;
          let valueAttribute = null;

          // 遍历属性
          node.openingElement.attributes.forEach(attr => {
            if (t.isJSXAttribute(attr)) {
              if (attr.name.name === 'value') {
                hasValue = true;
                valueAttribute = attr;
              } else if (attr.name.name === 'onChange') {
                hasOnChange = true;
              }
            }
          });

          // 如果有 value 属性但没有 onChange 属性
          if (hasValue && !hasOnChange) {
            // 将标签名改为 SemiControlledInput
            node.openingElement.name = t.jsxIdentifier(SEMI_CONTROLLED_INPUT);
            if (node.closingElement) {
              node.closingElement.name = t.jsxIdentifier(SEMI_CONTROLLED_INPUT);
            }

            // 如果是自闭合标签，将其转换为开放标签
            if (node.openingElement.selfClosing) {
              node.openingElement.selfClosing = false;
              node.closingElement = t.jsxClosingElement(t.jsxIdentifier(SEMI_CONTROLLED_INPUT));
            }

            // 修改 value={xxx} ==> value={{ value: xxx }}
            if (valueAttribute) {
              valueAttribute.value = t.jsxExpressionContainer(
                t.objectExpression([t.objectProperty(t.identifier('value'), getValueByNode(valueAttribute))])
              );
            }

            // 可以在这里添加导入语句，如果需要的话
            sourceCodeContext.addExtrasImport(SEMI_CONTROLLED_INPUT, 'adapters/vueAdapter');
          }
        }
      },
    });

    // 处理<slot>标签
    handleSlotTag(templateAst, reactCovert);

    /**
     * 'my-component' => mycomponent;
     * @param {*} kebabStr
     * @returns
     */
    function kebabLowerCase(kebabStr) {
      return kebabStr.split('-').join('').toLowerCase();
    }

    /**
     *
     * 将引入的子组件的名称替换为大写驼峰命名，符合jsx规范
     *  <todo-Item >
     *  ==>
     *  <TodoItem >
     * @param {*} path
     */
    function changeElementTagToKebab(path) {
      const name = path.node.openingElement.name;

      let tabName = name.name;
      if (tabName.indexOf('-') > -1) {
        tabName = kebabLowerCase(tabName);
      }

      if (isValidHtmlTag(tabName)) {
        return tabName;
      }

      // 检查是否是importComponents
      let targetComponentName = [...sourceCodeContext.importComponents.keys()].find(v => v.toLowerCase() === tabName);

      let replaceName;
      if (targetComponentName) {
        replaceName = sourceCodeContext.importComponents.get(targetComponentName);
      }

      // 处理组件自己引用自己的场景
      if (!targetComponentName) {
        if (reactCovert.name.toLowerCase() === tabName) {
          replaceName = reactCovert.name;
        }
      }

      if (replaceName) {
        path.node.openingElement.name.name = replaceName;
        if (path.node.closingElement) {
          path.node.closingElement.name.name = replaceName;
        }
      }
    }

    /**
     * 性能考虑 遍历path的一个回调方法集
     */
    const pathLoopCall = [];

    // 将引入的子组件的名称替换为大写驼峰命名，符合jsx规范
    pathLoopCall.push(changeElementTagToKebab);

    // 合并多个class
    pathLoopCall.push(mergeClassNames);

    // 合并多个style
    pathLoopCall.push(function (path) {
      const styleAttributes = path.node.openingElement.attributes?.filter(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'style'
      );

      if (styleAttributes?.length > 1) {
        // 合并所有的 style 属性值
        const mergedStyles = styleAttributes.reduce((acc, attr) => {
          const value = attr.value.expression;

          if (t.isObjectExpression(value)) {
            acc.push(value);
          } else if (t.isArrayExpression(value)) {
            acc.push(...value.elements);
          } else if (t.isCallExpression(value)) {
            acc.push(...value.arguments);
          }

          return acc;
        }, []);

        // 替换第一个 style 属性的值为合并后的值
        styleAttributes[0].value.expression = t.callExpression(t.identifier('styles'), mergedStyles);

        // 移除其他的 style 属性
        for (let i = 1; i < styleAttributes.length; i++) {
          path.node.openingElement.attributes.splice(
            path.node.openingElement.attributes.indexOf(styleAttributes[i]),
            1
          );
        }
      }
    });

    // 最后统一做一些完善工作，比如两个同样的class属性，style属性等场景
    traverse(templateAst, {
      JSXElement(path) {
        pathLoopCall.forEach(call => {
          call(path);
        });
      },
    });

    return templateAst;
  } catch (error) {
    const mes = `[template parse Error] --> ${reactCovert.path} ` + error.message;
    LOG.error(mes);
    if (error.stack) {
      LOG.error(error.stack);
    }
    LOG.error(targetTemplate);
    throw mes;
  }
}
