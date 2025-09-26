import t from '@babel/types';
import { EVENT_PARAM_NAME } from '../../consts.js';
import { checkHasAttribute, checkStartWithAttribute, getAttributeNodeName } from '../../../nodeUtils.js';
import { createNodeByVueVariable } from '../expressionHandler.js';
import { handleOnDirective } from '../../directives.js';

/**
 * v-model 指令转换示例:
 *
 * 示例1 - 基础输入框:
 * 转换前:
 * <input v-model="searchText" />
 * 转换后:
 * <input value={searchText} onChange={($event) => searchText = $event.target.value} />
 *
 * 示例2 - 复选框:
 * 转换前:
 * <input type="checkbox" v-model="isChecked" />
 * 转换后:
 * <input type="checkbox" checked={isChecked} onChange={($event) => isChecked = $event.target.checked} />
 *
 * 示例3 - 带值的单选框:
 * 转换前:
 * <input type="radio" v-model="picked" :value="radioValue" />
 * 转换后:
 * <input type="radio" value={radioValue} checked={picked === radioValue}
 *        onChange={($event) => picked = $event.target.value} />
 *
 * 示例4 - 自定义组件:
 * 转换前:
 * <custom-input v-model="componentValue" />
 * 转换后:
 * <CustomInput modelValue={componentValue} onChange={(val) => componentValue = val} />
 *
 * 示例5 - 带有已存在的 onChange 事件:
 * 转换前:
 * <input v-model="searchText" @change="handleChange" />
 * 转换后:
 * <input value={searchText} onChange={($event) => {
 *   searchText = $event.target.value;
 *   handleChange($event);
 * }} />
 *
 * 示例6 - 带有 change 指令的输入框:
 * 转换前:
 * <input v-model="searchText" v-on:change="handleChange" />
 * 转换后:
 * <input value={searchText} onChange={($event) => {
 *   searchText = $event.target.value;
 *   handleChange($event);
 * }} />
 *
 * 示例7 - 带有自定义 change 事件名:
 * 转换前:
 * <input v-model="searchText" @change__custom="handleCustomChange" />
 * 转换后:
 * <input value={searchText} onChange={($event) => {
 *   searchText = $event.target.value;
 *   handleCustomChange($event);
 * }} />
 *
 * 示例8 - select标签绑定:
 * 转换前:
 * <select v-model="selected" @change__stop="change"  options="options"/>
 * 转换后:
 * <select value={selected} onChange={($event) => {
 *   selected = $event.target.value;
 *   change($event);
 * }} options={options} />
 */
export function handleModelDirective(path, value, reactCovert) {
  // 初始化目标值：将字符串类型的值转换为标识符节点
  let targetValue = null;
  if (typeof value === 'string') {
    targetValue = t.identifier(value);
  }

  // 初始化各种状态变量：
  // valueName: 用于存储最终绑定的属性名（value/checked/modelValue）
  // isRadio/isCheckbox: 标记是否为单选/复选框
  // expression: 用于存储onChange事件中的赋值表达式
  let valueName = 'value';
  let isRadio = false;
  let isCheckbox = false;
  let isFile = false;
  let expression;
  const parentNode = path.parentPath.node;

  // 处理 input 和 textarea 元素的特殊情况
  if (parentNode.name.name === 'input' || parentNode.name.name === 'textarea') {
    // 查找并处理 input 的 type 属性，根据不同类型设置不同的绑定属性
    const attr = parentNode.attributes.find(v => v.name.name === 'type');
    if (attr) {
      const inputType = attr.value.value;
      if (inputType === 'checkbox') {
        valueName = 'checked';
        isCheckbox = true;
      } else if (inputType === 'radio') {
        valueName = 'checked';
        isRadio = true;
      } else if (inputType === 'file') {
        isFile = true;
        valueName = 'files';
      }
    }
    // 查找是否存在现有的 value 属性
    const existingValueAttr = parentNode.attributes.find(attr => getAttributeNodeName(attr) === 'value');

    // 构造 onChange 事件中的赋值表达式：$event.target.value 或 $event.target.checked
    expression = t.memberExpression(
      t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('target')),
      t.identifier((isRadio && !existingValueAttr) || isCheckbox ? 'checked' : valueName)
    );
  } else if (parentNode.name.name === 'select') {
    valueName = 'value';
    expression = t.memberExpression(
      t.memberExpression(t.identifier(EVENT_PARAM_NAME), t.identifier('target')),
      t.identifier(valueName)
    );
  } else {
    // 对于非 input/textarea 元素，使用 modelValue 作为属性名
    valueName = 'modelValue';
    expression = t.identifier(EVENT_PARAM_NAME); // 直接使用事件参数作为值
  }

  // 特殊处理单选框和复选框的情况
  if (isRadio || isCheckbox) {
    // 查找是否存在 value 属性
    const existingValueAttr = parentNode.attributes.find(attr => getAttributeNodeName(attr) === 'value');

    if (existingValueAttr) {
      // 存在 value 属性时的处理
      let checkedExpression = t.jSXExpressionContainer(targetValue);
      // 单选框需要特殊处理：checked={radioSelect === radioValue}
      if (isRadio) {
        checkedExpression = t.jSXExpressionContainer(
          t.binaryExpression('===', targetValue, existingValueAttr.value.expression)
        );
      }

      // 更新或添加 checked 属性
      const existingCheckedAttr = parentNode.attributes.find(attr => getAttributeNodeName(attr) === 'checked');

      if (existingCheckedAttr) {
        existingCheckedAttr.value = checkedExpression;
      } else {
        parentNode.attributes.push(t.jSXAttribute(t.jSXIdentifier('checked'), checkedExpression));
      }

      // 移除原始的 v-model 属性
      path.remove();
    } else {
      // 不存在 value 属性时，直接使用 checked 绑定
      const checkedExpression = t.jSXExpressionContainer(targetValue);
      path.replaceWith(t.jSXAttribute(t.jSXIdentifier('checked'), checkedExpression));
    }
  } else {
    // 处理普通输入框和其他组件的情况
    const valueExpression = t.jSXExpressionContainer(targetValue);
    // 移除已存在的同名属性
    parentNode.attributes = parentNode.attributes.filter(item => {
      return getAttributeNodeName(item) !== valueName;
    });
    if (isFile) {
      path.remove();
    } else {
      // 替换为新的属性
      path.replaceWith(t.jSXAttribute(t.jSXIdentifier(valueName), valueExpression));
    }
  }

  // 处理 onChange 相关事件
  if (
    checkHasAttribute(parentNode, 'onChange') ||
    checkHasAttribute(parentNode, 'change') ||
    checkStartWithAttribute(parentNode, 'change__')
  ) {
    // 遍历处理所有属性
    path.parentPath.get('attributes').forEach((atr, index) => {
      let attributeNode = atr;
      let attributeName = getAttributeNodeName(attributeNode.node);
      let isChanged = false;

      // 处理 change 或 change__ 开头的属性：转换为 onChange
      if (attributeName === 'change' || attributeName.startsWith('change__')) {
        let valueStr = attributeNode.node.value.value;
        // 处理值为表达式的情况
        if (attributeNode.node.value.type === 'JSXExpressionContainer') {
          valueStr = attributeNode.node.value.expression.name;
        }
        handleOnDirective(attributeNode, attributeName, valueStr);
        attributeNode = path.parentPath.get('attributes')[index];
        attributeName = getAttributeNodeName(attributeNode.node);
        isChanged = true;
      }

      // 处理 onChange 属性：合并现有的处理函数
      if (attributeName === 'onChange') {
        // 创建赋值表达式的左侧节点
        const leftNode = isChanged
          ? t.identifier(value)
          : createNodeByVueVariable(value, reactCovert) || t.identifier(value);
        // 创建函数体，首先添加 v-model 的赋值操作
        const functionBlock = t.blockStatement([
          t.expressionStatement(t.assignmentExpression('=', leftNode, expression)),
        ]);

        // 根据不同类型的现有 onChange 处理函数进行合并
        if (
          attributeNode.node.value.type === 'JSXExpressionContainer' &&
          attributeNode.node.value.expression.type === 'ArrowFunctionExpression'
        ) {
          // 合并箭头函数的函数体
          functionBlock.body.push(...attributeNode.node.value.expression.body.body);
        } else if (attributeNode.node.value.type === 'StringLiteral') {
          // 处理字符串类型的处理函数
          functionBlock.body.push(t.identifier(attributeNode.node.value.value));
        } else if (attributeNode.node.value.expression?.name) {
          // 处理普通函数调用
          const oldChangeFunc = t.expressionStatement(
            t.callExpression(t.identifier(attributeNode.node.value.expression.name), [t.identifier(EVENT_PARAM_NAME)])
          );
          functionBlock.body.push(oldChangeFunc);
        }

        // 创建新的 onChange 处理函数
        const changeFuncNode = t.arrowFunctionExpression([t.identifier(EVENT_PARAM_NAME)], functionBlock);
        const newAttribute = t.jsxAttribute(t.jsxIdentifier('onChange'), t.jSXExpressionContainer(changeFuncNode));
        attributeNode.replaceWith(newAttribute);
      }
    });
  } else {
    // 如果没有现有的 onChange 事件，创建一个新的
    const changeFuncNode = t.arrowFunctionExpression(
      [t.identifier(EVENT_PARAM_NAME)],
      t.blockStatement([t.expressionStatement(t.assignmentExpression('=', t.identifier(value), expression))])
    );
    // 添加到属性列表中
    parentNode.attributes.push(t.jSXAttribute(t.jSXIdentifier('onChange'), t.jSXExpressionContainer(changeFuncNode)));
  }
}
