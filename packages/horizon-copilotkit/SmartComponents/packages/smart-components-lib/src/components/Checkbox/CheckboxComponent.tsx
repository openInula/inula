import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Checkbox } from 'antd';
import { SmartComponentProps, ComponentTool, SmartComponentConfig } from '../../types';
import { registerComponent } from '../../utils/SmartComponentExecutor';

export interface CheckboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CheckboxComponentRef {
  setChecked: (checked: boolean) => void;
  getChecked: () => boolean;
  toggle: () => void;
  setDisabled: (disabled: boolean) => void;
  getDisabled: () => boolean;
  focus: () => void;
  blur: () => void;
  // 对于 Checkbox.Group
  setValues: (values: string[]) => void;
  getValues: () => string[];
  selectAll: () => void;
  clearAll: () => void;
  addOption: (option: CheckboxOption) => void;
  removeOption: (value: string) => void;
  setOptions: (options: CheckboxOption[]) => void;
  getOptions: () => CheckboxOption[];
  getSmartConfig: () => SmartComponentConfig;
}

interface CheckboxComponentProps extends SmartComponentProps {
  // 单个 Checkbox 的属性
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  // Checkbox.Group 的属性
  isGroup?: boolean;
  options?: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  direction?: 'horizontal' | 'vertical';
  onChange?: (checkedValue: any) => void;
  tools?: ('setChecked' | 'getChecked' | 'toggle' | 'setDisabled' | 'getDisabled' | 'focus' | 'blur' | 'setValues' | 'getValues' | 'selectAll' | 'clearAll' | 'addOption' | 'removeOption' | 'setOptions' | 'getOptions')[];
  onSmartRegister?: (config: SmartComponentConfig, instance: CheckboxComponentRef) => void;
}

const CheckboxComponent = forwardRef<CheckboxComponentRef, CheckboxComponentProps>((props, ref) => {
  const {
    checked = false,
    defaultChecked = false,
    disabled = false,
    children = '选择框',
    isGroup = false,
    options: initialOptions = [
      { label: '选项A', value: 'A' },
      { label: '选项B', value: 'B' },
      { label: '选项C', value: 'C' }
    ],
    value: initialValues = [],
    defaultValue = [],
    direction = 'horizontal',
    onChange,
    tools = ['setChecked', 'getChecked', 'toggle'],
    onSmartRegister,
    ...restProps
  } = props;

  const [currentChecked, setCurrentChecked] = useState<boolean>(checked || defaultChecked);
  const [currentDisabled, setCurrentDisabled] = useState<boolean>(disabled);
  const [currentValues, setCurrentValues] = useState<string[]>(Array.isArray(initialValues) ? initialValues : Array.isArray(defaultValue) ? defaultValue : []);
  const [currentOptions, setCurrentOptions] = useState<CheckboxOption[]>(initialOptions);
  const checkboxRef = React.useRef<any>(null);

  // 定义所有可用的工具
  const availableTools: Record<string, ComponentTool> = {
    setChecked: {
      name: 'setChecked',
      description: '设置复选框选中状态',
      paramsSchema: {
        type: 'object',
        properties: {
          checked: { type: 'boolean', description: '是否选中' }
        },
        required: ['checked']
      },
      cb: (instance: CheckboxComponentRef, params: any) => instance.setChecked(params.checked)
    },
    getChecked: {
      name: 'getChecked',
      description: '获取复选框选中状态',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.getChecked()
    },
    toggle: {
      name: 'toggle',
      description: '切换复选框状态',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.toggle()
    },
    setDisabled: {
      name: 'setDisabled',
      description: '设置复选框禁用状态',
      paramsSchema: {
        type: 'object',
        properties: {
          disabled: { type: 'boolean', description: '是否禁用' }
        },
        required: ['disabled']
      },
      cb: (instance: CheckboxComponentRef, params: any) => instance.setDisabled(params.disabled)
    },
    getDisabled: {
      name: 'getDisabled',
      description: '获取复选框禁用状态',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.getDisabled()
    },
    focus: {
      name: 'focus',
      description: '聚焦到复选框',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.focus()
    },
    blur: {
      name: 'blur',
      description: '失焦复选框',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.blur()
    },
    setValues: {
      name: 'setValues',
      description: '设置复选框组选中值',
      paramsSchema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { type: 'string' }, description: '选中的值数组' }
        },
        required: ['values']
      },
      cb: (instance: CheckboxComponentRef, params: any) => instance.setValues(params.values)
    },
    getValues: {
      name: 'getValues',
      description: '获取复选框组选中值',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.getValues()
    },
    selectAll: {
      name: 'selectAll',
      description: '选择所有选项',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.selectAll()
    },
    clearAll: {
      name: 'clearAll',
      description: '清空所有选择',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.clearAll()
    },
    addOption: {
      name: 'addOption',
      description: '添加复选框选项',
      paramsSchema: {
        type: 'object',
        properties: {
          option: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              value: { type: 'string' },
              disabled: { type: 'boolean' }
            },
            required: ['label', 'value']
          }
        },
        required: ['option']
      },
      cb: (instance: CheckboxComponentRef, params: any) => instance.addOption(params.option)
    },
    removeOption: {
      name: 'removeOption',
      description: '移除复选框选项',
      paramsSchema: {
        type: 'object',
        properties: {
          value: { type: 'string', description: '要移除的选项值' }
        },
        required: ['value']
      },
      cb: (instance: CheckboxComponentRef, params: any) => instance.removeOption(params.value)
    },
    setOptions: {
      name: 'setOptions',
      description: '设置复选框选项',
      paramsSchema: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                disabled: { type: 'boolean' }
              },
              required: ['label', 'value']
            }
          }
        },
        required: ['options']
      },
      cb: (instance: CheckboxComponentRef, params: any) => instance.setOptions(params.options)
    },
    getOptions: {
      name: 'getOptions',
      description: '获取复选框选项',
      paramsSchema: {},
      cb: (instance: CheckboxComponentRef) => instance.getOptions()
    }
  };

  const refObject = React.useRef<CheckboxComponentRef | null>(null);

  useImperativeHandle(ref, () => {
    const instance: CheckboxComponentRef = {
      setChecked: (checked: boolean) => {
        setCurrentChecked(checked);
      },
      getChecked: () => {
        return currentChecked;
      },
      toggle: () => {
        setCurrentChecked(prev => !prev);
      },
      setDisabled: (disabled: boolean) => {
        setCurrentDisabled(disabled);
      },
      getDisabled: () => {
        return currentDisabled;
      },
      focus: () => {
        checkboxRef.current?.focus();
      },
      blur: () => {
        checkboxRef.current?.blur();
      },
      setValues: (values: string[]) => {
        setCurrentValues(Array.isArray(values) ? values : []);
      },
      getValues: () => {
        return currentValues;
      },
      selectAll: () => {
        const allValues = currentOptions.filter(opt => !opt.disabled).map(opt => opt.value);
        setCurrentValues(allValues);
      },
      clearAll: () => {
        setCurrentValues([]);
      },
      addOption: (option: CheckboxOption) => {
        setCurrentOptions(prev => [...prev, option]);
      },
      removeOption: (value: string) => {
        setCurrentOptions(prev => prev.filter(opt => opt.value !== value));
        setCurrentValues(prev => prev.filter(val => val !== value));
      },
      setOptions: (options: CheckboxOption[]) => {
        setCurrentOptions(options);
      },
      getOptions: () => {
        return currentOptions;
      },
      getSmartConfig: (): SmartComponentConfig => {
        const selectedTools: Record<string, ComponentTool> = {};
        tools.forEach(toolName => {
          if (availableTools[toolName]) {
            selectedTools[toolName] = availableTools[toolName];
          }
        });

        return {
          meta: {
            name: 'checkbox',
            description: '智能复选框组件',
            category: 'input',
            aiPrompts: ['选择选项', '取消选择', '全选', '清空选择'],
            capabilities: tools,
            version: '1.0.0'
          },
          tools: selectedTools
        };
      }
    };

    refObject.current = instance;
    return instance;
  });

  // 当组件挂载时，自动注册到全局系统
  useEffect(() => {
    if (refObject.current) {
      registerComponent('Checkbox', refObject.current, tools);
      
      if (onSmartRegister) {
        const config = refObject.current.getSmartConfig();
        onSmartRegister(config, refObject.current);
      }
    }
  }, [tools, onSmartRegister]);

  const handleChange = (e: any) => {
    if (isGroup) {
      const newValues = Array.isArray(e) ? e : [];
      setCurrentValues(newValues);
      if (onChange) {
        onChange(newValues);
      }
    } else {
      setCurrentChecked(e.target.checked);
      if (onChange) {
        onChange(e);
      }
    }
  };

  if (isGroup) {
    return (
      <Checkbox.Group
        options={currentOptions}
        value={currentValues}
        onChange={handleChange}
        disabled={currentDisabled}
        data-smart-component="checkbox-group"
        style={{ display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row', gap: '8px' }}
        {...restProps}
      />
    );
  }

  return (
    <Checkbox
      ref={checkboxRef}
      checked={currentChecked}
      disabled={currentDisabled}
      onChange={handleChange}
      data-smart-component="checkbox"
      {...restProps}
    >
      {children}
    </Checkbox>
  );
});

CheckboxComponent.displayName = 'CheckboxComponent';

export default CheckboxComponent;