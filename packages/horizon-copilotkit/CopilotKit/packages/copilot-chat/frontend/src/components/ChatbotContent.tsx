import { useState, useCallback } from 'react'
import { 
  useCopilotChat, 
  TextMessage 
} from '@copilotkit/copilot-client'
import { ChatInput } from './ChatInput'
import { useBusinessActions } from '../hooks/useBusinessActions'
import { useDynamicActions } from '../hooks/useDynamicActions'

// 内部聊天组件
export function ChatbotContent() {
  const [isOpen, setIsOpen] = useState(false)
  
  // 注册业务相关的 Actions
  useBusinessActions();
  
  // 动态Actions功能
  const { queryDynamicActions, addDynamicActions, removeDynamicActions, appendHandlerToAction } = useDynamicActions()
  
  // 查询并注册动态Actions的组合函数
  const queryAndRegisterDynamicActions = useCallback(async (userQuery: string) => {
    if (!queryDynamicActions) return [];
    
    try {
      // 先清除旧的动态actions
      removeDynamicActions();
      
      // 查询新的动态actions
      const actions = await queryDynamicActions(userQuery);

      // 遍历actions，调用appendHandlerToAction为每个action添加handler
      const enhancedActions = actions.map(action => appendHandlerToAction(action));
      
      // 如果找到actions，添加增强后的actions到状态中
      if (enhancedActions.length > 0) {
        addDynamicActions(enhancedActions);
      }
      
      return enhancedActions;
    } catch (error) {
      console.error('查询和注册动态Actions失败:', error);
      return [];
    }
  }, [queryDynamicActions, addDynamicActions, removeDynamicActions])
  
  const { 
    visibleMessages, 
    appendMessage, 
    setMessages, 
    stopGeneration,
    isLoading 
  } = useCopilotChat()

  // 增强的消息发送处理，支持动态查询
  const handleSendMessage = useCallback(async (message: string) => {
    if (message.trim()) {

      // 先处理动态Actions（如果需要），再发送消息
      try {
        console.log('🔍 正在查询相关功能...')
        await queryAndRegisterDynamicActions(message)
      } catch (error) {
        console.error('动态查询失败:', error)
      }
      
      // 然后发送用户消息（AI现在可以使用刚查询到的动态功能）
      appendMessage(new TextMessage({ content: message, role: 'user' }))
    }
  }, [appendMessage, queryAndRegisterDynamicActions])

  // 聊天按钮 - 未打开时显示
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-[9999]"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    )
  }


  // 展开状态
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl border w-96 h-[500px] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-medium">💬 AI 助手</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white !bg-blue-700 hover:!bg-red-500 rounded p-1 transition-colors"
            title="关闭"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visibleMessages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center text-gray-500 text-sm">
                <p>👋 您好！我是 AI 助手</p>
                <p>我可以帮助您查找和使用各种功能，有什么可以帮助您的吗？</p>
              </div>
            </div>
          )}
          
          {visibleMessages.map((message, index) => {
            // 只显示文本消息
            if (!message.isTextMessage()) {
              return null;
            }
            
            const textMessage = message as TextMessage;
            return (
              <div
                key={index}
                className={`flex ${
                  textMessage.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    textMessage.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{textMessage.content}</p>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 输入区域 */}
        <div className="p-4 border-t">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          <div className="flex justify-between items-center mt-2">
            {isLoading && (
              <button
                onClick={stopGeneration}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                停止生成
              </button>
            )}
            <button
              onClick={() => setMessages([])}
              className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 ml-auto"
            >
              清空对话
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}