import t from '@babel/types'
import { parse } from '@babel/parser'
import LOG from '../../logHelper.js'
import eventMap from './event-map.js'
import { convertToCamelCase, getAttributeNodeName, getDirectiveValueByNode, isVueCustomTag } from '../nodeUtils.js'
import { globalLibPaths } from '../defaultConfig.js'
import { DIRECTIVE_COMPONENT, EVENT_PARAM_NAME } from './consts.js'
import { convertToArrowFunction } from './stringRegexHandler.js'

/**
 * <input v-model:value="message" />
 *  ===>
 *  <input
 *    value={message}
 *    update_value={(newValue) => { message = newValue }}
 *  />
 *  <input v-model:value="message" @update:value="input" />
 *  ===>
 *  <input
 *    value={message}
 *    update_value={(newValue) => { message = newValue; input(newValue)}}
 *  />
 *
 * @param path
 * @param value
 */
export function handleMutualBindDirective(path, value) {
  const name = getAttributeNodeName(path.node);
  let valueExpression = t.jSXExpressionContainer(t.identifier(value));
  if (typeof value === 'string') {
    const ast = parse(value);
    valueExpression = t.jSXExpressionContainer(ast.program.body[0].expression);
  }
  path.replaceWith(t.jSXAttribute(t.jSXIdentifier(name), valueExpression));


  const newValue = 'newValue';
  const eventName = 'update_' + name;
  const updateAttr = path.parentPath.node.attributes.find(attr => attr.name?.name?.name === eventName);
  const blockStatementBody = [
    t.expressionStatement(t.assignmentExpression('=', valueExpression.expression, t.identifier(newValue))),
  ];
  if (updateAttr && updateAttr.value.type === 'StringLiteral') {
    blockStatementBody.push(t.expressionStatement(t.callExpression(t.identifier(updateAttr.value.value), [t.identifier(newValue)])));
    path.parentPath.node.attributes = path.parentPath.node.attributes.filter(item => item !== updateAttr);
  }
  const changeFuncNode = t.arrowFunctionExpression(
    [t.identifier(newValue)],
    t.blockStatement(blockStatementBody)
  );
  path.parentPath.node.attributes.push(
    t.jSXAttribute(t.jSXIdentifier(eventName), t.jSXExpressionContainer(changeFuncNode))
  );
}

export function handleShowDirective(path, value) {
  path.replaceWith(
    t.jSXAttribute(
      t.jSXIdentifier('style'),
      t.jSXExpressionContainer(
        t.objectExpression([
          t.objectProperty(
            t.identifier('display'),
            t.conditionalExpression(value, t.stringLiteral(''), t.stringLiteral('none'))
          ),
        ])
      )
    )
  );
}

// 获取原代码中的事件执行语句
function getFuncBody(handEventExpressionStatement = t.emptyStatement()) {
  let functionBody = Array.isArray(handEventExpressionStatement)
    ? handEventExpressionStatement
    : [handEventExpressionStatement];
  // 处理handEventExpressionStatement是箭头函数场景问题
  if (handEventExpressionStatement.type === 'ArrowFunctionExpression') {
    functionBody = handEventExpressionStatement.body.body;
  }
  return functionBody;
}

function getModifierBody(modifier, functionBody) {
  if (modifier === 'stop') {
    return [
      t.expressionStatement(
        t.callExpression(t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('stopPropagation')), [])
      ),
      ...functionBody,
    ];
  }
  if (modifier === 'prevent') {
    return [
      t.expressionStatement(
        t.callExpression(t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('preventDefault')), [])
      ),
      ...functionBody,
    ];
  }
  if (modifier === 'self') {
    return [
      t.ifStatement(
        t.binaryExpression(
          '===',
          t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('target')),
          t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('currentTarget'))
        ),
        t.blockStatement(functionBody)
      )
    ];
  }
  if (modifier === 'once') {
    return [
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('handleClickOnce'),
          t.arrowFunctionExpression(
            [t.identifier(EVENT_PARAM_NAME)],
            t.blockStatement([
              ...functionBody,
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(
                    t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('currentTarget')),
                    t.identifier('removeEventListener')
                  ),
                  [t.stringLiteral('click'), t.identifier('handleClickOnce')]
                )
              ),
            ])
          )
        ),
      ]),
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('currentTarget')),
            t.identifier('addEventListener')
          ),
          [t.stringLiteral('click'), t.identifier('handleClickOnce')]
        )
      ),
    ];
  }
  if (modifier === 'enter') {
    return [
      t.ifStatement(
        t.binaryExpression(
          '===',
          t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('key')),
          t.stringLiteral('Enter')
        ),
        t.blockStatement(functionBody)
      ),
    ];
  }
  // passive、capture和default
  return [t.blockStatement(functionBody)];
}

const getModifierFunc = (modifierList, handEventExpressionStatement = t.emptyStatement()) => {
  let newBody = getFuncBody(handEventExpressionStatement);
  modifierList.forEach(modifier => {
    newBody = getModifierBody(modifier, newBody);
  })
  return t.arrowFunctionExpression(
    [t.identifier(EVENT_PARAM_NAME)],
    t.blockStatement(newBody)
  );
}

/**
 * 处理click回调事件
 * @param {*} path
 * @param {*} name
 * @param {*} value
 * @returns
 *
 */
export function handleOnDirective(path, name, value) {
  // v-on:click="showOrHide"
  const [originName, ...eventModifierList] = name.split('__');
  let eventName = eventMap[originName] || originName;

  if (value) {
    // 把 function (str, item) {} ===> (str, item) => {}，因为babel/parser 无法转换匿名函数
    value = convertToArrowFunction(value);
    const templateAst = parse(value);
    // 只有一行且类型是字符串说明事件绑定的是方法名  v-on:click ="showOrHide"
    if (
      templateAst?.program?.body?.length === 1 &&
      templateAst.program.body[0].expression?.type === 'Identifier'
    ) {
      if (eventModifierList.length > 0) {
        path.replaceWith(
          t.jSXAttribute(
            t.jSXIdentifier(eventName),
            t.jSXExpressionContainer(
              getModifierFunc(
                eventModifierList,
                t.expressionStatement(t.callExpression(t.identifier(value), [t.identifier(EVENT_PARAM_NAME)]))
              )
            )
          )
        );
      } else {
        path.replaceWith(t.jSXAttribute(t.jSXIdentifier(eventName), t.jSXExpressionContainer(t.identifier(value))));
      }
    } else if (
      templateAst?.program.body &&
      templateAst?.program.body.length === 1 &&
      (t.isFunctionDeclaration(templateAst.program.body[0]) ||
        t.isArrowFunctionExpression(templateAst.program.body[0].expression))
    ) {
      // 处理场景：
      // v-on:event="function(xx, xxx) {}" ===> event={function(xx, xxx) {}}
      // v-on:event="(xx, xxx) => {}" ===> event={(xx, xxx) => {}}
      // 处理函数声明或箭头函数表达式的情况
      let functionExpression;
      if (t.isFunctionDeclaration(templateAst.program.body[0])) {
        // 将函数声明转换为函数表达式
        functionExpression = t.functionExpression(
          null, // 匿名函数
          templateAst.program.body[0].params,
          templateAst.program.body[0].body,
          templateAst.program.body[0].generator,
          templateAst.program.body[0].async
        );
      } else {
        // 如果是箭头函数表达式，直接使用
        functionExpression = templateAst.program.body[0].expression;
      }

      if (eventModifierList.length > 0) {
        path.replaceWith(
          t.jSXAttribute(
            t.jSXIdentifier(eventName),
            t.jSXExpressionContainer(getModifierFunc(eventModifierList, functionExpression))
          )
        );
      } else {
        path.replaceWith(t.jSXAttribute(t.jSXIdentifier(eventName), t.jSXExpressionContainer(functionExpression)));
      }
    } else {
      // 事件绑定的执行语句,转换成箭头函数
      const functionBlock = t.blockStatement(templateAst.program.body);

      if (eventModifierList.length > 0) {
        const newAttribute = t.jsxAttribute(
          t.jsxIdentifier(eventName),
          t.jSXExpressionContainer(getModifierFunc(eventModifierList, functionBlock.body))
        );
        path.replaceWith(newAttribute);
      } else {
        const changeFuncNode = t.arrowFunctionExpression([t.identifier(EVENT_PARAM_NAME)], functionBlock);
        const newAttribute = t.jsxAttribute(t.jsxIdentifier(eventName), t.jSXExpressionContainer(changeFuncNode));
        path.replaceWith(newAttribute);
      }
    }
  } else {
    if (eventModifierList.length > 0) {
      const newAttribute = t.jsxAttribute(
        t.jsxIdentifier(eventName),
        t.jSXExpressionContainer(getModifierFunc(eventModifierList))
      );
      path.replaceWith(newAttribute);
    } else {
      const newAttribute = t.jsxAttribute(t.jsxIdentifier(eventName));
      path.replaceWith(newAttribute);
    }
  }
}

/**
 * 处理自定义指令的转换函数，将Vue风格的指令转换为React组件形式
 *
 * @param {Object} path - AST路径对象
 * @param {string} name - 指令名称
 * @param {any} value - 指令值
 * @param {Object} sourceCodeContext - 源代码上下文对象，包含导入信息等
 *
 * @example
 * // Vue 模板中的用法:
 * <div v-tooltip="'提示文本'"></div>
 * <div v-tooltip:bottom__persistent="'提示文本'"></div>
 *
 * // 转换后的 Horizon 组件形式:
 * <DirectiveComponent
 *   directives={[{
 *     name: 'tooltip',
 *     value: '提示文本'
 *   }]}
 *   componentName="div"
 * >
 * </DirectiveComponent>
 *
 * // 带修饰符和参数的指令转换示例:
 * <DirectiveComponent
 *   directives={[{
 *     name: 'tooltip',
 *     arg: 'bottom',
 *     modifiers: { persistent: true },
 *     value: '提示文本'
 *   }]}
 *   componentName="div"
 * >
 * </DirectiveComponent>
 */
export function handleCustomDirective(path, name, value, sourceCodeContext) {
  const parentOpenNode = path.parentPath.node;
  const newDerectProps = [];
  // 处理原有元素上的属性
  const newElementAttrs = parentOpenNode.attributes.reduce((r, v) => {
    const attrName = v.name?.namespace?.name || v.name.name;
    // 检查是否是 v- 开头的指令
    if (attrName && attrName.startsWith('v-')) {
      const isNameSpace = v.name?.namespace;
      const newAttrVals = [];
      let [newName, ...modifiers] = attrName.split('v-')[1].split('__');
      let argName = '';
      //两种形式 v-addId:test__table 和 v-addId__table
      if (isNameSpace) {
        newName = attrName.split('v-')[1];
        [argName, ...modifiers] = v.name?.name?.name?.split('__');
      }
      // 构建指令对象属性
      const nameProperty = t.objectProperty(t.identifier('name'), t.stringLiteral(newName));
      newAttrVals.push(nameProperty);
      if (modifiers.length > 0) {
        const modifierList = modifiers.map(m => t.objectProperty(t.identifier(m), t.booleanLiteral(true)));
        newAttrVals.push(t.objectProperty(t.identifier('modifiers'), t.objectExpression(modifierList)));
      }
      if (argName) {
        newAttrVals.push(t.objectProperty(t.identifier('arg'), t.identifier(argName)));
      }
      if (v.value) {
        newAttrVals.push(t.objectProperty(t.identifier('value'), getDirectiveValueByNode(v)));
      }
      newDerectProps.push(t.objectExpression(newAttrVals));
    } else {
      r.push(v);
    }
    return r;
  }, []);

  // 添加 directives 属性
  newElementAttrs.push(
    t.jSXAttribute(t.jSXIdentifier('directives'), t.jSXExpressionContainer(t.arrayExpression(newDerectProps)))
  );

  // 如果存在指令，添加 registerDirectives 属性
  if (sourceCodeContext.hasDirectives) {
    newElementAttrs.push(
      t.jSXAttribute(t.jSXIdentifier('registerDirectives'), t.jSXExpressionContainer(t.identifier('registerDirectives')))
    );
  }

  const proxyTagName = parentOpenNode.name.name;

  // 添加 componentName 属性
  newElementAttrs.push(
    t.jSXAttribute(
      t.jSXIdentifier('componentName'),
      t.jSXExpressionContainer(
        isVueCustomTag(proxyTagName) ? t.identifier(convertToCamelCase(proxyTagName)) : t.stringLiteral(proxyTagName)
      )
    )
  );

  // 添加必要的导入
  sourceCodeContext.addExtrasImport(DIRECTIVE_COMPONENT, globalLibPaths.vueAdapter);

  // 替换原有节点为新的 DirectiveComponent
  path.parentPath.parentPath.replaceWith(
    t.jSXElement(
      t.jSXOpeningElement(t.jSXIdentifier(DIRECTIVE_COMPONENT), newElementAttrs),
      t.jSXClosingElement(t.jSXIdentifier(DIRECTIVE_COMPONENT)),
      path.parentPath.parentPath.node.children
    )
  );
}

export function handleBindDirective(path, name, value) {
  let newAttributes = null;

  if (name === 'v-bind') {
    newAttributes = t.jsxSpreadAttribute(t.identifier(value.value));
  } else {
    let valueNode = value;
    if (valueNode?.type === 'StringLiteral') {
      valueNode = t.jSXExpressionContainer(t.identifier(value.value));
    }
    if (valueNode?.type !== 'JSXExpressionContainer') {
      const mes = 'covert JSX Error  ' + path.toString() + value;
      LOG.error(mes);
      throw mes;
    }
    if (name === 'className') {
      const callExpression = t.callExpression(t.identifier('classnames'), [valueNode.expression]);
      newAttributes = t.jSXAttribute(t.jSXIdentifier(name), t.jsxExpressionContainer(callExpression));
    } else {
      newAttributes = t.jSXAttribute(t.jSXIdentifier(name), valueNode);
    }
  }
  path.replaceWith(newAttributes);
}

export function handleTextDirective(path, value) {
  const jsxElement = path.parentPath.parentPath;
  const openingElement = jsxElement.node.openingElement;

  // 移除 v-text 属性
  openingElement.attributes = openingElement.attributes.filter(
    attr => !(t.isJSXAttribute(attr) && attr.name.name === 'v-text')
  );

  // 创建 JSX 表达式容器
  const expressionContainer = t.jsxExpressionContainer(t.identifier(value));

  if (openingElement.selfClosing) {
    // 处理自闭合元素
    openingElement.selfClosing = false;

    jsxElement.node.closingElement = t.jSXClosingElement(t.jSXIdentifier(openingElement.name.name));
    jsxElement.node.children = [expressionContainer];
  } else {
    // 处理非自闭合元素
    jsxElement.node.children = [expressionContainer];
  }
}

export function handleHTMLDirective(path, value) {
  path.replaceWith(
    t.jSXAttribute(
      t.jSXIdentifier('dangerouslySetInnerHTML'),
      t.jSXExpressionContainer(t.objectExpression([t.objectProperty(t.identifier('__html'), t.identifier(value))]))
    )
  );
}
