import t from '@babel/types';
import { traverse } from '@babel/core';
import LOG from '../../logHelper.js';
import { findCallVariableAndValue, checkCallVariable } from './jsUtils.js';
import { propsParser } from './handlers/propsHandler.js';
import { globalLibPaths } from '../defaultConfig.js';

/**
 * setup模式的vue js代码切换到react函数组件的
 * @param {*} sourceAst
 * @param {*} reactCovert
 */
export default function vueSetupModelToReactHandler(sourceAst, reactCovert, importAliasApiSet) {
  traverse(sourceAst, {
    enter(path) {
      if (path.parent && path.parent.type === 'Program') {
        if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportDefaultDeclaration'].indexOf(path.type) > -1) {
          path.skip();
          return;
        }
        if (['CommentBlock', 'CommentLine'].indexOf(path.type) > -1) {
          reactCovert.addCodeAstToHorizon(path.node);
          path.skip();
          return;
        }

        let shouldBeAdd = true;
        const globalComponentName = [
          'defineProps',
          'onMounted',
          'onUpdated',
          'onUnmounted',
          'onBeforeMount',
          'onBeforeUpdate',
          'onBeforeUnmount',
          'onErrorCaptured',
          'onRenderTracked',
          'onRenderTriggered',
          'onActivated',
          'onDeactivated',
          'onServerPrefetch',
          'watch',
          'defineExpose',
          'defineEmits',
        ];
        if (
          path.type === 'ExpressionStatement' &&
          path?.node?.expression?.callee &&
          globalComponentName.indexOf(path.node.expression.callee.name) === -1 &&
          !path.node.expression.callee.name?.startsWith('use')
        ) {
          reactCovert.addExpressionToComponentInit(path.node);
          path.skip();
          return;
        }

        path.traverse({
          CallExpression: pathsub => {
            // 收集ref computed reactive defineProps 所定义的变量, 用在后续html模板中替换
            // importAliasApiSet 主要提供别名  比如  import {ref as  xxRef}
            // importAliasApiSet.ref   {ref, xxRef}
            const targetname = pathsub.node.callee.name;
            // 处理ref函数
            if (importAliasApiSet.ref.has(targetname)) {
              if (checkCallVariable(pathsub)) {
                const [varName, iniValue] = findCallVariableAndValue(pathsub);
                reactCovert.sourceCodeContext.addRef(varName, iniValue);
              }
              // 处理computed函数
            } else if (importAliasApiSet.computed.has(targetname)) {
              if (checkCallVariable(pathsub)) {
                const [varName, iniValue] = findCallVariableAndValue(pathsub);
                reactCovert.sourceCodeContext.addComputed(varName, iniValue);
              }
              // 处理reactive函数
            } else if (importAliasApiSet.reactive.has(targetname)) {
              // 处理defineProps函数
            } else if (targetname === 'defineProps') {
              // 因为defineProps解析后,会放到react函数组件的入参中,所以不需要
              shouldBeAdd = false;

              // 获取父节点(VariableDeclarator)
              const variableDeclarator = pathsub.parentPath;
              // 获取变量名
              if (t.isVariableDeclarator(variableDeclarator.node)) {
                const propsName = variableDeclarator.node.id.name;
                if (propsName && propsName !== reactCovert.sourceCodeContext.propsName) {
                  reactCovert.sourceCodeContext.propsName = propsName;
                }
              }

              const propsArgument = pathsub.node.arguments[0];
              if (propsArgument && t.isObjectExpression(propsArgument)) {
                propsParser(propsArgument, reactCovert);
              } else if (!propsArgument) { // 没有传参数
                reactCovert.addUseReactiveProps();

                // 如果是解构形式，例如 const { title } = defineProps()
                const destructuredProps = variableDeclarator.node.id; // 解构赋值左边的部分
                if (t.isObjectPattern(variableDeclarator.node.id)) {
                  destructuredProps.properties.forEach(prop => {
                    if (t.isObjectProperty(prop)) {
                      if (t.isObjectProperty(prop)) {
                        const propName = prop.key.name;

                        // 生成 const title = props.title
                        const newVariableDeclaration = t.variableDeclaration('const', [
                          t.variableDeclarator(
                            t.identifier(propName), // 新的变量名 (如: title)
                            t.memberExpression(
                              t.identifier(reactCovert.sourceCodeContext.propsName), // 组件 props 对象 (例如: props)
                              t.identifier(propName) // 访问 prop 对象的属性 (例如: props.title)
                            )
                          )
                        ]);

                        // 将新生成的 const 声明插入到合适的位置
                        reactCovert.addCodeAstToHorizon(newVariableDeclaration, false);
                      }
                    }
                  });
                }
              } else {
                LOG.error(`The parameter of defineProps must be a declarative object, for example, {'name': { type: String }}. It cannot be a variable.`);
              }
              pathsub.stop();
            } else if (targetname === 'defineExpose') {
              reactCovert.sourceCodeContext.addExtrasImport(targetname, globalLibPaths.vue);
            } else if (targetname === 'defineOptions') {
              LOG.error(`the api [${targetname}] did  no support parse`);
            } else if (targetname === 'defineSlots') {
              LOG.error(`the api [${targetname}] did  no support parse`);
            } else if (targetname === 'defineEmits' || targetname === 'useSlots' || targetname === 'useAttrs') {
              if (pathsub.parentPath && pathsub.parentPath.type === 'VariableDeclarator') {
                const varName = pathsub.parentPath.node.id.name;
                const originalArguments = pathsub.node.arguments;

                // 创建新的 defineEmits 调用，添加 props 参数
                const newDefineEmits = t.callExpression(t.identifier(targetname), [
                  ...originalArguments,
                  t.identifier(reactCovert.sourceCodeContext.propsName),
                ]);

                // 创建新的变量声明
                const newVariableDeclarator = t.variableDeclarator(t.identifier(varName), newDefineEmits);

                // 替换原来的 VariableDeclarator
                pathsub.parentPath.replaceWith(newVariableDeclarator);
              }
              pathsub.stop();

              if (targetname === 'defineEmits') {
                reactCovert.sourceCodeContext.addExtrasImport(targetname, globalLibPaths.vue);
              }
            } else {
            }
          },
        });
        if (shouldBeAdd) {
          reactCovert.addCodeAstToHorizon(path.node);
        }
      }
    },
  });
}
