import React, { useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { useContext } from 'use-context-selector';
import { Sender, Bubble, Welcome, PromptProps, PromptsProps } from '@ant-design/x';
import { Button, Drawer, Flex, Space } from 'antd';
import {
  CoffeeOutlined,
  CopyOutlined,
  EyeOutlined,
  FireOutlined,
  SmileOutlined,
  SyncOutlined,
  UserOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useDSLRender } from './dslRender';
import { LLMClient, dslSystemPrompt } from 'generative-ui-core';
import { repairJson } from './complete-json';
import JsonViewer from '../../components/JsonViewer';
import ConfigContext from '@/context/debug-configuration';
import { convertActionsToPrompt } from '../config/prompt/actions';
import Prompts from './template-questions';
import produce from 'immer';
import { AgentConfig, TemplateQuestion } from '@/models/debug';
import { useCreateConversation, useSaveConversationHistory } from '@/service/conversations';
import { useParams } from 'react-router-dom';
import TestSetModal from './add-testset-modal';
import { useCreateTestCase } from '@/service/test-sets';
import { useToastContext } from '@/components/base/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEventCallback } from '@/hooks/use-event-callback';
import { RiRobot2Line } from '@remixicon/react';
import { NetworkIcon } from 'lucide-react';
import { envConfig } from '@/utils/env-config';
import DataPreview from './data-preview';

// 从环境变量获取 API 密钥
const apiKey = envConfig.LLM_TOKEN;
if (!apiKey) {
  throw new Error('请设置 DEEPSEEK_API_KEY 环境变量');
}

// 创建客户端实例
const deepSeek = new LLMClient(apiKey);

/**
 * Extracts a JSON string from markdown code blocks
 * @param markdownText - The markdown text containing JSON in code blocks
 * @returns The extracted JSON string
 */
function extractJsonFromMarkdown(markdownText: string): string {
  // Pattern to match JSON code blocks (```json ... ```)
  const jsonCodeBlockPattern = /```json\s*([\s\S]*?)\s*```/;

  // Try to find a match
  const match = markdownText.match(jsonCodeBlockPattern);

  // If found, return the content of the code block
  if (match && match[1]) {
    return match[1].trim();
  }

  // If not found, check for any code block
  const anyCodeBlockPattern = /```\s*([\s\S]*?)\s*```/;
  const anyMatch = markdownText.match(anyCodeBlockPattern);

  if (anyMatch && anyMatch[1]) {
    return anyMatch[1].trim();
  }

  // If still not found, return the original text (might not be in a code block)
  return markdownText.trim();
}

interface PreviewProps {
  messages: any[]; // Receiving messages from parent
  setMessages: (message: any) => void; // Callback to update messages in parent
  onMsgSubmit?: (message: any) => void;
  oncheckTopo?: (message: any, answer: any) => void;
}

export const Preview: React.FC<PreviewProps> = ({
  messages,
  setMessages,
  onMsgSubmit,
  oncheckTopo,
}) => {
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>();
  const abortControllerRef = useRef(new AbortController());
  const [messageIndexToAddInTestset, setMessageIndexToAddInTestset] = useState(-1);

  const ctx = useContext(ConfigContext);
  const { promptConfig: modelConfig } = ctx;

  const systemPrompt = `${dslSystemPrompt}

  ${modelConfig.promptTemplate}

  # UI中使用的数据
  ${modelConfig.userData}

  # 详细的API定义，采用swagger格式
  ${modelConfig.promptQueries}

  # UI中可以使用的交互动作
  ${convertActionsToPrompt(modelConfig.uiActions)}
  `;
  const [open, setOpen] = useState(false);
  const [dslContentInDrawer, setDslContentInDrawer] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showTestSetModal, setShowTestSetModal] = useState(false);
  const [previewDataOpen, setPreviewDataOpen] = useState(false);
  const [previewDataIndexInDrawer, setPreviewDataIndexInDrawer] = useState<number>(-1);

  const createConversationMutation = useCreateConversation();
  const createTestCaseMutation = useCreateTestCase();
  const { notify } = useToastContext();
  const queryClient = useQueryClient();

  // 保存会话历史mutation
  const saveHistoryMutation = useSaveConversationHistory();
  const { id: agentId } = useParams();

  const showDrawer = (content: string) => {
    setDslContentInDrawer(content);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const [_, startTransition] = useTransition();

  useEffect(() => {
    window.Prel.start('receiverModule', '1.0.0', [], (socket) => {
      const context = {};

      socket.attach(context, {
        DSLConversation: (data) => {
          onSubmit(data.param);
        },
      });
    });
  }, []);

  const isScrollingRef = useRef(false);
  const timeoutRef = useRef(null);

  useLayoutEffect(() => {
    // 如果已经在执行滚动操作，跳过
    if (isScrollingRef.current) return;

    const container = chatContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;

    // 清除任何现有的超时
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 使用requestAnimationFrame确保在正确的时机滚动
    requestAnimationFrame(() => {
      const lastChild = container.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
      }

      // 设置一个短暂的锁定期，防止连续多次滚动
      timeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    });
  }, [messages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  };
  const onSubmit = useEventCallback(async (msg: string) => {
    onMsgSubmit?.(msg);
    const currentChats = messages.concat({
      role: 'user',
      content: msg,
    });
    setMessages(
      currentChats.concat([
        // 为了展示加载效果
        {
          role: 'assistant',
          loading: true,
        },
      ]),
    );

    setValue('');
    setLoading(true);
    scrollToBottom();

    let lastUpdateTime = Date.now();

    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const newConversation = await createConversationMutation.mutateAsync({
          agentId: Number(agentId!),
          title: msg,
        });
        setConversationId(newConversation.id);
        currentConversationId = newConversation.id;
      }
      const completion = await deepSeek.createStreamingCompletion(
        {
          messages: [{ role: 'system', content: systemPrompt }, ...currentChats],
          max_tokens: 5000,
          temperature: 0.7,
        },
        (chunk) =>
          startTransition(() => {
            const now = Date.now();
            if (now - lastUpdateTime >= 1000) {
              lastUpdateTime = now;

              setMessages((msgs) =>
                msgs.slice(0, -1).concat({
                  role: 'assistant',
                  streaming: true,
                  content: repairJson(chunk),
                }),
              );
            }
          }),
        {
          signal: abortControllerRef.current.signal,
        },
      );

      const dsl = extractJsonFromMarkdown(completion);
      const finalMsgs = currentChats.concat({
        role: 'assistant',
        content: dsl,
      });
      setMessages(finalMsgs);

      saveHistoryMutation.mutate({
        conversationId: currentConversationId,
        messages: finalMsgs,
      });
      scrollToBottom();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  function checkTopo(idx: number): void {
    oncheckTopo?.(messages[idx - 1]?.content, messages[idx]?.content);
  }

  function checkData(idx: number): void {
    setPreviewDataOpen(true);
    setPreviewDataIndexInDrawer(Math.floor(idx / 2));
  }
  const renderDsl = useDSLRender();

  const onPromptTplItemClick = ({ content }) => {
    onSubmit(content);
  };

  const handleTestSetModalClose = () => {
    setMessageIndexToAddInTestset(-1);
    setShowTestSetModal(false);
  };

  const handleTestsetModalShow = (index: number) => {
    setShowTestSetModal(true);
    setMessageIndexToAddInTestset(index);
  };

  const handleMsgToJoinTestset = (testSetId: string) => {
    if (messageIndexToAddInTestset !== -1) {
      const expectedResult = messages[messageIndexToAddInTestset].content;
      const prompt = messages[messageIndexToAddInTestset - 1].content;
      // 如果提供了测试用例数据，创建测试用例
      if (prompt && expectedResult) {
        createTestCaseMutation.mutate(
          {
            prompt: prompt,
            expectedResult: expectedResult,
            testSetId,
          },
          {
            onSuccess: () => {
              notify({ type: 'success', message: '测试用例添加成功' });
              // 强制刷新当前测试集的数据
              queryClient.invalidateQueries({ queryKey: ['testSet', testSetId] });
            },
            onError: (error) => {
              notify({
                type: 'error',
                message: '添加测试用例失败：' + (error?.message || '未知错误'),
              });
            },
          },
        );
      } else {
        notify({
          type: 'error',
          message: '问题或者预期答案内容为空',
        });
      }
    } else {
      notify({ type: 'warning', message: '请选择一个测试集' });
    }
  };

  const ChatBubbles = (
    <Flex vertical gap="middle">
      <Bubble.List
        style={{ maxHeight: '70vh' }}
        items={messages.map((msg, idx) =>
          msg.role === 'user'
            ? {
                variant: 'outlined',
                classNames: { content: 'bg-white' },
                key: typeof msg === 'string' ? msg.slice(15) : idx,
                placement: 'end',
                content: msg.content,
                avatar: { icon: <UserOutlined /> },
                header: 'You',
              }
            : {
                variant: 'outlined',
                classNames: { content: 'bg-white' },
                key: typeof msg === 'string' ? msg.slice(15) : idx,
                loading: msg.loading,
                content: msg.content,
                messageRender: (content) => renderDsl(content, idx, msg.streaming),
                avatar: { icon: <RiRobot2Line /> },
                header: '意图UI',
                footer: (
                  <Space size={8}>
                    <Button color="default" variant="text" size="small" icon={<SyncOutlined />} />
                    <Button color="default" variant="text" size="small" icon={<CopyOutlined />} />
                    <Button
                      color="default"
                      variant="text"
                      size="small"
                      title="查看使用的DSL数据"
                      icon={<EyeOutlined />}
                      onClick={() => showDrawer(msg.content)}
                    ></Button>
                    <Button
                      color="default"
                      variant="text"
                      size="small"
                      title="添加到评测集"
                      icon={<AppstoreAddOutlined />}
                      onClick={() => handleTestsetModalShow(idx)}
                    ></Button>
                    <Button
                      color="default"
                      variant="text"
                      size="small"
                      title="查看topo"
                      icon={<NetworkIcon className="w-[1em] h-[1em]" />}
                      onClick={() => checkTopo(idx)}
                    ></Button>
                    <Button
                      color="default"
                      variant="text"
                      size="small"
                      title="查看数据"
                      icon={<DatabaseOutlined />}
                      onClick={() => checkData(idx)}
                    ></Button>
                  </Space>
                ),
              },
        )}
      />
    </Flex>
  );

  return (
    <div className="flex flex-col h-full px-8 pt-4">
      <div className="flex-1 overflow-auto scroll-smooth" ref={chatContainerRef}>
        {messages.length ? ChatBubbles : <WelcomeBlock onItemClick={onPromptTplItemClick} />}
      </div>

      <div className="mx-2 my-2 flex gap-2">
        <Button className="h-full" onClick={() => setMessages([])}>
          <DeleteOutlined />
        </Button>
        <Sender
          loading={loading}
          value={value}
          onChange={(v) => {
            setValue(v);
          }}
          onSubmit={(v) => onSubmit(v)}
          onCancel={() => {
            abortControllerRef.current.abort();
            setMessages((msg) => msg.slice(0, -1));
            setLoading(false);
          }}
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      </div>
      <Drawer title="UI使用的DSL" placement="right" onClose={onClose} open={open} width={800}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <p>
            <JsonViewer data={dslContentInDrawer} readOnly={true} height="100%" />
          </p>
        </Space>
      </Drawer>
      <DataPreview
        open={previewDataOpen}
        onClose={() => setPreviewDataOpen(false)}
        index={previewDataIndexInDrawer} // 第一步骤
        promptData={modelConfig.userData}
        prompt={modelConfig.promptTemplate}
      />
      <TestSetModal
        isShow={showTestSetModal}
        onClose={handleTestSetModalClose}
        onSelectTestSet={handleMsgToJoinTestset}
      />
    </div>
  );
};

const promptTemplates: PromptsProps['items'] = [
  {
    key: '6',
    icon: <CoffeeOutlined style={{ color: '#964B00' }} />,
    content: '查看当前网元告警',
    disabled: false,
  },
  {
    key: '7',
    icon: <SmileOutlined style={{ color: '#FAAD14' }} />,
    content: '过去一个月的设备告警情况',
    disabled: false,
  },
  {
    key: '8',
    icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
    content: '昨晚网络延迟为何突然增加？',
    disabled: false,
  },
];

function WelcomeBlock({ onItemClick }: { onItemClick: (info: { data: PromptProps }) => void }) {
  const ctx = useContext(ConfigContext);
  const { promptConfig, setPromptConfig } = ctx;

  const handlePromptChange = (questions: TemplateQuestion[]) => {
    const newModelConfig = produce(promptConfig, (draft: AgentConfig) => {
      draft.templateQuestions = questions;
    });

    setPromptConfig(newModelConfig);
  };

  return (
    <div className="h-full flex justify-center items-center flex-col">
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="你好，我是 生成式UI Bot"
        description="基于公开DSL规范，使用AI大模型，根据用户意图自动生成页面"
      />
      <Prompts
        className="mt-8"
        title="🤔 你或许想问:"
        items={promptConfig.templateQuestions ?? promptTemplates}
        onItemClick={onItemClick}
        onChange={handlePromptChange}
      />
    </div>
  );
}
