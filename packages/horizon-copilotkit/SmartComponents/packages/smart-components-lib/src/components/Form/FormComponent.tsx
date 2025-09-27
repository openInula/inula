import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { SmartComponentProps, ComponentTool, SmartComponentConfig } from '../../types';
import { registerComponent } from '../../utils/SmartComponentExecutor';

export interface FormComponentRef {
  setFieldValue: (field: string, value: any) => void;
  submitForm: () => void;
  getFieldsValue: () => any;
  resetFields: () => void;
  validateFields: () => Promise<any>;
  setFieldsValue: (values: Record<string, any>) => void;
  getFieldValue: (field: string) => any;
  resetField: (field: string) => void;
  validateField: (field: string) => Promise<any>;
  isFieldTouched: (field: string) => boolean;
  getSmartConfig: () => SmartComponentConfig;
}

interface FormComponentProps extends SmartComponentProps {
  onFinish?: (values: any) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'password' | 'email' | 'number';
    required?: boolean;
    placeholder?: string;
  }>;
  tools?: ('setFieldValue' | 'submitForm' | 'getFieldsValue' | 'resetFields' | 'validateFields' | 'setFieldsValue' | 'getFieldValue' | 'resetField' | 'validateField' | 'isFieldTouched')[];
  onSmartRegister?: (config: SmartComponentConfig, instance: FormComponentRef) => void;
}

const FormComponent = forwardRef<FormComponentRef, FormComponentProps>((props, ref) => {
  const { 
    onFinish = () => alert('表单提交成功'),
    layout = 'vertical',
    fields = [
      { name: 'username', label: '用户名', type: 'text', required: true, placeholder: '请输入用户名' }
    ],
    tools = ['setFieldValue', 'submitForm'],
    onSmartRegister,
    ...restProps 
  } = props;

  // 确保 Form.useForm() 在函数组件内部正确调用
  const [form] = Form.useForm();

  // 定义所有可用的工具
  const availableTools: Record<string, ComponentTool> = {
    setFieldValue: {
      name: 'setFieldValue',
      description: '设置表单字段值',
      paramsSchema: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          value: { type: 'string' }
        },
        required: ['field', 'value']
      },
      cb: (instance: FormComponentRef, params: any) => instance.setFieldValue(params.field, params.value)
    },
    submitForm: {
      name: 'submitForm',
      description: '提交表单',
      paramsSchema: {},
      cb: (instance: FormComponentRef) => instance.submitForm()
    },
    getFieldsValue: {
      name: 'getFieldsValue',
      description: '获取所有字段值',
      paramsSchema: {},
      cb: (instance: FormComponentRef) => instance.getFieldsValue()
    },
    resetFields: {
      name: 'resetFields',
      description: '重置表单字段',
      paramsSchema: {},
      cb: (instance: FormComponentRef) => instance.resetFields()
    },
    validateFields: {
      name: 'validateFields',
      description: '验证表单字段',
      paramsSchema: {},
      cb: (instance: FormComponentRef) => instance.validateFields()
    },
    setFieldsValue: {
      name: 'setFieldsValue',
      description: '批量设置表单字段值',
      paramsSchema: {
        type: 'object',
        properties: {
          values: { type: 'object' }
        },
        required: ['values']
      },
      cb: (instance: FormComponentRef, params: any) => instance.setFieldsValue(params.values)
    },
    getFieldValue: {
      name: 'getFieldValue',
      description: '获取单个字段值',
      paramsSchema: {
        type: 'object',
        properties: {
          field: { type: 'string' }
        },
        required: ['field']
      },
      cb: (instance: FormComponentRef, params: any) => instance.getFieldValue(params.field)
    },
    resetField: {
      name: 'resetField',
      description: '重置单个字段',
      paramsSchema: {
        type: 'object',
        properties: {
          field: { type: 'string' }
        },
        required: ['field']
      },
      cb: (instance: FormComponentRef, params: any) => instance.resetField(params.field)
    },
    validateField: {
      name: 'validateField',
      description: '验证单个字段',
      paramsSchema: {
        type: 'object',
        properties: {
          field: { type: 'string' }
        },
        required: ['field']
      },
      cb: (instance: FormComponentRef, params: any) => instance.validateField(params.field)
    },
    isFieldTouched: {
      name: 'isFieldTouched',
      description: '检查字段是否被修改过',
      paramsSchema: {
        type: 'object',
        properties: {
          field: { type: 'string' }
        },
        required: ['field']
      },
      cb: (instance: FormComponentRef, params: any) => instance.isFieldTouched(params.field)
    }
  };

  const refObject = React.useRef<FormComponentRef | null>(null);

  useImperativeHandle(ref, () => {
    const instance: FormComponentRef = {
      setFieldValue: (field: string, value: any) => {
        form.setFieldsValue({ [field]: value });
      },
      submitForm: () => {
        form.submit();
      },
      getFieldsValue: () => {
        return form.getFieldsValue();
      },
      resetFields: () => {
        form.resetFields();
      },
      validateFields: async () => {
        return await form.validateFields();
      },
      setFieldsValue: (values: Record<string, any>) => {
        form.setFieldsValue(values);
      },
      getFieldValue: (field: string) => {
        return form.getFieldValue(field);
      },
      resetField: (field: string) => {
        form.resetFields([field]);
      },
      validateField: async (field: string) => {
        return await form.validateFields([field]);
      },
      isFieldTouched: (field: string) => {
        return form.isFieldTouched(field);
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
            name: 'form',
            description: '智能表单组件',
            category: 'form',
            aiPrompts: ['填写表单', '输入用户名', '设置字段', '提交表单'],
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
      // 使用新的全局注册器
      registerComponent('Form', refObject.current, tools);
      
      // 如果有回调，也调用它
      if (onSmartRegister) {
        const config = refObject.current.getSmartConfig();
        onSmartRegister(config, refObject.current);
      }
    }
  }, [tools, onSmartRegister]);

  const handleFinish = (values: any) => {
    onFinish(values);
  };

  return (
    <Form 
      form={form} 
      onFinish={handleFinish} 
      layout={layout}
      data-smart-component="form"
      {...restProps}
    >
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}
        >
          <Input 
            type={field.type} 
            placeholder={field.placeholder} 
          />
        </Form.Item>
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
});

FormComponent.displayName = 'FormComponent';

export default FormComponent;