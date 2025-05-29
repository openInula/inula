# IFrame 通信机制使用文档

## 概述

本文档描述了基于 `postMessage` API 的 iframe 通信机制，这套机制提供了类型安全、双向通信的能力，适用于父页面与嵌入的 iframe 之间的消息传递。通信机制支持两种主要场景：用户对话和历史回放。

## 安装

1. 将 `types.ts`、`MessageSender.ts`、`MessageReceiver.ts` 和 `index.ts` 文件复制到您的项目中
2. 确保您的项目支持 TypeScript

## 架构概览

通信机制由三个主要部分组成：

1. **类型定义** (`types.ts`): 定义所有消息类型和结构
2. **消息发送器** (`MessageSender.ts`): 负责构造和发送消息
3. **消息接收器** (`MessageReceiver.ts`): 负责接收和处理消息

所有组件都通过 `index.ts` 统一导出，方便使用。

## 消息类型

当前支持的消息类型包括：

1. **USER_QUESTION**: 用户问题消息，包含问题内容和相关数据
2. **HISTORY_REPLAY**: 历史回放消息，包含问题、回答和相关数据

## 基本使用方法

### 1. 在父页面中向 iframe 发送消息

```typescript
import { MessageSender } from './path/to/communication';

// 获取 iframe 元素
const iframe = document.getElementById('myIframe') as HTMLIFrameElement;

// 等待 iframe 加载完成
iframe.addEventListener('load', () => {
  if (iframe.contentWindow) {
    // 创建消息发送器，指向 iframe
    const sender = new MessageSender(iframe.contentWindow, 'https://iframe-domain.com');

    // 发送用户问题
    sender.sendUserQuestion('这是一个问题', { timestamp: Date.now() });

    // 发送历史回放
    sender.sendHistoryReplay('历史问题', '历史回答', { timestamp: Date.now() });
  }
});
```

### 2. 在 iframe 中接收消息

```typescript
import { MessageReceiver } from './path/to/communication';

// 创建消息接收器
const receiver = new MessageReceiver();

// 监听用户问题消息
receiver.onUserQuestion(message => {
  console.log('收到用户问题:', message.question);
  console.log('相关数据:', message.relatedData);

  // 处理消息...
  displayQuestion(message.question, message.relatedData);
});

// 监听历史回放消息
receiver.onHistoryReplay(message => {
  console.log('收到历史回放:', message.history);

  // 处理历史回放...
  displayHistoryReplay(message.history);
});

// 在组件卸载时清理
function cleanup() {
  receiver.destroy();
}
```

### 3. 从 iframe 向父页面发送消息

```typescript
import { MessageSender } from './path/to/communication';

// 创建消息发送器，指向父窗口
const sender = new MessageSender(window.parent, 'https://parent-domain.com');

// 发送用户问题给父页面
function sendQuestionToParent(question) {
  sender.sendUserQuestion(question, { source: 'iframe', timestamp: Date.now() });
}

// 发送历史回放请求给父页面
function requestHistoryReplay(historyId) {
  sender.sendHistoryReplay(
    `查看历史记录 #${historyId}`, 
    '', // 回答留空，由父页面填充
    { historyId }
  );
}
```

### 4. 在父页面中接收 iframe 发送的消息

```typescript
import { MessageReceiver } from './path/to/communication';

// 创建消息接收器
const receiver = new MessageReceiver();

// 监听来自 iframe 的用户问题
receiver.onUserQuestion(message => {
  console.log('iframe 发送的问题:', message.question);

  // 处理 iframe 发送的问题...
  processQuestionFromIframe(message.question, message.relatedData);
});

// 监听来自 iframe 的历史回放请求
receiver.onHistoryReplay(message => {
  console.log('iframe 请求历史回放:', message.history);

  // 处理历史回放请求...
  if (message.history.relatedData && message.history.relatedData.historyId) {
    const historyId = message.history.relatedData.historyId;
    fetchHistoryRecord(historyId).then(record => {
      // 发送完整历史记录回 iframe
      sender.sendHistoryReplay(record.question, record.answer, record.metadata);
    });
  }
});
```

## 完整示例：实现用户对话场景

### 父页面代码

```typescript
import { MessageSender, MessageReceiver } from './path/to/communication';

class ChatController {
  private iframe: HTMLIFrameElement | null = null;
  private sender: MessageSender | null = null;
  private receiver: MessageReceiver;

  constructor() {
    // 初始化接收器
    this.receiver = new MessageReceiver();

    // 注册消息处理函数
    this.setupMessageHandlers();

    // 初始化 iframe
    this.setupIframe();

    // 绑定 UI 事件
    this.bindUIEvents();
  }

  private setupIframe() {
    // 获取容器元素
    const container = document.getElementById('iframe-container');
    if (!container) return;

    // 创建 iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = 'https://chat.example.com/iframe.html';
    this.iframe.id = 'chat-iframe';

    // 监听 iframe 加载完成
    this.iframe.addEventListener('load', () => {
      if (this.iframe && this.iframe.contentWindow) {
        // 初始化发送器
        this.sender = new MessageSender(
          this.iframe.contentWindow, 
          'https://chat.example.com'
        );
        console.log('Sender initialized for iframe');
      }
    });

    // 添加到容器
    container.appendChild(this.iframe);
  }

  private setupMessageHandlers() {
    // 处理从 iframe 接收到的问题
    this.receiver.onUserQuestion(message => {
      console.log('Question from iframe:', message.question);

      // 获取回答（示例中使用模拟的 AI 回答）
      this.getAIResponse(message.question).then(answer => {
        if (this.sender) {
          // 将问题和回答发送回 iframe
          this.sender.sendHistoryReplay(
            message.question, 
            answer, 
            message.relatedData
          );
        }
      });
    });
  }

  private bindUIEvents() {
    // 绑定发送按钮
    const sendButton = document.getElementById('send-btn');
    const inputField = document.getElementById('question-input') as HTMLInputElement;

    if (sendButton && inputField) {
      sendButton.addEventListener('click', () => {
        const question = inputField.value.trim();
        if (question && this.sender) {
          // 发送问题到 iframe
          this.sender.sendUserQuestion(question, { from: 'parent' });
          inputField.value = '';
        }
      });
    }
  }

  // 模拟 AI 回答
  private async getAIResponse(question: string): Promise<string> {
    // 实际应用中可能会调用 API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`这是对"${question}"的回答`);
      }, 500);
    });
  }

  // 资源清理
  public destroy() {
    this.receiver.destroy();
  }
}

// 初始化控制器
document.addEventListener('DOMContentLoaded', () => {
  const controller = new ChatController();
  // 可以将控制器暴露到全局用于调试
  (window as any).chatController = controller;
});
```

### iframe 页面代码

```typescript
import { MessageSender, MessageReceiver } from './path/to/communication';

class ChatIframe {
  private sender: MessageSender;
  private receiver: MessageReceiver;
  private chatContainer: HTMLElement;

  constructor() {
    // 初始化发送器
    this.sender = new MessageSender(window.parent, document.referrer);

    // 初始化接收器
    this.receiver = new MessageReceiver();

    // 初始化 UI
    this.chatContainer = document.getElementById('chat-container') as HTMLElement;

    // 设置消息处理
    this.setupMessageHandlers();

    // 绑定 UI 事件
    this.bindUIEvents();
  }

  private setupMessageHandlers() {
    // 处理用户问题
    this.receiver.onUserQuestion(message => {
      console.log('Received question from parent:', message.question);

      // 显示用户问题
      this.addMessageToChat('user', message.question);
    });

    // 处理历史回放
    this.receiver.onHistoryReplay(message => {
      console.log('Received history from parent:', message.history);

      // 显示问题
      this.addMessageToChat('user', message.history.question);

      // 显示回答
      this.addMessageToChat('system', message.history.answer);
    });
  }

  private bindUIEvents() {
    // 绑定发送表单
    const form = document.getElementById('question-form') as HTMLFormElement;

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const input = form.querySelector('input') as HTMLInputElement;
        const question = input.value.trim();

        if (question) {
          // 显示问题
          this.addMessageToChat('user', question);

          // 发送到父页面
          this.sender.sendUserQuestion(question, { from: 'iframe' });

          // 清空输入框
          input.value = '';
        }
      });
    }
  }

  private addMessageToChat(type: 'user' | 'system', content: string) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = content;

    this.chatContainer.appendChild(messageDiv);

    // 滚动到底部
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  // 资源清理
  public destroy() {
    this.receiver.destroy();
  }
}

// 初始化 iframe 页面
document.addEventListener('DOMContentLoaded', () => {
  const iframe = new ChatIframe();
  (window as any).chatIframe = iframe;
});
```

## 安全最佳实践

1. **指定确切的目标源** - 生产环境中不要使用 `'*'` 作为 `targetOrigin`，而应该使用具体的域名
  
  ```typescript
  // 不推荐
  new MessageSender(window.parent, '*');
  
  // 推荐
  new MessageSender(window.parent, 'https://example.com');
  ```
  
2. **验证消息来源** - 在处理消息前验证发送方的身份
  
  ```typescript
  // 在 MessageReceiver 中添加源验证
  private handleMessage(event: MessageEvent): void {
    // 验证来源
    if (event.origin !== 'https://trusted-domain.com') {
      console.warn('Received message from untrusted source:', event.origin);
      return;
    }
  
    // 处理消息...
  }
  ```
  
3. **数据验证** - 不要信任接收到的任何数据，进行适当的验证和清理
  
  ```typescript
  // 在显示内容前进行转义
  private escapeHtml(content: string): string {
    const div = document.createElement('div');
    div.textContent = content;
    return div.innerHTML;
  }
  ```
  
4. **最小权限原则** - 只发送和接收必要的数据，避免传递敏感信息
  
5. **使用加密** - 对敏感数据进行加密，特别是在公共网络上传输时
  

## 故障排除

1. **消息没有发送/接收**
  
  - 检查目标窗口是否正确加载
  - 确认 `targetOrigin` 设置正确
  - 检查 iframe 是否有正确的 `allow` 属性
2. **接收到消息但处理器没有触发**
  
  - 检查消息类型是否正确
  - 确认消息格式符合接口定义
  - 检查是否正确注册了处理函数
3. **跨域问题**
  
  - 确保两个页面之间允许跨域通信
  - 检查 iframe 源是否包含在允许列表中

## 扩展通信机制

### 添加新的消息类型

1. 在 `types.ts` 中添加新的消息类型：
  
  ```typescript
  export enum MessageType {
    USER_QUESTION = 'USER_QUESTION',
    HISTORY_REPLAY = 'HISTORY_REPLAY',
    TYPING_INDICATOR = 'TYPING_INDICATOR', // 新增
  }
  
  // 定义新消息类型的接口
  export interface TypingIndicatorMessage extends BaseMessage {
    type: MessageType.TYPING_INDICATOR;
    isTyping: boolean;
    user: string;
  }
  
  // 更新联合类型
  export type IFrameMessage = 
    UserQuestionMessage | 
    HistoryReplayMessage | 
    TypingIndicatorMessage;
  ```
  
2. 在 `MessageSender.ts` 中添加发送方法：
  
  ```typescript
  // 发送输入状态
  sendTypingIndicator(isTyping: boolean, user: string): void {
    const message: TypingIndicatorMessage = {
      type: MessageType.TYPING_INDICATOR,
      timestamp: Date.now(),
      isTyping,
      user
    };
  
    this.sendMessage(message);
  }
  ```
  
3. 在 `MessageReceiver.ts` 中添加接收处理方法：
  
  ```typescript
  // 注册输入状态处理器
  onTypingIndicator(handler: (message: TypingIndicatorMessage) => void): () => void {
    return this.addHandler(MessageType.TYPING_INDICATOR, handler);
  }
  ```
  

## 总结

这套通信机制提供了一个类型安全、可扩展的方式来处理父页面与 iframe 之间的通信。通过清晰的职责分离和模块化设计，可以方便地根据需求扩展和维护。在使用时，请确保遵循安全最佳实践，特别是在处理用户数据时。

---

如需更多帮助或有任何问题，请查看源代码注释或联系开发团队。# IFrame 通信机制使用文档

## 概述

本文档描述了基于 `postMessage` API 的 iframe 通信机制，这套机制提供了类型安全、双向通信的能力，适用于父页面与嵌入的 iframe 之间的消息传递。通信机制支持两种主要场景：用户对话和历史回放。

## 安装

1. 将 `types.ts`、`MessageSender.ts`、`MessageReceiver.ts` 和 `index.ts` 文件复制到您的项目中
2. 确保您的项目支持 TypeScript

## 架构概览

通信机制由三个主要部分组成：

1. **类型定义** (`types.ts`): 定义所有消息类型和结构
2. **消息发送器** (`MessageSender.ts`): 负责构造和发送消息
3. **消息接收器** (`MessageReceiver.ts`): 负责接收和处理消息

所有组件都通过 `index.ts` 统一导出，方便使用。

## 消息类型

当前支持的消息类型包括：

1. **USER_QUESTION**: 用户问题消息，包含问题内容和相关数据
2. **HISTORY_REPLAY**: 历史回放消息，包含问题、回答和相关数据

## 基本使用方法

### 1. 在父页面中向 iframe 发送消息

```typescript
import { MessageSender } from './path/to/communication';

// 获取 iframe 元素
const iframe = document.getElementById('myIframe') as HTMLIFrameElement;

// 等待 iframe 加载完成
iframe.addEventListener('load', () => {
  if (iframe.contentWindow) {
    // 创建消息发送器，指向 iframe
    const sender = new MessageSender(iframe.contentWindow, 'https://iframe-domain.com');

    // 发送用户问题
    sender.sendUserQuestion('这是一个问题', { timestamp: Date.now() });

    // 发送历史回放
    sender.sendHistoryReplay('历史问题', '历史回答', { timestamp: Date.now() });
  }
});
```

### 2. 在 iframe 中接收消息

```typescript
import { MessageReceiver } from './path/to/communication';

// 创建消息接收器
const receiver = new MessageReceiver();

// 监听用户问题消息
receiver.onUserQuestion(message => {
  console.log('收到用户问题:', message.question);
  console.log('相关数据:', message.relatedData);

  // 处理消息...
  displayQuestion(message.question, message.relatedData);
});

// 监听历史回放消息
receiver.onHistoryReplay(message => {
  console.log('收到历史回放:', message.history);

  // 处理历史回放...
  displayHistoryReplay(message.history);
});

// 在组件卸载时清理
function cleanup() {
  receiver.destroy();
}
```

### 3. 从 iframe 向父页面发送消息

```typescript
import { MessageSender } from './path/to/communication';

// 创建消息发送器，指向父窗口
const sender = new MessageSender(window.parent, 'https://parent-domain.com');

// 发送用户问题给父页面
function sendQuestionToParent(question) {
  sender.sendUserQuestion(question, { source: 'iframe', timestamp: Date.now() });
}

// 发送历史回放请求给父页面
function requestHistoryReplay(historyId) {
  sender.sendHistoryReplay(
    `查看历史记录 #${historyId}`, 
    '', // 回答留空，由父页面填充
    { historyId }
  );
}
```

### 4. 在父页面中接收 iframe 发送的消息

```typescript
import { MessageReceiver } from './path/to/communication';

// 创建消息接收器
const receiver = new MessageReceiver();

// 监听来自 iframe 的用户问题
receiver.onUserQuestion(message => {
  console.log('iframe 发送的问题:', message.question);

  // 处理 iframe 发送的问题...
  processQuestionFromIframe(message.question, message.relatedData);
});

// 监听来自 iframe 的历史回放请求
receiver.onHistoryReplay(message => {
  console.log('iframe 请求历史回放:', message.history);

  // 处理历史回放请求...
  if (message.history.relatedData && message.history.relatedData.historyId) {
    const historyId = message.history.relatedData.historyId;
    fetchHistoryRecord(historyId).then(record => {
      // 发送完整历史记录回 iframe
      sender.sendHistoryReplay(record.question, record.answer, record.metadata);
    });
  }
});
```

## 完整示例：实现用户对话场景

### 父页面代码

```typescript
import { MessageSender, MessageReceiver } from './path/to/communication';

class ChatController {
  private iframe: HTMLIFrameElement | null = null;
  private sender: MessageSender | null = null;
  private receiver: MessageReceiver;

  constructor() {
    // 初始化接收器
    this.receiver = new MessageReceiver();

    // 注册消息处理函数
    this.setupMessageHandlers();

    // 初始化 iframe
    this.setupIframe();

    // 绑定 UI 事件
    this.bindUIEvents();
  }

  private setupIframe() {
    // 获取容器元素
    const container = document.getElementById('iframe-container');
    if (!container) return;

    // 创建 iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = 'https://chat.example.com/iframe.html';
    this.iframe.id = 'chat-iframe';

    // 监听 iframe 加载完成
    this.iframe.addEventListener('load', () => {
      if (this.iframe && this.iframe.contentWindow) {
        // 初始化发送器
        this.sender = new MessageSender(
          this.iframe.contentWindow, 
          'https://chat.example.com'
        );
        console.log('Sender initialized for iframe');
      }
    });

    // 添加到容器
    container.appendChild(this.iframe);
  }

  private setupMessageHandlers() {
    // 处理从 iframe 接收到的问题
    this.receiver.onUserQuestion(message => {
      console.log('Question from iframe:', message.question);

      // 获取回答（示例中使用模拟的 AI 回答）
      this.getAIResponse(message.question).then(answer => {
        if (this.sender) {
          // 将问题和回答发送回 iframe
          this.sender.sendHistoryReplay(
            message.question, 
            answer, 
            message.relatedData
          );
        }
      });
    });
  }

  private bindUIEvents() {
    // 绑定发送按钮
    const sendButton = document.getElementById('send-btn');
    const inputField = document.getElementById('question-input') as HTMLInputElement;

    if (sendButton && inputField) {
      sendButton.addEventListener('click', () => {
        const question = inputField.value.trim();
        if (question && this.sender) {
          // 发送问题到 iframe
          this.sender.sendUserQuestion(question, { from: 'parent' });
          inputField.value = '';
        }
      });
    }
  }

  // 模拟 AI 回答
  private async getAIResponse(question: string): Promise<string> {
    // 实际应用中可能会调用 API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`这是对"${question}"的回答`);
      }, 500);
    });
  }

  // 资源清理
  public destroy() {
    this.receiver.destroy();
  }
}

// 初始化控制器
document.addEventListener('DOMContentLoaded', () => {
  const controller = new ChatController();
  // 可以将控制器暴露到全局用于调试
  (window as any).chatController = controller;
});
```

### iframe 页面代码

```typescript
import { MessageSender, MessageReceiver } from './path/to/communication';

class ChatIframe {
  private sender: MessageSender;
  private receiver: MessageReceiver;
  private chatContainer: HTMLElement;

  constructor() {
    // 初始化发送器
    this.sender = new MessageSender(window.parent, document.referrer);

    // 初始化接收器
    this.receiver = new MessageReceiver();

    // 初始化 UI
    this.chatContainer = document.getElementById('chat-container') as HTMLElement;

    // 设置消息处理
    this.setupMessageHandlers();

    // 绑定 UI 事件
    this.bindUIEvents();
  }

  private setupMessageHandlers() {
    // 处理用户问题
    this.receiver.onUserQuestion(message => {
      console.log('Received question from parent:', message.question);

      // 显示用户问题
      this.addMessageToChat('user', message.question);
    });

    // 处理历史回放
    this.receiver.onHistoryReplay(message => {
      console.log('Received history from parent:', message.history);

      // 显示问题
      this.addMessageToChat('user', message.history.question);

      // 显示回答
      this.addMessageToChat('system', message.history.answer);
    });
  }

  private bindUIEvents() {
    // 绑定发送表单
    const form = document.getElementById('question-form') as HTMLFormElement;

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const input = form.querySelector('input') as HTMLInputElement;
        const question = input.value.trim();

        if (question) {
          // 显示问题
          this.addMessageToChat('user', question);

          // 发送到父页面
          this.sender.sendUserQuestion(question, { from: 'iframe' });

          // 清空输入框
          input.value = '';
        }
      });
    }
  }

  private addMessageToChat(type: 'user' | 'system', content: string) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = content;

    this.chatContainer.appendChild(messageDiv);

    // 滚动到底部
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  // 资源清理
  public destroy() {
    this.receiver.destroy();
  }
}

// 初始化 iframe 页面
document.addEventListener('DOMContentLoaded', () => {
  const iframe = new ChatIframe();
  (window as any).chatIframe = iframe;
});
```

## 安全最佳实践

1. **指定确切的目标源** - 生产环境中不要使用 `'*'` 作为 `targetOrigin`，而应该使用具体的域名
  
  ```typescript
  // 不推荐
  new MessageSender(window.parent, '*');
  
  // 推荐
  new MessageSender(window.parent, 'https://example.com');
  ```
  
2. **验证消息来源** - 在处理消息前验证发送方的身份
  
  ```typescript
  // 在 MessageReceiver 中添加源验证
  private handleMessage(event: MessageEvent): void {
    // 验证来源
    if (event.origin !== 'https://trusted-domain.com') {
      console.warn('Received message from untrusted source:', event.origin);
      return;
    }
  
    // 处理消息...
  }
  ```
  
3. **数据验证** - 不要信任接收到的任何数据，进行适当的验证和清理
  
  ```typescript
  // 在显示内容前进行转义
  private escapeHtml(content: string): string {
    const div = document.createElement('div');
    div.textContent = content;
    return div.innerHTML;
  }
  ```
  
4. **最小权限原则** - 只发送和接收必要的数据，避免传递敏感信息
  
5. **使用加密** - 对敏感数据进行加密，特别是在公共网络上传输时
  

## 故障排除

1. **消息没有发送/接收**
  
  - 检查目标窗口是否正确加载
  - 确认 `targetOrigin` 设置正确
  - 检查 iframe 是否有正确的 `allow` 属性
2. **接收到消息但处理器没有触发**
  
  - 检查消息类型是否正确
  - 确认消息格式符合接口定义
  - 检查是否正确注册了处理函数
3. **跨域问题**
  
  - 确保两个页面之间允许跨域通信
  - 检查 iframe 源是否包含在允许列表中

## 扩展通信机制

### 添加新的消息类型

1. 在 `types.ts` 中添加新的消息类型：
  
  ```typescript
  export enum MessageType {
    USER_QUESTION = 'USER_QUESTION',
    HISTORY_REPLAY = 'HISTORY_REPLAY',
    TYPING_INDICATOR = 'TYPING_INDICATOR', // 新增
  }
  
  // 定义新消息类型的接口
  export interface TypingIndicatorMessage extends BaseMessage {
    type: MessageType.TYPING_INDICATOR;
    isTyping: boolean;
    user: string;
  }
  
  // 更新联合类型
  export type IFrameMessage = 
    UserQuestionMessage | 
    HistoryReplayMessage | 
    TypingIndicatorMessage;
  ```
  
2. 在 `MessageSender.ts` 中添加发送方法：
  
  ```typescript
  // 发送输入状态
  sendTypingIndicator(isTyping: boolean, user: string): void {
    const message: TypingIndicatorMessage = {
      type: MessageType.TYPING_INDICATOR,
      timestamp: Date.now(),
      isTyping,
      user
    };
  
    this.sendMessage(message);
  }
  ```
  
3. 在 `MessageReceiver.ts` 中添加接收处理方法：
  
  ```typescript
  // 注册输入状态处理器
  onTypingIndicator(handler: (message: TypingIndicatorMessage) => void): () => void {
    return this.addHandler(MessageType.TYPING_INDICATOR, handler);
  }
  ```
  

## 总结

这套通信机制提供了一个类型安全、可扩展的方式来处理父页面与 iframe 之间的通信。通过清晰的职责分离和模块化设计，可以方便地根据需求扩展和维护。在使用时，请确保遵循安全最佳实践，特别是在处理用户数据时。

---

如需更多帮助或有任何问题，请查看源代码注释或联系开发团队。