import { CopilotKit } from '@copilotkit/copilot-client'
import { ChatbotContent } from './ChatbotContent'

// Chatbot 组件 - 包装 CopilotKit，支持动态ScriptActions
export function Chatbot(): any {
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit" 
      showDevConsole={false} // 开启控制台便于调试
    >
      <ChatbotContent />
    </CopilotKit>
  )
}