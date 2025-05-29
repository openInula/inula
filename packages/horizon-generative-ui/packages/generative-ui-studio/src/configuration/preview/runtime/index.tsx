import { useRef, useEffect, useState } from 'react';
import { PreviewWrapper as Preview } from '..';
import { useIframeMessenger } from '../../../utils/iframe-messager/useIframeMessenger';
import { IFRAME_CONFIG, validateIframeConfig, logConfig } from './iframe-config';
import { logEnvConfig } from '../../../utils/env-config';
import { useContext } from 'use-context-selector';
import ConfigContext from '@/context/debug-configuration';

export const Runtime = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [configValidation, setConfigValidation] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  const { promptConfig } = useContext(ConfigContext);

  // 使用自定义Hook管理iframe通信
  const {
    isIframeLoaded,
    isMessengerReady,
    error,
    handleIframeLoad,
    handleIframeError,
    sendUserQuestion,
    sendHistoryReplay,
    clearError,
  } = useIframeMessenger(iframeRef);

  // 在组件加载时进行配置验证和日志记录
  useEffect(() => {
    // 打印环境配置
    logEnvConfig();
    // 打印iframe配置
    logConfig();

    // 验证配置
    const validation = validateIframeConfig();
    setConfigValidation(validation);

    if (!validation.isValid) {
      console.error('Configuration validation failed:', validation.errors);
    }
  }, []);

  const handleMsgSubmit = (msg: string) => {
    const success = sendUserQuestion(msg, promptConfig.userData);
  };

  const handleCheckTopo = (msg: string, answer: string) => {
    const success = sendHistoryReplay(msg, answer, promptConfig.userData);
  };

  // 示例：发送测试消息的方法
  const sendTestMessage = () => {
    const success = sendUserQuestion('这是一个测试问题', {
      source: 'Runtime.tsx',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    if (success) {
      console.log('✅ Test message sent successfully');
    } else {
      console.error('❌ Failed to send test message');
    }
  };

  // 示例：发送历史回放消息
  const sendTestHistoryReplay = () => {
    const success = sendHistoryReplay(
      '之前的问题是什么？',
      '这是之前问题的答案，包含了详细的解释和示例。',
      {
        source: 'Runtime.tsx',
        timestamp: new Date().toISOString(),
        conversationId: 'test-conversation-' + Date.now(),
      },
    );

    if (success) {
      console.log('✅ History replay sent successfully');
    } else {
      console.error('❌ Failed to send history replay');
    }
  };

  // 调试信息打印
  const printDebugInfo = () => {
    console.group('🔍 Runtime Debug Info');
    console.log('Iframe loaded:', isIframeLoaded);
    console.log('Messenger ready:', isMessengerReady);
    console.log('Error:', error);
    console.log('Iframe element:', iframeRef.current);
    console.log('Config validation:', configValidation);
    console.groupEnd();
  };

  // 如果配置验证失败，显示错误信息
  if (configValidation && !configValidation.isValid) {
    return (
      <div className="flex grow flex-col h-full items-center justify-center">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-2xl">
          <h3 className="text-lg font-medium text-red-800 mb-4">Configuration Error</h3>
          <div className="text-left">
            <p className="text-red-600 mb-4">
              The iframe configuration is invalid. Please fix the following issues:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-600 mb-4">
              {configValidation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded">
              <strong>Current URL:</strong> {IFRAME_CONFIG.URL}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col h-full items-center">
      <div className="flex w-full h-full">
        {/* 新增的iframe区域 */}
        <div className="flex-1 border-t border-gray-200">
          <div className="h-full flex flex-col">
            {/* iframe容器 */}
            <iframe
              ref={iframeRef}
              src={IFRAME_CONFIG.URL}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              className="w-full flex-1 border-0"
              title="External Content"
              sandbox={IFRAME_CONFIG.SANDBOX_PERMISSIONS.join(' ')}
              allow={IFRAME_CONFIG.ALLOW_FEATURES.join('; ')}
            />
          </div>
        </div>

        {/* 原有的Preview组件 */}
        <div className="w-[800px]">
          <Preview
            className="w-full h-full"
            onMsgSubmit={handleMsgSubmit}
            oncheckTopo={handleCheckTopo}
          />
        </div>
      </div>
    </div>
  );
};
