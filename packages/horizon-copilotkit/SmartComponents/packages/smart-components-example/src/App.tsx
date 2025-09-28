import React, { useState, useRef } from 'react';
import { Button, Input, message } from 'antd';
import { FormComponent, SelectComponent, TableComponent, CheckboxComponent } from '@smart-components/react';

// 扩展 Window 接口 - 支持全自动化AI执行器
declare global {
  interface Window {
    SmartComponents: {
      execute: (userInput: string) => Promise<any>;
      registry: any;
    };
  }
}

function App() {
  const formRef = useRef<any>(null);
  const selectRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const checkboxRef = useRef<any>(null);
  const [text, setText] = useState("");

  async function handleSubmit() {
    if (!text.trim()) {
      message.warning("请输入AI指令");
      return;
    }

    // 使用全自动化AI执行器 - 完全内置在组件库中
    if (window.SmartComponents && window.SmartComponents.execute) {
      const result = await window.SmartComponents.execute(text);
      
      if (result.success) {
        message.success(result.message || "AI指令执行成功");
      } else {
        message.error(`执行失败: ${result.error}`);
      }
    } else {
      message.error("Smart Components 系统尚未初始化，请稍后再试");
    }
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Smart Components 测试</h1>
      
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>智能表单组件</h3>
        <FormComponent 
          ref={formRef}
          tools={['setFieldValue', 'submitForm', 'resetFields', 'setFieldsValue']}
          fields={[
            { name: 'username', label: '用户名', type: 'text', required: true, placeholder: '请输入用户名' },
            { name: 'email', label: '邮箱', type: 'email', required: true, placeholder: '请输入邮箱' },
            { name: 'age', label: '年龄', type: 'number', placeholder: '请输入年龄' }
          ]}
          onFinish={(values) => {
            console.log('表单提交:', values);
            message.success('表单提交成功: ' + JSON.stringify(values));
          }}
        />
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>智能选择器组件</h3>
        <SelectComponent 
          ref={selectRef}
          tools={['setValue', 'addOption', 'removeOption']}
          placeholder="请选择选项"
          options={[
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' },
            { label: '选项3', value: 'option3' }
          ]}
          
        />
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>智能表格组件</h3>
        <TableComponent 
          ref={tableRef}
          tools={['addRow', 'removeRow', 'setData', 'clearData']}
          columns={[
            { title: '姓名', dataIndex: 'name', key: 'name' },
            { title: '年龄', dataIndex: 'age', key: 'age' },
            { title: '工作', dataIndex: 'job', key: 'job' }
          ]}
          dataSource={[
            { key: '1', name: '张三', age: 25, job: '工程师' },
            { key: '2', name: '李四', age: 30, job: '设计师' }
          ]}
        />
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>智能复选框组件</h3>
        <CheckboxComponent 
          ref={checkboxRef}
          tools={['selectAll', 'clearAll', 'setValues', 'addOption']}
          isGroup={true}
          options={[
            { label: '苹果', value: 'apple' },
            { label: '香蕉', value: 'banana' },
            { label: '橙子', value: 'orange' }
          ]}
        />
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #d9d9d9', padding: '10px', backgroundColor: '#f9f9f9' }}>
        <h3>AI 指令输入</h3>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入AI指令，例如：填写用户名为张三，年龄25 / 选择第一个选项 / 添加一行数据 / 全选复选框"
          rows={4}
          style={{ marginBottom: '10px' }}
        />
        <Button type="primary" onClick={handleSubmit}>
          执行AI指令
        </Button>
      </div>

      <div style={{ marginTop: '20px', color: '#666' }}>
        <p><strong>🤖 全自动化Smart Components系统:</strong></p>
        <ul>
          <li>✨ 组件完全自动注册 - 无需手动配置</li>
          <li>🎯 AI自动理解和执行指令</li>
          <li>🚀 零代码AI操作 - 纯声明式</li>
          <li>💡 试试这些指令：</li>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>表单操作：</strong>"填写用户名为张三"、"设置邮箱为test@example.com"、"提交表单"</li>
            <li><strong>选择器操作：</strong>"选择第一个选项"、"清空选择"、"添加新选项"</li>
            <li><strong>表格操作：</strong>"添加一行数据"、"删除第一行"、"清空表格"</li>
            <li><strong>复选框操作：</strong>"全选复选框"、"清空所有选择"、"选择苹果和香蕉"</li>
          </ul>
        </ul>
      </div>
    </div>
  );
}

export default App;
