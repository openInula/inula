import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from './base';

// 定义 API 路径
const API_PATH = 'agents';

// 类型定义
export interface UiAction {
  id: number;
  key: string;
  type: 'link' | 'event' | 'function';
}

export interface TestSet {
  id: number;
  question: string;
  expectedResult: string;
  runRecord: string;
}

export interface Agent {
  id: number;
  name: string;
  promptTemplate: string;
  userData: string;
  promptQueries: string;
  createdAt: string;
  updatedAt: string;
  uiActions?: UiAction[];
  testSets?: TestSet[];
}

export interface CreateAgentDto {
  name: string;
  promptTemplate: string;
  userData?: string;
  promptQueries?: string;
  uiActions?: Omit<UiAction, 'id'>[];
  testSets?: Omit<TestSet, 'id' | 'runRecord'>[];
}

export interface UpdateAgentDto {
  name?: string;
  promptTemplate?: string;
  userData?: string;
  promptQueries?: string;
  uiActions?: Omit<UiAction, 'id'>[];
  testSets?: Omit<TestSet, 'id' | 'runRecord'>[];
  publishAt?: string
}

// Agent API 函数
export const agentApi = {
  // 获取所有 Agents
  getAllAgents: async (): Promise<Agent[]> => {
    return get<Agent[]>(`${API_PATH}`, { requiresAuth: true });
  },

  // 获取单个 Agent 详情
  getAgentById: async (id: number): Promise<Agent> => {
    return get<Agent>(`${API_PATH}/${id}`, { requiresAuth: true });
  },

  // 创建新 Agent
  createAgent: async (data: CreateAgentDto): Promise<Agent> => {
    return post<Agent>(`${API_PATH}`, data, { requiresAuth: true });
  },

  // 更新 Agent
  updateAgent: async (id: number, data: UpdateAgentDto): Promise<Agent> => {
    return patch<Agent>(`${API_PATH}/${id}`, data, { requiresAuth: true });
  },

  // 删除 Agent
  deleteAgent: async (id: number): Promise<{ message: string }> => {
    return del<{ message: string }>(`${API_PATH}/${id}`, { requiresAuth: true });
  }
};

// React Query Hooks

// 获取所有 Agents 的 hook
export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: agentApi.getAllAgents,
  });
};

// 获取单个 Agent 详情的 hook
export const useAgent = (id: number) => {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => agentApi.getAgentById(id),
    enabled: !!id, // 只有当 id 存在时才执行查询
  });
};

// 创建 Agent 的 hook
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentDto) => agentApi.createAgent(data),
    onSuccess: () => {
      // 创建成功后刷新 agents 列表
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

// 更新 Agent 的 hook
export const useUpdateAgent = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAgentDto) => agentApi.updateAgent(id, data),
    onSuccess: (data) => {
      // 更新成功后刷新单个 agent 和 agents 列表
      queryClient.invalidateQueries({ queryKey: ['agents', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });

      // 可选：直接更新缓存中的数据，避免重新获取
      queryClient.setQueryData(['agents', id], data);
    },
  });
};

// 删除 Agent 的 hook
export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => agentApi.deleteAgent(id),
    onSuccess: (_data, variables) => {
      // 删除成功后刷新 agents 列表并移除缓存中的单个 agent
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.removeQueries({ queryKey: ['agents', variables] });
    },
  });
};