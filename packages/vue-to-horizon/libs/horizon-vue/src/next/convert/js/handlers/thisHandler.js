import { traverse } from '@babel/core';
import {
  createNodeByVueVariable,
  getThisProperty,
  handlerThisExpression,
  isThisNode,
  THIS_ALIASES,
} from '../../jsx/handlers/expressionHandler.js';
import t from '@babel/types';
import { globalLibPaths, GlobalMethod } from '../../defaultConfig.js';
import { addInstance } from '../../jsx/handlers/instanceHandler.js';
import { INSTANCE } from '../../jsx/consts.js';
import LOG from '../../../logHelper.js';
import { JSWarnings } from '../../../errors.js';

/**
 * 处理 AST 中的 this 表达式转换
 * @param {Object} ast - 源代码的 AST
 * @param {Object} reactCovert - 转换上下文对象
 */
export function handleThis(ast, reactCovert) {
  traverse(ast, {
    /**
     * 处理变量声明中的 this 别名
     * 例如: 将 const that = this; 转换为 const that = instance;
     *
     * 转换前:
     * const self = this;
     * const that = this;
     *
     * 转换后:
     * const self = instance;
     * const that = instance;
     */
    VariableDeclarator(path) {
      if (THIS_ALIASES.includes(path.node.id.name) && t.isThisExpression(path.node.init)) {
        path.node.init = t.identifier('instance');
      }
    },

    /**
     * 处理普通的成员表达式中的 this
     * 例如: this.name, this.title 等
     *
     * 转换前:
     * this.name
     * this.title
     *
     * 转换后:
     * name
     * title
     */
    MemberExpression(path) {
      handlerThisExpression(path, reactCovert);
    },

    /**
     * 处理可选链式调用中的 this
     * 例如: this?.name, this?.getData?.() 等
     *
     * 转换前:
     * this?.name
     * this?.getData?.()
     *
     * 转换后:
     * name
     * getData?.()
     */
    OptionalMemberExpression(path) {
      handlerThisExpression(path, reactCovert);
    },

    /**
     * 处理方法调用中的 this
     * 主要处理三种情况:
     * 1. 全局方法调用: this.$emit()
     * 2. 普通方法调用: this.getData()
     * 3. 方法参数中的 this: findParent(this, 'name')
     *
     * 示例1 - $emit 转换:
     * 转换前: this.$emit('update:value', data)
     * 转换后: $emit(props, 'update_value', data)
     *
     * 示例2 - 普通方法调用:
     * 转换前: this.getData()
     * 转换后: getData()
     *
     * 示例3 - 参数中的 this:
     * 转换前: findParent(this, 'afterSelect')
     * 转换后: findParent(instance, 'afterSelect')
     */
    CallExpression(path) {
      const callee = path.node.callee;

      // 处理方法调用，callee 是一个成员表达式并且 object 是 this
      if (t.isMemberExpression(callee) && isThisNode(callee.object)) {
        // 处理全局方法导入，将 this.xxx() 替换成一个不含 this 的调用表达式 xxx()
        const name = path.node.callee.property.name || path.node.callee.property.value;
        if (Reflect.has(GlobalMethod, name)) {
          reactCovert.sourceCodeContext.addExtrasImport(name, globalLibPaths.vue);
        }

        // 特殊处理 $emit 方法
        if (name === '$emit') {
          // 添加 props 作为第一个参数，如：this.$emit('eventName', prams) => $emit(props, 'eventName', prams)
          path.node.arguments.unshift(t.identifier(reactCovert.sourceCodeContext.propsName));

          // 处理事件名中的冒号，replace ':' with '_' in eventName
          // 如：$emit(props, 'update:value', oDate); ===> emit(props, 'update_value', oDate);
          if (path.node.arguments[1] && t.isStringLiteral(path.node.arguments[1])) {
            const eventName = path.node.arguments[1].value;
            const modifiedEventName = eventName.replace(/:/g, '_');
            path.node.arguments[1] = t.stringLiteral(modifiedEventName);
          }
          path.replaceWith(t.callExpression(t.identifier(name), path.node.arguments));
        } else {
          handlerThisExpression(path, reactCovert);
        }
      }

      // 处理参数中的 this，如：findParent(this, 'afterSelect') ===> findParent(instance, 'afterSelect')
      if (path.node.arguments && path.node.arguments.length > 0) {
        path.node.arguments = path.node.arguments.map(arg => {
          if (arg.type === 'ThisExpression') {
            addInstance(reactCovert);
            return t.identifier(INSTANCE);
          }
          return arg;
        });
      }
    },

    // 处理更新表达式(保留为空,可能用于未来扩展)
    UpdateExpression() {},
  });
}

export function handleThisAssignment(ast, reactCovert) {
  /**
   * 找到所有this.赋值场景。比如找到 用户自定义的 this.xxx = () => {}等场景
   */
  const selfThisDefines = reactCovert.sourceCodeContext.selfThisDefines;

  traverse(ast, {
    // 赋值表达式访问者，用于匹配 this.xxx = y 形式的赋值
    AssignmentExpression(path) {
      if (t.isMemberExpression(path.node.left) && isThisNode(path.node.left.object)) {
        // 将 this.xxx 替换为一个不含 this 的标识符 xxx
        const name = getThisProperty(path.node.left);
        if (name === '') {
          LOG.warn(JSWarnings.not_support_this_templateLiteral + path.toString());
          return;
        }

        let replaceNode = createNodeByVueVariable(name, reactCovert);
        if (replaceNode) {
          path.node.left = replaceNode;
        } else {
          // 需要排除这个this.xxx是个函数
          if (reactCovert.sourceCodeContext.findKeyInMethods(name)) {
            return;
          }

          const nodeName = name + 'SelfRef';
          LOG.warn(path.toString(), 'will replace by SelfRef', nodeName);
          reactCovert.addCodeAstToHorizonForOnce(name, () => {
            return t.variableDeclaration('const', [
              t.variableDeclarator(t.identifier(nodeName), t.callExpression(t.identifier('useRef'), [])),
            ]);
          });
          reactCovert.sourceCodeContext.addExtrasImport('useRef', globalLibPaths.vue);

          selfThisDefines.set(name, nodeName);

          path.replaceWith(
            t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier(nodeName), t.identifier('value')),
              path.node.right
            )
          );
        }
      }
    },
  });
}
