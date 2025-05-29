import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from './base';

// Types
export interface TestCaseResult {
  id: string;
  actualResult: string;
  similarity: number;
  passed: boolean;
  notes?: string;
  testCase: {
    id: string;
    prompt: string;
    expectedResult: string;
  };
  createdAt: string;
}

export interface TestRun {
  id: string;
  name: string;
  date: string;
  version: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  avgSimilarity: number;
  testSets: { id: string; name: string }[];
  testResults?: TestCaseResult[];
  createdAt: string;
  updatedAt: string;
}

export interface TestRunListItem {
  id: string;
  name: string;
  date: string;
  version: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  avgSimilarity: number;
  testSets: { id: string; name: string }[];
  _count: {
    testResults: number;
  };
}

export interface TestCaseResultDto {
  testCaseId: string;
  actualResult: string;
  similarity: number;
  passed: boolean;
  notes?: string;
}

export interface CreateTestRunDto {
  name: string;
  date?: string;
  version: string;
  testSetIds: string[];
  testCaseResults: TestCaseResultDto[];
}

// API functions
export const getTestRuns = () => get<TestRunListItem[]>('test-runs', { requiresAuth: true });
export const getTestRun = (id: string) => get<TestRun>(`test-runs/${id}`, { requiresAuth: true });
export const createTestRun = (data: CreateTestRunDto) => post<TestRun>('test-runs', data, { requiresAuth: true });
export const deleteTestRun = (id: string) => del<void>(`test-runs/${id}`, { requiresAuth: true });
export const getTestSetResults = (testRunId: string, testSetId: string) => 
  get<TestCaseResult[]>(`test-runs/${testRunId}/test-sets/${testSetId}`, { requiresAuth: true });

// Query hooks
export const useTestRuns = () => {
  return useQuery({
    queryKey: ['testRuns'],
    queryFn: getTestRuns,
  });
};

export const useTestRun = (id: string) => {
  return useQuery({
    queryKey: ['testRun', id],
    queryFn: () => getTestRun(id),
    enabled: !!id,
  });
};

export const useTestSetResults = (testRunId: string, testSetId: string) => {
  return useQuery({
    queryKey: ['testRun', testRunId, 'testSet', testSetId],
    queryFn: () => getTestSetResults(testRunId, testSetId),
    enabled: !!testRunId && !!testSetId,
  });
};

// Mutation hooks
export const useCreateTestRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTestRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] });
    },
  });
};

export const useDeleteTestRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTestRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] });
    },
  });
};
