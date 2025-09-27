import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Select } from 'antd';
import { SmartComponentProps, ComponentTool, SmartComponentConfig } from '../../types';
import { registerComponent } from '../../utils/SmartComponentExecutor';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectComponentRef {
  setValue: (value: string | number) => void;
  setOpen: (open: boolean) => void;
  getValue: () => string | number | undefined;
  addOption: (option: SelectOption) => void;
  removeOption: (value: string | number) => void;
  setOptions: (options: SelectOption[]) => void;
  getSmartConfig: () => SmartComponentConfig;
}

interface SelectComponentProps extends SmartComponentProps {
  defaultValue?: string | number;
  options?: SelectOption[];
  placeholder?: string;
  allowClear?: boolean;
  mode?: 'multiple' | 'tags';
  onChange?: (value: any) => void;
  onOpenChange?: (open: boolean) => void;
  tools?: ('setValue' | 'setOpen' | 'getValue' | 'addOption' | 'removeOption' | 'setOptions')[];
  onSmartRegister?: (config: SmartComponentConfig, instance: SelectComponentRef) => void;
}

const SelectComponent = forwardRef<SelectComponentRef, SelectComponentProps>((props, ref) => {
  const { 
    defaultValue = 'Mary',
    options: initialOptions = [
      { value: 'Mary', label: 'Mary' },
      { value: 'lucy', label: 'Lucy' },
      { value: 'Yiminghe', label: 'yiminghe' },
      { value: 'disabled', label: 'Disabled', disabled: true }
    ],
    placeholder = '请选择',
    allowClear = false,
    mode,
    onChange,
    onOpenChange,
    tools = ['setValue', 'setOpen'],
    onSmartRegister,
    ...restProps
  } = props;

  const [value, setValue] = useState<string | number | undefined>(defaultValue);
  const [open, setOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);

  // 定义所有可用的工具
  const availableTools: Record<string, ComponentTool> = {
    setValue: {
      name: 'setValue',
      description: '设置选择器的值',
      paramsSchema: {
        type: 'object',
        properties: {
          value: { type: 'string', description: '要设置的选中值' }
        },
        required: ['value']
      },
      cb: (instance: SelectComponentRef, params: any) => instance.setValue(params.value)
    },
    setOpen: {
      name: 'setOpen',
      description: '设置选择器打开和关闭状态',
      paramsSchema: {
        type: 'object',
        properties: {
          open: { type: 'boolean', description: '设置的选择器打开还是关闭状态' }
        },
        required: ['open']
      },
      cb: (instance: SelectComponentRef, params: any) => instance.setOpen(params.open)
    },
    getValue: {
      name: 'getValue',
      description: '获取选择器当前值',
      paramsSchema: {},
      cb: (instance: SelectComponentRef) => instance.getValue()
    },
    addOption: {
      name: 'addOption',
      description: '添加选项',
      paramsSchema: {
        type: 'object',
        properties: {
          option: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
              disabled: { type: 'boolean' }
            },
            required: ['value', 'label']
          }
        },
        required: ['option']
      },
      cb: (instance: SelectComponentRef, params: any) => instance.addOption(params.option)
    },
    removeOption: {
      name: 'removeOption',
      description: '移除选项',
      paramsSchema: {
        type: 'object',
        properties: {
          value: { type: 'string', description: '要移除的选项值' }
        },
        required: ['value']
      },
      cb: (instance: SelectComponentRef, params: any) => instance.removeOption(params.value)
    },
    setOptions: {
      name: 'setOptions',
      description: '设置所有选项',
      paramsSchema: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                label: { type: 'string' },
                disabled: { type: 'boolean' }
              },
              required: ['value', 'label']
            }
          }
        },
        required: ['options']
      },
      cb: (instance: SelectComponentRef, params: any) => instance.setOptions(params.options)
    }
  };

  const refObject = React.useRef<SelectComponentRef | null>(null);

  useImperativeHandle(ref, () => {
    const instance: SelectComponentRef = {
      setValue: (val: string | number) => {
        setValue(val);
      },
      setOpen: (open: boolean) => {
        setOpen(open);
      },
      getValue: () => {
        return value;
      },
      addOption: (option: SelectOption) => {
        setOptions(prev => [...prev, option]);
      },
      removeOption: (val: string | number) => {
        setOptions(prev => prev.filter(opt => opt.value !== val));
      },
      setOptions: (newOptions: SelectOption[]) => {
        setOptions(newOptions);
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
            name: 'select',
            description: '智能选择器组件',
            category: 'input',
            aiPrompts: ['选择选项', '设置值', '打开选择器', '关闭选择器'],
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
      registerComponent('Select', refObject.current, tools);
      
      if (onSmartRegister) {
        const config = refObject.current.getSmartConfig();
        onSmartRegister(config, refObject.current);
      }
    }
  }, [tools, onSmartRegister]);

  const handleChange = (val: any) => {
    setValue(val);
    onChange?.(val);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={options}
      onOpenChange={handleOpenChange}
      open={open}
      placeholder={placeholder}
      allowClear={allowClear}
      mode={mode}
      data-smart-component="select"
      {...restProps}
    />
  );
});

SelectComponent.displayName = 'SelectComponent';

export default SelectComponent;