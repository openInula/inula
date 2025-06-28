import { traverse } from '@babel/core';
import LOG from '../../logHelper.js';
import parserOption from './handlers/optionParserHandler.js';
/**
 *  options API 模式的vue js代码切换到react函数组件的
 * @param {*} sourceAst
 * @param {*} reactCovert
 */
export default function parseVueOption(sourceAst, reactCovert) {
  traverse(sourceAst, {
    enter(path) {
      if (path.parent && path.parent.type === 'Program') {
        if (['ImportDeclaration', 'ExportNamedDeclaration'].indexOf(path.type) > -1) {
          // 在第一阶段已经处理完全import等场景
          path.skip();
          return;
        }
        if (['CommentBlock', 'CommentLine'].indexOf(path.type) > -1) {
          reactCovert.addCodeAstToHorizon(path.node);
          path.skip();
          return;
        }

        let shouldBeAdd = true;
        if (path.type === 'ExportDefaultDeclaration') {
          shouldBeAdd = false;
          const declaration = path.node.declaration;
          switch (declaration.type) {
            case 'Identifier' | 'CallExpression' | 'SpreadElement':
              /**
               * const a = {a:1}
               * export default  a
               */
              /**
               * const a = {a:1}
               * export default Object.assign(a, {b:1})
               */
              /**
               * const a = {a:1}
               * export default  {...a}
               */
              throw ('cannot support yet!~ ', path.toString());
              break;
            case 'ObjectExpression':
              path.traverse({
                ObjectExpression: {
                  enter(subpath) {
                    if (subpath.parentPath.type === 'ExportDefaultDeclaration') {
                      // 定义属性处理的顺序，例如data，props一定要在computed等其他之前，否则会报错
                      const orderOfProcessing = [
                        'props',
                        'data',
                        'inject',
                        'components',
                        'methods',
                        'computed',
                        'directives',
                        'watch',
                        'beforeCreate',
                        'created',
                        'beforeMount',
                        'mounted',
                        'beforeUpdate',
                        'updated',
                        'beforeUnmount',
                        'unmounted',
                        'emits',
                        'provide',
                        'name',
                      ];

                      // 遍历 AST，收集所有选项和对应的属性
                      const options = new Map();
                      subpath.node.properties.forEach(prop => {
                        if (prop.key.type === 'Identifier') {
                          options.set(prop.key.name, prop);
                        }
                      });

                      // 按预定义顺序处理选项
                      for (const optionName of orderOfProcessing) {
                        if (options.has(optionName)) {
                          const property = options.get(optionName);
                          const eleType = property.type;

                          switch (eleType) {
                            case 'ObjectProperty':
                              parserOption(optionName, property.value, reactCovert);
                              break;
                            case 'ObjectMethod':
                              parserOption(optionName, property, reactCovert);
                              break;
                            case 'SpreadElement':
                              LOG.warn(`SpreadElement not supported for option: ${optionName}`, property);
                              break;
                            default:
                              const mes = `Unsupported property type for option ${optionName}: ${eleType}`;
                              LOG.error(mes);
                              throw new Error(mes);
                          }

                          options.delete(optionName); // 从集合中移除已处理的选项
                        } else {
                          if (optionName === 'props') {
                            // 得到函数react函数组件的入参
                            reactCovert.addUseReactiveProps();
                          }
                        }
                      }

                      // 处理任何剩余的未知选项
                      for (const [optionName, property] of options) {
                        const eleType = property.type;
                        switch (eleType) {
                          case 'ObjectProperty':
                          case 'ObjectMethod':
                            LOG.warn(`Unrecognized option being processed: ${optionName}`);
                            parserOption(
                              optionName,
                              property.type === 'ObjectProperty' ? property.value : property,
                              reactCovert
                            );
                            break;
                          case 'SpreadElement':
                            LOG.warn(`SpreadElement not supported for option: ${optionName}`, property);
                            break;
                          default:
                            const mes = `Unsupported property type for option ${optionName}: ${eleType}`;
                            LOG.error(mes);
                            throw new Error(mes);
                        }
                      }
                    }
                  },
                },
              });
              break;
            default:
              const mes = 'cannot support yet!~ ' + path.toString();
              LOG.error(mes);
              throw mes;
              break;
          }
        }

        if (shouldBeAdd) {
          reactCovert.addCodeAstToHorizon(path.node);
        }
      }
    },
  });
}
