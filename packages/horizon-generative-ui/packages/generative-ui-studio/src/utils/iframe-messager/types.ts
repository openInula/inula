// 定义通信的消息类型
export enum MessageType {
  USER_QUESTION = 'USER_QUESTION',
  HISTORY_REPLAY = 'HISTORY_REPLAY',
}

// 定义基础消息接口
export interface BaseMessage {
  type: MessageType;
  timestamp: number;
}

// 用户问题消息
export interface UserQuestionMessage extends BaseMessage {
  type: MessageType.USER_QUESTION;
  question: string;
  relatedData?: any; // 问题相关数据
}

// 历史回放消息
export interface HistoryReplayMessage extends BaseMessage {
  type: MessageType.HISTORY_REPLAY;
  history: {
    question: string;
    answer: string;
    relatedData?: any;
  };
}

// 联合类型，表示所有可能的消息类型
export type IFrameMessage = UserQuestionMessage | HistoryReplayMessage;
