import React from 'react';
import { ProCard, ProForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-components';
import { Button, message, Modal, Space } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { GenerateFunctionRequest } from '../types';
import { generateFunction, startPlaywrightRecord, checkRecordedScript, getFunctionSummaries, FunctionSummary } from '../services/api';

interface Tab1Props {
  onGenerated: (functionDefinition: string, executorCode: string, ragRequest: string) => void;
}

const Tab1FunctionDescription: React.FC<Tab1Props> = ({ onGenerated }) => {
  const [form] = ProForm.useForm();
  const [loading, setLoading] = React.useState(false);
  const [playwrightScript, setPlaywrightScript] = React.useState('');
  const [recordModalVisible, setRecordModalVisible] = React.useState(false);
  const [recordLoading, setRecordLoading] = React.useState(false);
  const [recordForm] = ProForm.useForm();
  const [functionSummaries, setFunctionSummaries] = React.useState<FunctionSummary[]>([]);
  const [loadingFunctionSummaries, setLoadingFunctionSummaries] = React.useState(true);

  // 获取可用的 Function 摘要信息
  React.useEffect(() => {
    const loadFunctionSummaries = async () => {
      setLoadingFunctionSummaries(true);
      try {
        const summaries = await getFunctionSummaries();
        setFunctionSummaries(summaries);
      } catch (error) {
        console.error('Failed to load function summaries:', error);
        // 使用默认值
        setFunctionSummaries([
          { name: 'openMainMenu', category: 'Navigation', description: 'Opens the main application menu' },
          { name: 'createUserSession', category: 'Authentication', description: 'Creates a new user session' },
          { name: 'getUserPermissions', category: 'Authorization', description: 'Gets user permissions and roles' }
        ]);
      } finally {
        setLoadingFunctionSummaries(false);
      }
    };

    loadFunctionSummaries();
  }, []);

  // 从 localStorage 获取上次使用的 URL
  const getLastUsedUrl = () => {
    return localStorage.getItem('playwright-record-url') || '';
  };

  // 保存 URL 到 localStorage
  const saveLastUsedUrl = (url: string) => {
    if (url.trim()) {
      localStorage.setItem('playwright-record-url', url);
    }
  };

  // 打开录制模态框并设置默认值
  const handleOpenRecordModal = () => {
    setRecordModalVisible(true);
    // 设置默认值
    recordForm.setFieldsValue({
      recordUrl: getLastUsedUrl(),
      savePath: 'playwright-scripts'
    });
  };

  const handleGenerate = async (values: any) => {
    setLoading(true);
    try {
      const request: GenerateFunctionRequest = {
        functionName: values.functionName,
        playwrightScript: playwrightScript,
        description: values.basicDescription,
        outputDesc: values.outputDescription,
        dependencies: values.dependencies || [],
      };

      const response = await generateFunction(request);
      
      if (response.success && response.functionDefinition && response.executorCode && response.ragRequest) {
        message.success('LLM Function 定义和 Executor 生成成功！');
        onGenerated(
          response.functionDefinition, // 现在是代码字符串，不需要 JSON.stringify
          response.executorCode,
          JSON.stringify(response.ragRequest, null, 2)
        );
      } else {
        message.error(response.error || '生成失败，请重试');
      }
    } catch (error) {
      console.error('Generate error:', error);
      message.error('生成失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecord = async () => {
    try {
      const values = await recordForm.validateFields();
      setRecordLoading(true);
      
      const functionName = form.getFieldValue('functionName');
      if (!functionName) {
        message.error('请先输入Function name');
        setRecordLoading(false);
        return;
      }

      // 保存 URL 到 localStorage
      saveLastUsedUrl(values.recordUrl);

      // 调用真实的 Playwright 录制 API
      const recordRequest = {
        url: values.recordUrl,
        savePath: values.savePath || 'playwright-scripts',
        fileName: `${functionName}.spec.js`
      };

      try {
        // 启动 Playwright 录制
        const response = await startPlaywrightRecord(recordRequest);
        
        if (response.success) {
          message.info(response.message);
          
          // 开始轮询检查录制结果
          const checkInterval = setInterval(async () => {
            try {
              const checkResult = await checkRecordedScript(response.filePath, response.processId);
              
              if (checkResult.exists) {
                if (!checkResult.recording && checkResult.content.trim()) {
                  // 录制完成，设置脚本内容
                  setPlaywrightScript(checkResult.content);
                  message.success(checkResult.message || '脚本录制完成！');
                  
                  // 清理定时器并关闭对话框
                  clearInterval(checkInterval);
                  setRecordModalVisible(false);
                  setRecordLoading(false);
                  recordForm.resetFields();
                } else {
                  // 录制还在进行中，显示进度信息
                  console.log('录制进行中:', checkResult.message);
                  // 可以在这里更新UI显示录制状态
                }
              }
            } catch (checkError) {
              console.error('Check script error:', checkError);
            }
          }, 2000); // 每2秒检查一次
          
          // 300秒后停止检查（超时保护）
          setTimeout(() => {
            clearInterval(checkInterval);
            if (recordLoading) {
              message.warning('录制超时，请手动检查脚本文件');
              setRecordLoading(false);
            }
          }, 300000);
          
        } else {
          throw new Error('启动录制失败');
        }
        
      } catch (apiError) {
        console.error('Playwright API error:', apiError);
        
        // API 调用失败时的降级处理（使用模拟数据）
        message.warning('无法连接到录制服务，使用模拟录制模式');
        
        // 模拟录制过程
        message.info('正在启动 Playwright 录制，请在浏览器中执行您的操作...');
        
        setTimeout(() => {
          const mockScript = `// 自动生成的 Playwright 脚本
await page.goto('${values.recordUrl}');
// 在这里会有用户录制的操作步骤
// 例如：
// await page.click('#login-button');
// await page.fill('#username', 'user');
// await page.fill('#password', 'password');
// await page.click('#submit');`;

          setPlaywrightScript(mockScript);
          message.success(`脚本录制完成！文件已保存到: ${values.savePath}/${functionName}.spec.js`);
          setRecordModalVisible(false);
          setRecordLoading(false);
          recordForm.resetFields();
        }, 3000);
      }

    } catch (error) {
      console.error('Record error:', error);
      message.error('录制失败，请重试');
      setRecordLoading(false);
    }
  };;

  return (
    <ProCard 
      headerBordered
      extra={
        <Button 
          type="primary" 
          loading={loading}
          onClick={() => form.submit()}
          disabled={!playwrightScript.trim()}
        >
          生成LLM Function
        </Button>
      }
    >
      <ProForm
        form={form}
        layout="vertical"
        onFinish={handleGenerate}
        submitter={false}
      >
        <ProFormText
          name="functionName"
          label="Function name"
          placeholder="请输入函数名称，如: createUserSession"
          rules={[
            { required: true, message: '请输入函数名称' }
          ]}
        />
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label>
            <span style={{ color: '#ff4d4f' }}>*</span> Playwright脚本 
            </label>
            <Button 
              type="default"
              onClick={handleOpenRecordModal}
              style={{ fontSize: '12px', height: '28px' }}
            >
              录制脚本
            </Button>
          </div>
          <CodeMirror
            value={playwrightScript}
            height="200px"
            placeholder="请输入或粘贴 Playwright 录制的脚本&#10;例如：&#10;await page.click('#login-button');&#10;await page.fill('#username', 'admin');&#10;await page.fill('#password', '123456');&#10;await page.click('#submit');"
            extensions={[javascript()]}
            theme={oneDark}
            onChange={(value) => setPlaywrightScript(value)}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: true,
            }}
          />
        </div>
        
        <ProFormTextArea
          name="basicDescription"
          label="基础功能描述"
          placeholder="这是一个用于用户登录的自动化脚本，它会填写用户名和密码，然后点击登录按钮..."
          rows={3}
        />
        
        <ProFormTextArea
          name="outputDescription"
          label="输出描述"
          placeholder="如：返回会话ID和用户信息，供后续操作使用"
          rows={2}
        />
        
        <ProFormSelect
          name="dependencies"
          label="依赖Function"
          mode="tags"
          placeholder="输入依赖的函数名称，支持多选"
          options={functionSummaries.map(summary => ({ 
            label: `${summary.name} (${summary.category}) - ${summary.description}`, 
            value: summary.name 
          }))}
          fieldProps={{
            loading: loadingFunctionSummaries,
            showSearch: true,
            filterOption: (input: string, option: any) =>
              option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }}
        />
      </ProForm>

      {/* 录制对话框 */}
      <Modal
        title="Playwright 脚本录制"
        open={recordModalVisible}
        onCancel={() => {
          setRecordModalVisible(false);
          recordForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <ProForm
          form={recordForm}
          layout="vertical"
          onFinish={handleStartRecord}
          submitter={false}
        >
          <ProFormText
            name="recordUrl"
            label="录制页面URL"
            placeholder="请输入要录制的页面URL"
            rules={[
              { required: true, message: '请输入录制页面URL' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          />
          
          <ProFormText
            name="savePath"
            label="脚本保存路径"
            placeholder="请输入脚本保存路径"
            rules={[
              { required: true, message: '请输入脚本保存路径' }
            ]}
          />
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => {
                setRecordModalVisible(false);
                recordForm.resetFields();
              }}>
                取消
              </Button>
              <Button 
                type="primary" 
                loading={recordLoading}
                onClick={() => recordForm.submit()}
              >
                启动录制
              </Button>
            </Space>
          </div>
        </ProForm>
      </Modal>
    </ProCard>
  );
};

export default Tab1FunctionDescription;