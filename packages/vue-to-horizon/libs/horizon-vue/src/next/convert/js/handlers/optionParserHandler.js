import t from '@babel/types'
import LOG from '../../../logHelper.js'
import { globalLibPaths } from '../../defaultConfig.js'
import { addInstance } from '../../jsx/handlers/instanceHandler.js'
import { JSErrors } from '../../../errors.js'
import { DATA_REACTIVE, INSTANCE } from '../../jsx/consts.js'
import { watchParser } from './watchHandler.js'
import { propsParser } from './propsHandler.js'

/**
 * 找到Object的key和value
 * `const c = 2; {a: 1, b: function(){}, c}
 *   ==> [a,b,c],[1,function(){},c]
 * TODO:
 * {a: 1, b: function(){}, c, ...d}
 * @param {*} targetAst
 * @returns
 */
function findObjectExpressionKeyAndValue(targetAst) {
  const keys = [];
  const values = [];
  if (t.isObjectExpression(targetAst)) {
    targetAst.properties.forEach(prop => {
      keys.push(prop.key.name);
      values.push(prop.value);
    });
  }
  return { keys, values };
}

/**
 * 支持解析data设置
  data() {
    const b = 'cccc';
    return { a: 1 ,b}
  },
 * @param {*} ast
 * @param {*} reactCovert
 */
function dataParser(ast, reactCovert) {
  if (ast?.body?.body) {
    const reactFuncLogicBody = [];
    const shortHand = new Set();
    // 创建reactive函数调用的标识符
    const reactiveCallee = t.identifier('reactive');
    let callExpression = null;
    const variableId = t.identifier(DATA_REACTIVE);
    ast?.body.body.forEach(item => {
      if (item.type === 'ReturnStatement') {
        // 遍历对象
        if (item.argument && item.argument.type === 'ObjectExpression') {
          // TODO 需要考虑{[a]:c}场景
          callExpression = t.callExpression(reactiveCallee, [item.argument]);
          item.argument.properties.forEach(p => {
            reactCovert.sourceCodeContext.addReactive(p.key.name, DATA_REACTIVE);
          });
        } else {
          LOG.error(JSErrors.must_return_object);
          throw JSErrors.must_return_object;
        }
      } else {
        // 如何是函数逻辑代码，则将代码添加到react组件函数中
        reactFuncLogicBody.unshift(item);
      }
    });

    reactFuncLogicBody.forEach(express => {
      // 硬编码解决简写场景
      if (express?.declarations?.length > 0) {
        const shortTarget = express?.declarations.find(i => shortHand.has(i.id.name));
        if (shortTarget) {
          shortTarget.id.name = `${shortTarget.id.name}_short`;
        }
      }
      reactCovert.addCodeAstToHorizon(express);
    });

    if (callExpression) {
      const variableDeclarator = t.variableDeclarator(variableId, callExpression);

      // 创建包含声明符的变量声明
      const reactVariable = t.variableDeclaration('const', [variableDeclarator]);
      reactCovert.sourceCodeContext.addExtrasImport('reactive', globalLibPaths.vue);
      reactCovert.addCodeAstToHorizon(reactVariable);

      // 创建 instance.dataReactive = dataReactive;
      const instanceDataReactiveAssignment = t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier(INSTANCE), t.identifier(DATA_REACTIVE)),
          t.identifier(DATA_REACTIVE)
        )
      );

      // 添加注释
      const comment = t.addComment(
        instanceDataReactiveAssignment,
        'leading',
        ' 专门用于其它组件通过refs获得dataReactive的数据，如：instance.$refs[refId].xxx，如果没有该场景可删除。',
        true
      );
      reactCovert.addCodeAstToHorizon(comment);

      // 确保有instance
      addInstance(reactCovert);
    }
  } else {
    const mes = 'vue options api data attr not support yet';
    LOG.error(mes);
    throw mes;
  }
}

function computedParser(ast, reactCovert) {
  ast.properties.forEach(prop => {
    let computedBody = null;
    if (prop.type === 'SpreadElement') {
      /*
        computed: {
          ...mapState('counter', ['count']),
        }
        ==>
          const {count} = useMapState('counter', ['count'])
        */
      if (prop.argument.type === 'CallExpression') {
        const callName = prop.argument.callee.name;
        const ags0 = prop.argument.arguments[0];
        let outKeys = [];
        let outputsNode = null;
        // 存在vuex的模块定义
        if (ags0.type === 'ObjectExpression') {
          const { keys } = findObjectExpressionKeyAndValue(ags0);
          outKeys = keys;
        } else {
          if (ags0.type === 'StringLiteral') {
            outputsNode = prop.argument.arguments?.[1];
          } else if (ags0.type === 'ArrayExpression') {
            outputsNode = ags0;
          }
          if (outputsNode && outputsNode.type === 'ArrayExpression') {
            outputsNode.elements.forEach(v => {
              outKeys.push(v.value);
            });
          }
        }

        // 创建函数调用表达式 xx('')
        const functionCallExpression = t.callExpression(
          t.identifier(globalLibPaths.vuex.imports[callName] || callName),
          prop.argument.arguments
        );

        // 创建对象解构模式 {a, b, c}
        const objectPattern = t.objectPattern(
          outKeys.map(key => {
            reactCovert.sourceCodeContext.addComputed(key, 'empty-value');
            return t.objectProperty(t.identifier(key), t.identifier(key), false, true);
          })
        );

        // 创建变量声明 const {a, b, c} = xx('')
        const variableDeclarator = t.variableDeclarator(objectPattern, functionCallExpression);
        const variableDeclaration = t.variableDeclaration('const', [variableDeclarator]);
        reactCovert.addCodeAstToHorizon(variableDeclaration);
      }
    } else {
      if (prop.type === 'ObjectMethod') {
        /*
        computed: {
          doubleCount() {
            testa();
            return this.count * 2;  // 计算属性，返回 count 的两倍
          }
        }

         ==>
          const doubleCount = computed(()=> {
            testa();
            return this.count * 2;  // 计算属性，返回 count 的两倍
          })

        */
        const funcBody = prop.body;
        const param = prop.params;
        const async = prop.async;
        computedBody = t.arrowFunctionExpression(param, funcBody, async);
      } else if (prop.type === 'ObjectProperty') {
        /*
        computed: {
          doubleCount:function() {
            testa();
            return this.count * 2;  // 计算属性，返回 count 的两倍
          }
        }
        ==>
         const doubleCount = computed(()=> {
            testa();
            return this.count * 2;  // 计算属性，返回 count 的两倍
          })
        */
        computedBody = prop.value;
      }
      const key = prop.key.name;
      // 创建computer函数调用的标识符
      const callee = t.identifier('computed');
      // 创建变量标识符
      const variableId = t.identifier(key);
      // 创建函数调用表达式
      const callExpression = t.callExpression(callee, [computedBody]);
      // 创建变量声明符
      const variableDeclarator = t.variableDeclarator(variableId, callExpression);
      const variableDeclaration = t.variableDeclaration('const', [variableDeclarator]);

      reactCovert.addCodeAstToHorizon(variableDeclaration);
      reactCovert.sourceCodeContext.addComputed(key, computedBody);
    }
  });
  if (ast.properties.length > 0) {
    reactCovert.sourceCodeContext.addExtrasImport('computed', globalLibPaths.vue);
  }
}

function methodsParser(ast, reactCovert) {
  const methodNames = [];
  ast?.properties.forEach(prop => {
    let computedBody = null;
    if (prop.type === 'SpreadElement') {
      if (prop.argument.type === 'CallExpression') {
        const callName = prop.argument.callee.name;
        const ags0 = prop.argument.arguments[0];
        let outKeys = [];
        let outputsNode = null;
        // 存在vuex的模块定义
        if (ags0.type === 'ObjectExpression') {
          const { keys } = findObjectExpressionKeyAndValue(ags0);
          outKeys = keys;
        } else {
          if (ags0.type === 'StringLiteral') {
            outputsNode = prop.argument.arguments?.[1];
          } else if (ags0.type === 'ArrayExpression') {
            outputsNode = ags0;
          }
          if (outputsNode && outputsNode.type === 'ArrayExpression') {
            outputsNode.elements.forEach(v => {
              // 如果数组中是变量，不是字符串，如：...mapMutations([cancleLoadingMsg])，cancleLoadingMsg是个变量，key取v.name
              outKeys.push(v.value || v.name);
            });
          }
        }

        // 创建函数调用表达式 xx('')
        const functionCallExpression = t.callExpression(
          t.identifier(globalLibPaths.vuex.imports[callName] || callName),
          prop.argument.arguments
        );

        // 创建对象解构模式 {a, b, c}
        const objectPattern = t.objectPattern(
          outKeys.map(key => {
            reactCovert.sourceCodeContext.addMethods(key, true);
            return t.objectProperty(t.identifier(key), t.identifier(key), false, true);
          })
        );

        // 创建变量声明 const {a, b, c} = xx('')
        const variableDeclarator = t.variableDeclarator(objectPattern, functionCallExpression);
        let variableDeclaration = t.variableDeclaration('const', [variableDeclarator]);

        // TODO: resolve attachment of spread operator variables to instance

        reactCovert.addCodeAstToHorizon(variableDeclaration);
      }
    } else {
      const key = prop.key.name;
      methodNames.push(key);
      // 创建变量标识符
      const variableId = t.identifier(key);
      if (prop.type === 'ObjectMethod') {
        const funcBody = prop.body;
        const param = prop.params;
        const async = prop.async;
        computedBody = t.arrowFunctionExpression(param, funcBody, async);
      } else if (prop.type === 'ObjectProperty') {
        computedBody = prop.value;
      }
      // 创建变量声明符
      const variableDeclarator = t.variableDeclarator(variableId, computedBody);
      const variableDeclaration = t.variableDeclaration('const', [variableDeclarator]);

      reactCovert.addCodeAstToHorizon(variableDeclaration);
      reactCovert.sourceCodeContext.addMethods(key, true);
    }
  });

  // 增加 setToInstance(instance, [method1, method2, method3]), 把method设置给instance
  if (methodNames.length > 0) {
    reactCovert.sourceCodeContext.addExtrasImport('setToInstance', globalLibPaths.vue);

    // 创建 methods 对象
    const methodsObject = t.objectExpression(
      methodNames.map(name =>
        t.objectProperty(t.identifier(name), t.identifier(name), false, true)
      )
    );

    // 创建 setToInstance 函数调用
    const setToInstanceCall = t.callExpression(t.identifier('setToInstance'), [
      t.identifier(INSTANCE),
      methodsObject
    ]);

    // 创建表达式语句
    const expressionStatement = t.expressionStatement(setToInstanceCall);

    // 将这个语句添加到 React 代码中
    reactCovert.addCodeAstToHorizon(expressionStatement);

    // 确保有instance
    addInstance(reactCovert);
  }
}

function lifeHookParser(ast, replaceFuncName, reactCovert) {
  const funcBody = ast.body;
  const param = ast.params;
  const async = ast.async;
  const handerCall = t.arrowFunctionExpression(param, funcBody, async);
  const callee = t.identifier(replaceFuncName);
  const callExpression = t.callExpression(callee, [handerCall]);
  reactCovert.addCodeAstToHorizon(callExpression);
  reactCovert.sourceCodeContext.addExtrasImport(replaceFuncName, globalLibPaths.vue);
}

function injectParser(ast, reactCovert) {
  if (ast.type === 'ArrayExpression') {
    ast.elements?.forEach(el => {
      const injectName = el.value;
      reactCovert.addCodeAstToHorizon(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(injectName),
            t.callExpression(t.identifier('inject'), [t.stringLiteral(injectName)])
          ),
        ])
      );
    });
  } else if (ast.type === 'ObjectExpression') {
    const injects = ast.properties;
    reactCovert.addCodeAstToHorizon(
      t.variableDeclaration(
        'const',
        injects.map(prop => {
          const key = prop.key.name || prop.key.value;
          if (prop.value.type === 'ObjectExpression') {
            const from = prop.value.properties.find(p => p.key.name === 'from');
            const defaultValue = prop.value.properties.find(p => p.key.name === 'default');
            const args = [
              t.stringLiteral(from?.value?.value ?? ''),
              defaultValue ? defaultValue.value : t.identifier('undefined'),
            ];
            return t.variableDeclarator(t.identifier(key), t.callExpression(t.identifier('inject'), args));
          } else {
            return t.variableDeclarator(t.identifier(key), t.callExpression(t.identifier('inject'), [prop.value]));
          }
        })
      )
    );
  }
  reactCovert.sourceCodeContext.addExtrasImport('inject', globalLibPaths.vue);
}

function directivesParser(ast, reactCovert) {
  if (ast.type === 'ObjectExpression') {
    reactCovert.addCodeAstToHorizon(
      t.variableDeclaration('const', [t.variableDeclarator(t.identifier('registerDirectives'), ast)])
    );
    reactCovert.sourceCodeContext.hasDirectives = true;
  } else {
    LOG.warn('the config [provider] did not support type of ' + ast.type);
  }
}

function componentsParser(ast, reactCovert) {
  reactCovert.addCodeAstToHorizon(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('components'),
        t.objectExpression(
          ast.properties.map(node => {
            const name = reactCovert.sourceCodeContext.optionTypeRegistComponentMap.get(node.key.name);
            return t.objectProperty(t.identifier(node.key.name), t.identifier(name));
          })
        )
      ),
    ])
  );
}

function provideParser(ast, reactCovert) {
  if (ast.type === 'ObjectMethod' || ast.type === 'ArrowFunctionExpression' || ast.type === 'FunctionExpression') {
    if (ast?.body?.body) {
      const reactFuncLogicBody = [];
      const shortHand = new Set();
      const provideVariable = [];
      ast?.body.body.forEach(item => {
        // 解析函数中返回语句，将代码转成ref();
        // const a = ref(1);
        if (item.type === 'ReturnStatement') {
          // 遍历对象
          if (item.argument && item.argument.type === 'ObjectExpression') {
            item.argument.properties.forEach(p => {
              const key = p.key.name || p.key.value;
              const value = p.value;
              provideVariable.push(
                t.expressionStatement(t.callExpression(t.identifier('provide'), [t.stringLiteral(key), value]))
              );
            });
          }
        } else {
          // 如何是函数逻辑代码，则将代码添加到react组件函数中
          reactFuncLogicBody.unshift(item);
        }
      });

      reactFuncLogicBody.forEach(express => {
        // 硬编码解决简写场景
        if (express?.declarations?.length > 0) {
          const shortTarget = express?.declarations.find(i => shortHand.has(i.id.name));
          if (shortTarget) {
            shortTarget.id.name = `${shortTarget.id.name}_short`;
          }
        }
        reactCovert.addCodeAstToHorizon(express);
      });

      reactCovert.addCodesAstToHorizon(provideVariable);
      reactCovert.sourceCodeContext.addExtrasImport('provide', globalLibPaths.vue);
    } else {
      LOG.warn('can not find  [provider] config ');
    }
  } else {
    const mes = 'vue options api data attr not support yet';
    LOG.error(mes);
    throw mes;
  }
}

export default function parserOption(optionName, ast, reactCovert) {
  switch (optionName) {
    case 'data':
      dataParser(ast, reactCovert);
      break;
    case 'props':
      propsParser(ast, reactCovert);
      break;
    case 'computed':
      computedParser(ast, reactCovert);
      break;
    case 'methods':
      methodsParser(ast, reactCovert);
      break;
    case 'watch':
      watchParser(ast, reactCovert);
      break;
    case 'inject':
      injectParser(ast, reactCovert);
      break;
    case 'provide':
      provideParser(ast, reactCovert);
      break;
    case 'created':
      lifeHookParser(ast, 'onBeforeMount', reactCovert);
      break;
    case 'beforeCreate':
      lifeHookParser(ast, 'onBeforeMount', reactCovert);
      break;
    case 'beforeMount':
      lifeHookParser(ast, 'onBeforeMount', reactCovert);
      break;
    case 'mounted':
      lifeHookParser(ast, 'onMounted', reactCovert);
      break;
    case 'beforeUpdate':
      lifeHookParser(ast, 'onBeforeUpdate', reactCovert);
      break;
    case 'updated':
      lifeHookParser(ast, 'onUpdated', reactCovert);
      break;
    case 'beforeUnmount':
      lifeHookParser(ast, 'onBeforeUnmount', reactCovert);
      break;
    case 'unmounted':
      lifeHookParser(ast, 'onUnmounted', reactCovert);
      break;
    case 'name':
      break;
    case 'directives':
      directivesParser(ast, reactCovert);
      break;
    case 'components':
      componentsParser(ast, reactCovert);
      break;
    case 'emits':
      LOG.warn('in <setup> emits no need to register ');
      break;
    default:
      const mes = 'parse js error: vue Option api not support yet -> ' + optionName;
      LOG.info(mes);
      break;
  }
}
