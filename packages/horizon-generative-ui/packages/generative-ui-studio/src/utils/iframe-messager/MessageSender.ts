import { 
  MessageType, 
  UserQuestionMessage, 
  HistoryReplayMessage, 
  IFrameMessage 
} from './types';

/**
 * 消息发送器 - 负责向目标窗口发送消息
 */
export class MessageSender {
  private targetOrigin: string;
  private targetWindow: Window;

  /**
   * 创建一个新的消息发送器
   * @param targetWindow 目标窗口的引用（如iframe.contentWindow或window.parent）
   * @param targetOrigin 目标窗口的源（origin），生产环境中应设置为具体域名而非'*'
   */
  constructor(targetWindow: Window, targetOrigin: string = '*') {
    this.targetWindow = targetWindow;
    this.targetOrigin = targetOrigin;
  }

  /**
   * 发送用户问题
   * @param question 问题内容
   * @param relatedData 相关数据（可选）
   */
  sendUserQuestion(question: string, relatedData?: any): void {
    const message: UserQuestionMessage = {
      type: MessageType.USER_QUESTION,
      timestamp: Date.now(),
      question,
      relatedData,
    };

    this.sendMessage(message);
  }

  /**
   * 发送历史回放
   * @param question 历史问题
   * @param answer 历史回答
   * @param relatedData 相关数据（可选）
   */
  sendHistoryReplay(question: string, answer: string, relatedData?: any): void {
    const message: HistoryReplayMessage = {
      type: MessageType.HISTORY_REPLAY,
      timestamp: Date.now(),
      history: {
        question,
        answer,
        relatedData,
      },
    };

    this.sendMessage(message);
  }

  /**
   * 通用发送消息方法
   * @param message 要发送的消息对象
   * @private
   */
  private sendMessage(message: IFrameMessage): void {
    this.targetWindow.postMessage(message, this.targetOrigin);
    console.log(`Message sent:`, message);
  }
}
