import { SmartComponentConfig } from '../../types';
import { SelectOption } from './SelectComponent';

export const selectConfig: SmartComponentConfig = {
  meta: {
    name: 'select',
    description: '智能选择器组件，支持单选、多选、搜索、动态选项等功能',
    category: 'input',
    aiPrompts: [
      '选择选项',
      '下拉菜单', 
      '选择器',
      '从列表中选择',
      '筛选选项',
      '选择一个',
      '下拉框',
      '选择值',
      '多选',
      '单选'
    ],
    capabilities: [
      '设置选中值',
      '打开/关闭下拉',
      '获取选择值',
      '添加选项',
      '删除选项',
      '设置选项列表',
      '多选模式',
      '搜索过滤'
    ],
    version: '1.0.0'
  },
  tools: {
    setValue: {
      name: 'setValue',
      description: '设置选择器的值',
      paramsSchema: {
        type: 'object',
        properties: {
          value: { 
            description: '要设置的值',
            oneOf: [
              { type: 'string' },
              { type: 'number' }
            ]
          }
        },
        required: ['value']
      },
      cb: (instance: any, params: { value: string | number }) => {
        instance.setValue(params.value);
        return { success: true, message: `已设置选择器值为 ${params.value}` };
      }
    },
    setOpen: {
      name: 'setOpen',
      description: '打开或关闭下拉菜单',
      paramsSchema: {
        type: 'object',
        properties: {
          open: { type: 'boolean', description: '是否打开下拉菜单' }
        },
        required: ['open']
      },
      cb: (instance: any, params: { open: boolean }) => {
        instance.setOpen(params.open);
        return { success: true, message: `下拉菜单已${params.open ? '打开' : '关闭'}` };
      }
    },
    getValue: {
      name: 'getValue',
      description: '获取当前选择的值',
      paramsSchema: {
        type: 'object',
        properties: {}
      },
      cb: (instance: any) => {
        const value = instance.getValue();
        return { success: true, data: value };
      }
    },
    addOption: {
      name: 'addOption',
      description: '添加新的选项',
      paramsSchema: {
        type: 'object',
        properties: {
          value: { 
            description: '选项值',
            oneOf: [
              { type: 'string' },
              { type: 'number' }
            ]
          },
          label: { type: 'string', description: '选项显示文本' },
          disabled: { type: 'boolean', description: '是否禁用该选项' }
        },
        required: ['value', 'label']
      },
      cb: (instance: any, params: SelectOption) => {
        instance.addOption(params);
        return { success: true, message: `已添加选项 ${params.label}` };
      }
    },
    removeOption: {
      name: 'removeOption',
      description: '删除选项',
      paramsSchema: {
        type: 'object',
        properties: {
          value: { 
            description: '要删除的选项值',
            oneOf: [
              { type: 'string' },
              { type: 'number' }
            ]
          }
        },
        required: ['value']
      },
      cb: (instance: any, params: { value: string | number }) => {
        instance.removeOption(params.value);
        return { success: true, message: `已删除选项 ${params.value}` };
      }
    },
    setOptions: {
      name: 'setOptions',
      description: '设置完整的选项列表',
      paramsSchema: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: { 
                  oneOf: [
                    { type: 'string' },
                    { type: 'number' }
                  ]
                },
                label: { type: 'string' },
                disabled: { type: 'boolean' }
              },
              required: ['value', 'label']
            },
            description: '选项列表'
          }
        },
        required: ['options']
      },
      cb: (instance: any, params: { options: SelectOption[] }) => {
        instance.setOptions(params.options);
        return { success: true, message: `已更新选项列表，共 ${params.options.length} 个选项` };
      }
    }
  }
};