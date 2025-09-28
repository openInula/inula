// 全局AI执行器 - 完全自动化的智能组件系统

// 字段名映射 - 将AI理解的字段名映射到实际的表单字段名
const fieldNameMapping: Record<string, string> = {
  '姓名': 'username',
  '用户名': 'username', 
  '名字': 'username',
  '邮箱': 'email',
  '电子邮件': 'email',
  'email': 'email',
  'username': 'username',
  '年龄': 'age',
  '地址': 'address',
  '电话': 'phone',
  '手机': 'phone'
};

// 全局组件注册表
interface SmartRegistry {
  components: Map<string, any>;
  initialized: boolean;
}

// 确保全局注册表存在
const getGlobalRegistry = (): SmartRegistry => {
  if (!(window as any).__smartComponents__) {
    (window as any).__smartComponents__ = {
      components: new Map(),
      initialized: true
    };
    console.log('🤖 Smart Components 系统已初始化');
  }
  return (window as any).__smartComponents__;
};

// 注册组件实例
export const registerComponent = async (name: string, instance: any, tools: string[]) => {
  const registry = getGlobalRegistry();
  
  // 避免重复注册
  if (registry.components.has(name)) {
    console.log(`⚠️  组件 ${name} 已存在，跳过注册`);
    return;
  }
  
  registry.components.set(name, instance);
  console.log(`✅ 组件 ${name} 已注册到全局registry`);

  // 自动注册到后端
  const componentInfo = {
    name: name,
    description: `${name}组件`,
    tools: tools.map(toolName => ({
      name: toolName,
      description: `${toolName}工具`,
      paramsSchema: {
        type: "object",
        properties: {
          field: { type: "string" },
          value: { type: "string" }
        },
        required: ["field", "value"]
      },
    })),
  };

  try {
    const response = await fetch("http://localhost:8000/api/register", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(componentInfo)
    });
    
    if (response.ok) {
      console.log(`✅ ${name}组件 自动注册到后端成功`);
    }
  } catch (err) {
    console.log(`❌ ${name}组件 自动注册到后端失败`, err);
  }
};

// 调用组件工具 - 支持所有智能组件
const callComponentTool = async (name: string, tool: string, params: any) => {
  const registry = getGlobalRegistry();
  const entry = registry.components.get(name);
  if (!entry) {
    throw new Error(`未找到组件: ${name}`);
  }
  
  // 表单组件工具
  if (name === 'Form') {
    if (tool === 'setFieldValue' && entry.setFieldValue) {
      const actualFieldName = fieldNameMapping[params.field] || params.field;
      console.log(`🎯 Form映射字段: ${params.field} -> ${actualFieldName}, 值: ${params.value}`);
      entry.setFieldValue(actualFieldName, params.value);
      return { type: 'text', text: `字段 ${actualFieldName} 已设置为 ${params.value}` };
    }
    if (tool === 'submitForm' && entry.submitForm) {
      entry.submitForm();
      return { type: 'text', text: '表单已提交' };
    }
    if (tool === 'setFieldsValue' && entry.setFieldsValue) {
      entry.setFieldsValue(params.values);
      return { type: 'text', text: '批量设置字段完成' };
    }
    if (tool === 'resetFields' && entry.resetFields) {
      entry.resetFields();
      return { type: 'text', text: '表单已重置' };
    }
  }
  
  // 选择器组件工具
  if (name === 'Select') {
    if (tool === 'setValue' && entry.setValue) {
      console.log(`🎯 Select设置值: ${params.value}`);
      entry.setValue(params.value);
      return { type: 'text', text: `选择器值已设置为 ${params.value}` };
    }
    if (tool === 'clearValue' && entry.clearValue) {
      entry.clearValue();
      return { type: 'text', text: '选择器已清空' };
    }
    if (tool === 'addOption' && entry.addOption) {
      entry.addOption(params.option || params);
      return { type: 'text', text: '选项已添加' };
    }
  }
  
  // 表格组件工具
  if (name === 'Table') {
    if (tool === 'addRow' && entry.addRow) {
      // 处理不同的参数格式
      let rowData = params.row;
      if (!rowData && params.value) {
        try {
          // 如果value是字符串，尝试解析为JSON
          rowData = typeof params.value === 'string' ? JSON.parse(params.value) : params.value;
        } catch (e) {
          console.error('解析行数据失败:', e);
          rowData = params;
        }
      } else if (!rowData) {
        rowData = params;
      }
      
      // 为行数据添加key，如果没有的话
      if (rowData && !rowData.key) {
        rowData.key = Date.now().toString();
      }
      
      console.log(`🎯 Table添加行:`, rowData);
      entry.addRow(rowData);
      return { type: 'text', text: '表格行已添加' };
    }
    if (tool === 'removeRow' && entry.removeRow) {
      entry.removeRow(params.index);
      return { type: 'text', text: `第${params.index + 1}行已删除` };
    }
    if (tool === 'setData' && entry.setData) {
      entry.setData(params.data);
      return { type: 'text', text: '表格数据已更新' };
    }
    if (tool === 'clearData' && entry.clearData) {
      entry.clearData();
      return { type: 'text', text: '表格数据已清空' };
    }
  }
  
  // 复选框组件工具
  if (name === 'Checkbox') {
    if (tool === 'setChecked' && entry.setChecked) {
      console.log(`🎯 Checkbox设置状态: ${params.checked}`);
      entry.setChecked(params.checked);
      return { type: 'text', text: `复选框已${params.checked ? '选中' : '取消选中'}` };
    }
    if (tool === 'toggle' && entry.toggle) {
      entry.toggle();
      return { type: 'text', text: '复选框状态已切换' };
    }
    if (tool === 'selectAll' && entry.selectAll) {
      entry.selectAll();
      return { type: 'text', text: '已全选所有选项' };
    }
    if (tool === 'clearAll' && entry.clearAll) {
      entry.clearAll();
      return { type: 'text', text: '已清空所有选择' };
    }
  }
  
  // 通用工具调用
  if (entry[tool] && typeof entry[tool] === 'function') {
    await entry[tool](params);
    return { type: 'text', text: `${tool}执行完成` };
  }
  
  throw new Error(`组件 ${name} 中未找到工具方法: ${tool}`);
};

// 全局AI执行入口 - 完全自动化
export const executeAICommand = async (userInput: string): Promise<any> => {
  try {
    console.log(`🚀 执行AI指令: ${userInput}`);
    
    const response = await fetch("http://localhost:8000/api/execute", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_input: userInput
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`后端执行失败: ${JSON.stringify(err)}`);
    }

    const responseData = await response.json();
    console.log(`📋 AI返回的actions:`, responseData);
    
    const results = [];
    for (const action of responseData.actions) {
      try {
        const result = await callComponentTool(
          action.component,
          action.tool,
          action.parameters
        );
        results.push({
          component: action.component,
          tool: action.tool,
          status: 'success',
          result
        });
      } catch (error: any) {
        results.push({
          component: action.component,
          tool: action.tool,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log("✅ AI指令执行完成:", results);
    return {
      success: true,
      message: responseData.message,
      results
    };
  } catch (error: any) {
    console.error("❌ AI指令执行失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 暴露给全局使用
(window as any).SmartComponents = {
  execute: executeAICommand,
  registry: getGlobalRegistry()
};