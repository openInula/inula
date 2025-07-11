/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import Inula, { useState, useEffect, useRef, ChangeEvent, FC } from 'openinula';

// 定义组件的属性接口
interface SemiControlledInputProps {
  value?: { value: string }; // 值对象，包含一个 value 属性
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void; // 变更事件处理函数
  [key: string]: any; // 允许传入任意其他属性
}

/**
 * SemiControlledInput 组件
 *
 * 这是一个半受控的输入框组件，结合了受控和非受控组件的特性。
 * 它允许直接操作 DOM 来设置输入值，同时也响应 props 的变化。
 *
 * @param {Object} props - 组件属性
 * @param {Object} props.valueObj - 包含输入值的对象，格式为 { value: string }，为了保证SemiControlledInput每次都刷新
 * @param {function} props.onChange - 输入值变化时的回调函数
 * @param {Object} props.[...otherProps] - 其他传递给 input 元素的属性
 *
 * @returns {JSX.Element} 返回一个 input 元素
 *
 * @example
 * <SemiControlledInput
 *   valueObj={{ value: 'initialValue' }}
 *   onChange={(e) => console.log('New value:', e.target.value)}
 *   placeholder="Enter text"
 * />
 */
export const SemiControlledInput: FC<SemiControlledInputProps> = ({ value = { value: '' }, onChange, ...props }) => {
  // 使用内部状态管理输入值，初始值为传入的 valueObj.value
  const [internalValue, setInternalValue] = useState(value.value);

  // 创建一个引用，用于直接访问 input 元素
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 当传入的 valueObj 变化时，同步更新内部状态
  useEffect(() => {
    if (value.value !== internalValue) {
      setInternalValue(value.value);
    }
  }, [value]);

  // 处理输入框值的直接修改（如通过 JavaScript 设置 value 属性）
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handlePropertyChange = () => {
      const newValue = input.value;
      if (newValue !== internalValue) {
        setInternalValue(newValue);
        if (onChange) {
          // 触发 onChange 事件，模拟原生 input 事件
          onChange({ target: { value: newValue } } as ChangeEvent<HTMLInputElement>);
        }
      }
    };

    // 获取 input 元素 'value' 属性的原始描述符
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (!descriptor) return;

    const originalSetter = descriptor.set;

    // 重写 'value' 属性的 setter，以捕获直接对 value 的赋值操作
    Object.defineProperty(input, 'value', {
      get: descriptor.get,
      set: function (val) {
        originalSetter?.call(this, val);
        handlePropertyChange();
      },
      configurable: true,
    });

    // 清理函数：组件卸载时恢复原始的 'value' 属性描述符
    return () => {
      Object.defineProperty(input, 'value', descriptor);
    };
  }, [onChange, internalValue]);

  // 处理输入框的 onChange 事件
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  // 渲染 input 元素
  return (
    <input
      ref={inputRef} // 绑定 ref 到 input 元素
      value={internalValue} // 使用内部状态作为输入框的值
      onChange={handleChange} // 绑定 onChange 事件处理函数
      {...props} // 展开其他传入的属性
    />
  );
};
