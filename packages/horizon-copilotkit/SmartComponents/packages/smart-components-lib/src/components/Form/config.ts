import { SmartComponentConfig } from '../../types';

export const formConfig: SmartComponentConfig = {
  meta: {
    name: 'form',
    description: '智能表单组件，支持动态字段配置、表单验证、数据提交等功能',
    category: 'form',
    aiPrompts: [
      '创建一个表单',
      '需要输入用户信息', 
      '填写数据',
      '提交表单',
      '用户注册',
      '信息收集',
      '数据录入',
      '表单验证',
      '用户登录'
    ],
    capabilities: [
      '设置字段值',
      '提交表单', 
      '验证输入',
      '重置表单',
      '获取表单数据',
      '动态添加字段',
      '表单布局控制'
    ],
    version: '1.0.0'
  },
  tools: {
    setFieldValue: {
      name: 'setFieldValue',
      description: '设置表单字段的值',
      paramsSchema: {
        type: 'object',
        properties: {
          field: { type: 'string', description: '字段名称' },
          value: { description: '字段值' }
        },
        required: ['field', 'value']
      },
      cb: (instance: any, params: { field: string; value: any }) => {
        instance.setFieldValue(params.field, params.value);
        return { success: true, message: `已设置字段 ${params.field} 的值` };
      }
    },
    submitForm: {
      name: 'submitForm',
      description: '提交表单',
      paramsSchema: {
        type: 'object',
        properties: {}
      },
      cb: (instance: any) => {
        instance.submitForm();
        return { success: true, message: '表单已提交' };
      }
    },
    getFieldsValue: {
      name: 'getFieldsValue',
      description: '获取所有表单字段的值',
      paramsSchema: {
        type: 'object',
        properties: {}
      },
      cb: (instance: any) => {
        const values = instance.getFieldsValue();
        return { success: true, data: values };
      }
    },
    resetFields: {
      name: 'resetFields',
      description: '重置表单所有字段',
      paramsSchema: {
        type: 'object',
        properties: {}
      },
      cb: (instance: any) => {
        instance.resetFields();
        return { success: true, message: '表单已重置' };
      }
    },
    validateFields: {
      name: 'validateFields',
      description: '验证表单字段',
      paramsSchema: {
        type: 'object',
        properties: {}
      },
      cb: async (instance: any) => {
        try {
          const values = await instance.validateFields();
          return { success: true, data: values, message: '表单验证通过' };
        } catch (error) {
          return { success: false, message: '表单验证失败', error };
        }
      }
    }
  }
};