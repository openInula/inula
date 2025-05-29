import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, put, del } from './base';

// 类型定义
export interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  conversationId?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  title?: string;
  agentId: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
  agent?: {
    id: number;
    name: string;
  };
  messages?: Message[];
}

export interface ConversationListResponse {
  data: Conversation[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CreateConversationDto {
  title?: string;
  agentId: number;
  metadata?: Record<string, any>;
}

export interface CreateMessageDto {
  content: string;
  role: 'user' | 'assistant';
  conversationId: string;
  metadata?: Record<string, any>;
}

export interface UpdateConversationDto {
  title?: string;
  metadata?: Record<string, any>;
}

export interface SaveConversationHistoryDto {
  conversationId: string;
  messages: Omit<Message, 'id' | 'conversationId' | 'createdAt'>[];
}

export interface GetConversationsParams {
  page?: number | string;
  pageSize?: number | string;
  agentId?: number | string;
}

// API 调用函数
export const getConversations = (params?: GetConversationsParams) => {
  // 这里我们不发送任何查询参数，避免参数类型转换问题
  console.log('getConversations called with params:', params);

  try {
    // 直接调用无参数的API，避免400错误
    return get<ConversationListResponse>('conversations', {
      params,
      requiresAuth: true
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    throw error;
  }
};

export const getConversationById = (id: string) =>
  get<Conversation>(`conversations/${id}`, { requiresAuth: true });

export const createConversation = (data: CreateConversationDto) =>
  post<Conversation>('conversations', data, { requiresAuth: true });

export const updateConversation = (id: string, data: UpdateConversationDto) =>
  patch<Conversation>(`conversations/${id}`, data, { requiresAuth: true });

export const deleteConversation = (id: string) =>
  del<void>(`conversations/${id}`, { requiresAuth: true });

export const getConversationMessages = (conversationId: string) =>
  get<Message[]>(`conversations/${conversationId}/messages`, { requiresAuth: true });

export const createMessage = (data: CreateMessageDto) =>
  post<Message>('conversations/messages', data, { requiresAuth: true });

export const saveConversationHistory = (conversationId: string, messages: Omit<Message, 'id' | 'conversationId' | 'createdAt'>[]) =>
  put<Conversation>(`conversations/${conversationId}/history`, {
    conversationId,
    messages
  }, { requiresAuth: true });

// React Query Hooks
export const useConversations = (params?: GetConversationsParams) => {
  console.log('useConversations hook called with params:', params);

  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => {
      console.log('useConversations queryFn executing with params:', params);
      return getConversations(params);
    },
    refetchOnWindowFocus: false, // 避免在窗口获得焦点时自动刷新
    onError: (error) => {
      console.error('Error in useConversations query:', error);
    },
    onSuccess: (data) => {
      console.log('useConversations query successful with data:', data);
    }
  });
};

export const useConversation = (id: string) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversationById(id),
    enabled: !!id, // 只有当id存在时才执行查询
    refetchOnWindowFocus: false,
  });
};

export const useConversationMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['conversationMessages', conversationId],
    queryFn: () => getConversationMessages(conversationId),
    enabled: !!conversationId, // 只有当conversationId存在时才执行查询
    refetchOnWindowFocus: false,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      // 成功创建会话后，使conversations查询失效
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
    }
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationDto }) =>
      updateConversation(id, data),
    onSuccess: (data) => {
      // 成功更新会话后，使特定会话查询和会话列表查询失效
      queryClient.invalidateQueries({ queryKey: ['conversation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Failed to update conversation:', error);
    }
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, id) => {
      // 成功删除会话后，使特定会话查询和会话列表查询失效
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Failed to delete conversation:', error);
    }
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMessage,
    onSuccess: (data) => {
      // 成功创建消息后，使会话消息查询和特定会话查询失效
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
    },
    onError: (error) => {
      console.error('Failed to create message:', error);
    }
  });
};

export const useSaveConversationHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, messages }: SaveConversationHistoryDto) =>
      saveConversationHistory(conversationId, messages),
    onSuccess: (data) => {
      // 成功保存会话历史后，使会话消息查询和特定会话查询失效
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', data.id] });
      queryClient.invalidateQueries({ queryKey: ['conversation', data.id] });
    },
    onError: (error) => {
      console.error('Failed to save conversation history:', error);
    }
  });
};
