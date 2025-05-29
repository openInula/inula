'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/base/button';
import Input from '@/components/base/input';
import { Textarea } from '@/components/base/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  useTestSets,
  useTestSet,
  useCreateTestSet,
  useDeleteTestSet,
  useCreateTestCase,
  useDeleteTestCase,
  CreateTestSetDto,
  TestSet,
} from '../service/test-sets';
import { useToastContext } from '@/components/base/toast';
import { Spin, Typography } from 'antd';
import DialogWrapper from '@/components/base/features/new-feature-panel/dialog-wrapper';
import Modal from '@/components/base/modal';
import { useQueryClient } from '@tanstack/react-query';

export default function TestSetManager() {
  // 使用React Query钩子获取测试集数据
  const { data: testSets = [], isLoading, error } = useTestSets();

  // 选中的测试集ID
  const [selectedTestSet, setSelectedTestSet] = useState<string | null>(null);

  // 获取选中测试集的详细信息
  const { data: selectedTestSetDetails } = useTestSet(selectedTestSet || '');

  const queryClient = useQueryClient();

  // UI状态
  const [isAddingTestSet, setIsAddingTestSet] = useState(false);
  const [isAddingTestCase, setIsAddingTestCase] = useState(false);

  // 新测试集和测试用例的表单状态
  const [newTestSet, setNewTestSet] = useState({ name: '', description: '' });
  const [newTestCase, setNewTestCase] = useState({
    prompt: '',
    expectedResult: '',
  });

  // 使用Mutation钩子
  const createTestSetMutation = useCreateTestSet();
  const deleteTestSetMutation = useDeleteTestSet();
  const createTestCaseMutation = useCreateTestCase();
  const deleteTestCaseMutation = useDeleteTestCase(selectedTestSet || '');

  const { notify } = useToastContext();

  // 处理添加测试集
  const handleAddTestSet = () => {
    if (newTestSet.name.trim() === '') return;

    createTestSetMutation.mutate(
      {
        name: newTestSet.name,
        description: newTestSet.description,
        testCases: [],
      },
      {
        onSuccess: (newTestSet) => {
          // 重置表单并选中新创建的测试集
          setNewTestSet({ name: '', description: '' });
          setIsAddingTestSet(false);
          setSelectedTestSet(newTestSet.id);
          notify({ type: 'success', message: '测试集创建成功' });
        },
        onError: (error) => {
          notify({ type: 'error', message: '创建测试集失败：' + (error as Error).message });
        },
      },
    );
  };

  // 处理添加测试用例
  const handleAddTestCase = () => {
    if (
      !selectedTestSet ||
      newTestCase.prompt.trim() === '' ||
      newTestCase.expectedResult.trim() === ''
    )
      return;

    createTestCaseMutation.mutate(
      {
        prompt: newTestCase.prompt,
        expectedResult: newTestCase.expectedResult,
        testSetId: selectedTestSet || '',
      },
      {
        onSuccess: () => {
          // 重置表单
          setNewTestCase({ prompt: '', expectedResult: '' });
          setIsAddingTestCase(false);
          notify({ type: 'success', message: '测试用例添加成功' });

          // 关键修复: 强制刷新当前测试集的数据
          queryClient.invalidateQueries({ queryKey: ['testSet', selectedTestSet] });
        },
        onError: (error) => {
          notify({ type: 'error', message: '添加测试用例失败：' + (error as Error).message });
        },
      },
    );
  };

  // 处理删除测试集
  const handleDeleteTestSet = (id: string) => {
    deleteTestSetMutation.mutate(id, {
      onSuccess: () => {
        if (selectedTestSet === id) {
          setSelectedTestSet(null);
        }
        notify({ type: 'success', message: '测试集已删除' });
      },
      onError: (error) => {
        notify({ type: 'error', message: '删除测试集失败：' + (error as Error).message });
      },
    });
  };

  // 处理删除测试用例
  const handleDeleteTestCase = (testSetId: string, testCaseId: string) => {
    deleteTestCaseMutation.mutate(testCaseId, {
      onSuccess: () => {
        notify({ type: 'success', message: '测试用例已删除' });
      },
      onError: (error) => {
        notify({ type: 'error', message: '删除测试用例失败：' + (error as Error).message });
      },
    });
  };

  // 处理复制测试集
  const handleDuplicateTestSet = (id: string) => {
    const testSetToDuplicate = testSets.find((testSet) => testSet.id === id);
    if (!testSetToDuplicate) return;

    // 创建新的测试集副本
    const duplicateData: CreateTestSetDto = {
      name: `${testSetToDuplicate.name} (复制)`,
      description: testSetToDuplicate.description,
      testCases: testSetToDuplicate.testCases.map((tc) => ({
        prompt: tc.prompt,
        expectedResult: tc.expectedResult,
      })),
    };

    createTestSetMutation.mutate(duplicateData, {
      onSuccess: (newTestSet) => {
        setSelectedTestSet(newTestSet.id);
        notify({ type: 'success', message: '测试集已复制' });
      },
      onError: (error) => {
        notify({ type: 'error', message: '复制测试集失败：' + (error as Error).message });
      },
    });
  };

  if (isLoading) {
    return <Spin tip="加载中..." />;
  }

  if (error) {
    return (
      <Typography.Text type="danger">加载测试集失败：{(error as Error).message}</Typography.Text>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-text-tertiary font-bold text-lg">评测集管理</div>
        <Button onClick={() => setIsAddingTestSet(true)}>
          <Plus className="mr-2 h-4 w-4" /> 新建评测集
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">评测集列表</CardTitle>
              <CardDescription>选择一个评测集进行管理</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {testSets.map((testSet) => (
                    <div
                      key={testSet.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                        selectedTestSet === testSet.id
                          ? 'bg-state-accent-active text-text-accent'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => setSelectedTestSet(testSet.id)}
                    >
                      <div>
                        <div className="font-medium">{testSet.name}</div>
                        <div className="text-xs">{testSet.testCases.length} 个测试用例</div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7  text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTestSet(testSet.id);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTestSet(testSet.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedTestSet ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>
                    {testSets.find((testSet) => testSet.id === selectedTestSet)?.name}
                  </CardTitle>
                  <CardDescription>
                    {testSets.find((testSet) => testSet.id === selectedTestSet)?.description}
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingTestCase(true)}>
                  <Plus className="mr-2 h-4 w-4" /> 添加测试用例
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>提示词</TableHead>
                      <TableHead className="w-1/2">预期结果</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testSets
                      .find((testSet) => testSet.id === selectedTestSet)
                      ?.testCases.map((testCase) => (
                        <TableRow key={testCase.id}>
                          <TableCell>
                            <div className="max-h-20 overflow-y-auto">{testCase.prompt}</div>
                          </TableCell>
                          <TableCell className="whitespace-normal max-w-[500px]">
                            <div className="max-h-20 overflow-y-auto">
                              <pre className="text-xs">
                                {JSON.stringify(testCase.expectedResult, null, 2)}
                              </pre>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteTestCase(selectedTestSet, testCase.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium">未选择评测集</h3>
                <p className="text-muted-foreground">请从左侧选择一个评测集或创建新的评测集</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加评测集对话框 */}
      <Modal isShow={isAddingTestSet} onClose={() => setIsAddingTestSet(false)}>
        <h3 className="font-bold">创建测试集</h3>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              评测集名称
            </label>
            <Input
              id="name"
              placeholder="输入评测集名称"
              value={newTestSet.name}
              onChange={(e) => setNewTestSet({ ...newTestSet, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              描述
            </label>
            <Textarea
              id="description"
              placeholder="输入评测集描述"
              value={newTestSet.description}
              onChange={(e) => setNewTestSet({ ...newTestSet, description: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setIsAddingTestSet(false)}>
            取消
          </Button>
          <Button className="ml-2" variant="primary" onClick={handleAddTestSet}>
            创建
          </Button>
        </div>
      </Modal>

      {/* 添加测试用例对话框 */}
      <Modal
        isShow={isAddingTestCase}
        className="max-w-2xl"
        onClose={() => setIsAddingTestCase(false)}
      >
        <div>
          <h3>添加测试用例</h3>
          <p>为当前评测集添加新的测试用例</p>
        </div>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              提示词
            </label>
            <Textarea
              id="prompt"
              placeholder="输入提示词"
              className="min-h-[100px]"
              value={newTestCase.prompt}
              onChange={(e) => setNewTestCase({ ...newTestCase, prompt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expectedResult" className="text-sm font-medium">
              预期结果 (JSON格式)
            </label>
            <Textarea
              id="expectedResult"
              placeholder='{"components": ["form", "input", "button"], "structure": "form > div > input + button"}'
              className="min-h-[150px] font-mono"
              value={newTestCase.expectedResult}
              onChange={(e) =>
                setNewTestCase({
                  ...newTestCase,
                  expectedResult: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setIsAddingTestCase(false)}>
            取消
          </Button>
          <Button className="ml-2" variant="primary" onClick={handleAddTestCase}>
            添加
          </Button>
        </div>
      </Modal>
    </div>
  );
}
