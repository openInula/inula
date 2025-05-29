import { Button, Drawer, Flex, Space, Typography, Divider, Collapse } from 'antd';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import JsonViewer from '../../components/JsonViewer';
import promptData from './data.json?raw';
const { Title, Text } = Typography;
const { Panel } = Collapse;

interface DataPreviewProps {
  open: boolean;
  onClose: () => void;
  index?: number;
  promptData?: string;
  prompt?: string;
}

// 数据URL配置
export const dataUrl = [
  // 第一步骤：显示柳堡掉站情况
  ['/api/tunnel/pending-tasks', '/api/station/topology-alarms'],

  // 第二步骤：开始诊断
  ['/api/station/diagnosis-chain', '/api/topology'],

  // 第三步骤：通信链路分析
  ['/api/station/path-loss-analysis', '/api/topology'],

  // 第四步骤：故障路径和备用路径
  ['/api/tunnel/backup-status', '/api/topology'],

  // 第五步骤：输入人来确定执行修复方案
  [
    '/api/tunnel/create-repair-order',
    '/api/tunnel/switch-backup',
    '/api/tunnel/repair-result',
    '/api/topology',
  ],
];

const DataPreview = ({ open, onClose, index, prompt }: DataPreviewProps) => {
  // 解析promptData
  const parsePromptData = () => {
    if (!promptData) return [];
    try {
      return JSON.parse(promptData);
    } catch (error) {
      console.error('解析promptData失败:', error);
      return [];
    }
  };

  // 根据index获取对应的URLs
  const getCurrentUrls = () => {
    if (index === undefined || index < 0 || index >= dataUrl.length) {
      return [];
    }
    return dataUrl[index];
  };

  // 解析prompt，获取系统提示词和当前场景的prompt
  const parsePrompt = () => {
    if (!prompt) return { systemPrompt: '', currentScenePrompt: '' };

    const parts = prompt
      .split('---')
      .map((part) => part.trim())
      .filter((part) => part);

    if (parts.length === 0) {
      return { systemPrompt: '', currentScenePrompt: '' };
    }

    // 第一段是系统提示词
    const systemPrompt = parts[0] || '';

    // 从第二段开始是各场景的prompt
    const scenePrompts = parts.slice(1);

    // 根据index获取当前场景的prompt
    const currentScenePrompt =
      index !== undefined && index >= 0 && index < scenePrompts.length ? scenePrompts[index] : '';

    return { systemPrompt, currentScenePrompt };
  };

  // 根据URL匹配数据
  const getMatchedData = () => {
    const parsedData = parsePromptData();
    const currentUrls = getCurrentUrls();

    if (!parsedData.length || !currentUrls.length) {
      return [];
    }

    return currentUrls.map((url) => {
      const matchedItem = parsedData.find((item) => item.url === url);
      return {
        url,
        data: matchedItem ? matchedItem.data : null,
        matched: !!matchedItem,
      };
    });
  };

  const matchedData = getMatchedData();
  const currentUrls = getCurrentUrls();
  const { systemPrompt, currentScenePrompt } = parsePrompt();

  return (
    <Drawer
      title={`数据预览 - 步骤 ${index !== undefined ? index + 1 : '未知'}`}
      placement="right"
      onClose={onClose}
      open={open}
      width={1000}
    >
      <div className="w-full space-y-6">
        {/* 显示当前场景的prompt */}
        {currentScenePrompt && (
          <>
            <div>
              <Title level={4} className="mb-3">
                提示词
              </Title>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg max-h-48 overflow-y-auto">
                <Text className="whitespace-pre-wrap break-words">{currentScenePrompt}</Text>
              </div>
            </div>
            <Divider className="my-4" />
          </>
        )}

        {/* 显示匹配的数据 - 使用折叠面板 */}
        {matchedData.length > 0 ? (
          <div>
            <Title level={4} className="mb-3">
              接口数据
            </Title>
            <Collapse
              defaultActiveKey={matchedData.map((_, idx) => idx.toString())}
              className="bg-white"
            >
              {matchedData.map((item, idx) => (
                <Panel
                  key={idx}
                  header={
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{item.url}</span>
                      {item.matched ? (
                        <span className="text-green-600 text-sm ml-2">✓ 已匹配</span>
                      ) : (
                        <span className="text-orange-500 text-sm ml-2">⚠ 未找到数据</span>
                      )}
                    </div>
                  }
                >
                  {item.data ? (
                    <div className="mt-2">
                      <JsonViewer
                        data={item.data}
                        readOnly={true}
                        height="300px"
                        theme="light"
                        showLineNumbers={true}
                        foldable={true}
                      />
                    </div>
                  ) : (
                    <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <Text type="secondary">该URL暂无数据</Text>
                    </div>
                  )}
                </Panel>
              ))}
            </Collapse>
          </div>
        ) : (
          <div className="text-center py-10">
            <Text type="secondary">
              {index === undefined ? '请指定步骤索引' : '暂无匹配的数据'}
            </Text>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default DataPreview;
