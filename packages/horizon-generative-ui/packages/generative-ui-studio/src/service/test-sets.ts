import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from './base';

// Types
export interface TestCase {
  id: string;
  prompt: string;
  expectedResult: string;
  testSetId: string;
}

export interface TestSet {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  testCases: TestCase[];
}

export interface CreateTestSetDto {
  name: string;
  description?: string;
  testCases?: {
    prompt: string;
    expectedResult: string;
  }[];
}

export interface UpdateTestSetDto {
  name?: string;
  description?: string;
}

export interface CreateTestCaseDto {
  testSetId: string
  prompt: string;
  expectedResult: string;
}

export interface UpdateTestCaseDto {
  prompt?: string;
  expectedResult?: string;
}

// API functions
export const getTestSets = () => get<TestSet[]>('test-sets', { requiresAuth: true });
export const getTestSet = (id: string) => get<TestSet>(`test-sets/${id}`, { requiresAuth: true });
export const createTestSet = (data: CreateTestSetDto) => post<TestSet>('test-sets', data, { requiresAuth: true });
export const updateTestSet = (id: string, data: UpdateTestSetDto) => patch<TestSet>(`test-sets/${id}`, data, { requiresAuth: true });
export const deleteTestSet = (id: string) => del<void>(`test-sets/${id}`, { requiresAuth: true });

export const createTestCase = (data: CreateTestCaseDto) => {
  const { testSetId, ...payload } = data;
  return post<TestCase>(`test-sets/${testSetId}/test-cases`, payload, { requiresAuth: true });
}

export const updateTestCase = (testSetId: string, testCaseId: string, data: UpdateTestCaseDto) =>
  patch<TestCase>(`test-sets/${testSetId}/test-cases/${testCaseId}`, data, { requiresAuth: true });

export const deleteTestCase = (testSetId: string, testCaseId: string) =>
  del<void>(`test-sets/${testSetId}/test-cases/${testCaseId}`, { requiresAuth: true });

// Query hooks
export const useTestSets = () => {
  return useQuery({
    queryKey: ['testSets'],
    queryFn: getTestSets,
  });
};

export const useTestSet = (id: string) => {
  return useQuery({
    queryKey: ['testSet', id],
    queryFn: () => getTestSet(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateTestSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSets'] });
    },
  });
};

export const useUpdateTestSet = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTestSetDto) => updateTestSet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSets'] });
      queryClient.invalidateQueries({ queryKey: ['testSet', id] });
    },
  });
};

export const useDeleteTestSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTestSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSets'] });
    },
  });
};

export const useCreateTestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestCaseDto) => createTestCase(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testSet', data.testSetId] });
    },
  });
};

export const useUpdateTestCase = (testSetId: string, testCaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTestCaseDto) => updateTestCase(testSetId, testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSet', testSetId] });
    },
  });
};

export const useDeleteTestCase = (testSetId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testCaseId: string) => deleteTestCase(testSetId, testCaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSet', testSetId] });
    },
  });
};
