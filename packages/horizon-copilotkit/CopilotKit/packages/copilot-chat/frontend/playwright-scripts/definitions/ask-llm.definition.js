export const askLlmDefinition = {
  name: "ask-llm",
  description: "向前端聊天界面发送消息并等待响应。用于LLM与用户界面进行交互。",
  parameters: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "要发送的消息内容"
      },
    },
    required: ["message"]
  }
};
