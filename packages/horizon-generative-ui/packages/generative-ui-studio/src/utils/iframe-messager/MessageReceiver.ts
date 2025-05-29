import { 
  MessageType, 
  UserQuestionMessage, 
  HistoryReplayMessage, 
  IFrameMessage 
} from './types';

/**
 * 消息接收器 - 负责接收和处理来自其他窗口的消息
 */
export class MessageReceiver {
  private handlers: Map<MessageType, ((message: any) => void)[]> = new Map();
  private boundHandleMessage: (event: MessageEvent) => void;

  /**
   * 创建一个新的消息接收器并自动初始化
   */
  constructor() {
    this.boundHandleMessage = this.handleMessage.bind(this);
    this.initialize();
  }

  /**
   * 初始化消息监听
   * @private
   */
  private initialize(): void {
    window.addEventListener('message', this.boundHandleMessage, false);
    console.log('Message receiver initialized');
  }

  /**
   * 处理接收到的消息
   * @param event 消息事件
   * @private
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = event.data as IFrameMessage;
      
      // 验证消息格式
      if (!message || !message.type) {
        console.warn('Received invalid message format:', event.data);
        return;
      }

      // 获取对应消息类型的处理函数并执行
      const handlers = this.handlers.get(message.type) || [];
      handlers.forEach(handler => handler(message));
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * 注册用户问题消息处理器
   * @param handler 处理函数
   * @returns 取消订阅函数
   */
  onUserQuestion(handler: (message: UserQuestionMessage) => void): () => void {
    return this.addHandler(MessageType.USER_QUESTION, handler);
  }

  /**
   * 注册历史回放消息处理器
   * @param handler 处理函数
   * @returns 取消订阅函数
   */
  onHistoryReplay(handler: (message: HistoryReplayMessage) => void): () => void {
    return this.addHandler(MessageType.HISTORY_REPLAY, handler);
  }

  /**
   * 通用添加处理器方法
   * @param type 消息类型
   * @param handler 处理函数
   * @returns 取消订阅函数
   * @private
   */
  private addHandler<T>(type: MessageType, handler: (message: T) => void): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    
    const handlers = this.handlers.get(type)!;
    handlers.push(handler as any);
    
    // 返回一个取消订阅的函数
    return () => {
      const index = handlers.indexOf(handler as any);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * 清理所有监听器，应在组件卸载时调用
   */
  destroy(): void {
    window.removeEventListener('message', this.boundHandleMessage);
    this.handlers.clear();
    console.log('Message receiver destroyed');
  }
}
