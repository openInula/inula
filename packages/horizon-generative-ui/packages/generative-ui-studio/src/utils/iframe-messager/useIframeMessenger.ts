import { useRef, useEffect, useState, useCallback } from 'react';
import { MessageSender } from './MessageSender';
import { IFRAME_CONFIG, getIframeOrigin } from '../../configuration/preview/runtime/iframe-config';

/**
 * 自定义Hook用于管理iframe通信
 */
export const useIframeMessenger = (iframeRef: React.RefObject<HTMLIFrameElement>) => {
  const messageSenderRef = useRef<MessageSender | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isMessengerReady, setIsMessengerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化消息发送器
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow && isIframeLoaded) {
      try {
        const targetOrigin = getIframeOrigin();
        messageSenderRef.current = new MessageSender(
          iframe.contentWindow,
          targetOrigin
        );
        setIsMessengerReady(true);
        setError(null);
        console.log('MessageSender initialized for iframe:', IFRAME_CONFIG.URL);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to initialize MessageSender:', error);
        setError(errorMessage);
        setIsMessengerReady(false);
      }
    }
  }, [isIframeLoaded, iframeRef]);

  // iframe加载完成处理
  const handleIframeLoad = useCallback(() => {
    setIsIframeLoaded(true);
    console.log('Iframe loaded successfully');
  }, []);

  // iframe加载错误处理
  const handleIframeError = useCallback(() => {
    setError('Failed to load iframe content');
    console.error('Iframe failed to load');
  }, []);

  // 发送用户问题
  const sendUserQuestion = useCallback((question: string, relatedData?: any) => {
    if (messageSenderRef.current && isMessengerReady) {
      try {
        messageSenderRef.current.sendUserQuestion(question, relatedData);
        return true;
      } catch (error) {
        console.error('Failed to send user question:', error);
        return false;
      }
    } else {
      console.warn('MessageSender not ready yet');
      return false;
    }
  }, [isMessengerReady]);

  // 发送历史回放
  const sendHistoryReplay = useCallback((question: string, answer: string, relatedData?: any) => {
    if (messageSenderRef.current && isMessengerReady) {
      try {
        messageSenderRef.current.sendHistoryReplay(question, answer, relatedData);
        return true;
      } catch (error) {
        console.error('Failed to send history replay:', error);
        return false;
      }
    } else {
      console.warn('MessageSender not ready yet');
      return false;
    }
  }, [isMessengerReady]);

  // 重置错误状态
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isIframeLoaded,
    isMessengerReady,
    error,
    handleIframeLoad,
    handleIframeError,
    sendUserQuestion,
    sendHistoryReplay,
    clearError,
  };
};
