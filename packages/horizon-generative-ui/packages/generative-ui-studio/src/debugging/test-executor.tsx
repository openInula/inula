'use client';

import { useState } from 'react';
import { Play, Pause, StopCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/base/button';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SimpleSelect } from '@/components/base/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Checkbox from '@/components/base/checkbox';
import { Slider } from '@/components/ui/slider';

// 模拟测试集数据
const testSets = [
  { id: '1', name: '基础UI组件测试集', testCases: 5 },
  { id: '2', name: '复杂布局测试集', testCases: 3 },
  { id: '3', name: '响应式设计测试集', testCases: 4 },
  { id: '4', name: '表单交互测试集', testCases: 6 },
];

// 模拟Agent版本数据
const agentVersions = [
  { id: 'v1.0.0', name: 'v1.0.0 (稳定版)' },
  { id: 'v1.1.0', name: 'v1.1.0 (测试版)' },
  { id: 'v1.2.0-beta', name: 'v1.2.0 (Beta)' },
];

export default function TestExecutor() {
  const [selectedTestSets, setSelectedTestSets] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.0.0');
  const [concurrency, setConcurrency] = useState<number>(2);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [executionResults, setExecutionResults] = useState<any[]>([]);

  const toggleTestSet = (id: string) => {
    if (selectedTestSets.includes(id)) {
      setSelectedTestSets(selectedTestSets.filter((setId) => setId !== id));
    } else {
      setSelectedTestSets([...selectedTestSets, id]);
    }
  };

  const startExecution = () => {
    if (selectedTestSets.length === 0) return;

    setIsRunning(true);
    setProgress(0);
    setExecutionResults([]);

    // 模拟测试执行过程
    let currentProgress = 0;
    const totalTestCases = selectedTestSets.reduce((total, setId) => {
      const testSet = testSets.find((set) => set.id === setId);
      return total + (testSet?.testCases || 0);
    }, 0);

    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setIsRunning(false);
        generateMockResults();
      }
      setProgress(currentProgress);
    }, 500);
  };

  const stopExecution = () => {
    setIsRunning(false);
  };

  const generateMockResults = () => {
    const results = [];
    for (const setId of selectedTestSets) {
      const testSet = testSets.find((set) => set.id === setId);
      if (!testSet) continue;

      for (let i = 1; i <= testSet.testCases; i++) {
        const success = Math.random() > 0.3;
        results.push({
          id: `${setId}-${i}`,
          testSetName: testSet.name,
          testCaseName: `测试用例 ${i}`,
          status: success ? '成功' : '失败',
          similarity: success
            ? Math.round(80 + Math.random() * 20)
            : Math.round(40 + Math.random() * 40),
          executionTime: Math.round(500 + Math.random() * 2000),
        });
      }
    }
    setExecutionResults(results);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">测试执行</h2>
        <div className="flex items-center space-x-2">
          {isRunning ? (
            <>
              <Button variant="tertiary" onClick={stopExecution}>
                <Pause className="mr-2 h-4 w-4" /> 暂停
              </Button>
              <Button variant="tertiary" onClick={stopExecution}>
                <StopCircle className="mr-2 h-4 w-4" /> 停止
              </Button>
            </>
          ) : (
            <Button onClick={startExecution} disabled={selectedTestSets.length === 0}>
              <Play className="mr-2 h-4 w-4" /> 开始执行
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>执行配置</CardTitle>
              <CardDescription>选择要执行的测试集和配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="font-medium">选择Agent版本</div>
                <SimpleSelect
                  value={selectedVersion}
                  placeholder="选择版本"
                  onSelect={setSelectedVersion}
                  items={agentVersions.map((version) => ({
                    name: version.name,
                    value: version.id,
                  }))}
                ></SimpleSelect>
              </div>

              <div className="space-y-4">
                <div className="font-medium">并发数量: {concurrency}</div>
                <Slider
                  value={[concurrency]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setConcurrency(value[0])}
                />
              </div>

              <div className="space-y-4">
                <div className="font-medium">选择测试集</div>
                <div className="space-y-2">
                  {testSets.map((testSet) => (
                    <div
                      key={testSet.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedTestSets.includes(testSet.id)}
                        onCheck={() => toggleTestSet(testSet.id)}
                      />
                      <label htmlFor={`test-set-${testSet.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{testSet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {testSet.testCases} 个测试用例
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={startExecution}
                variant="secondary-accent"
                disabled={selectedTestSets.length === 0 || isRunning}
              >
                <Play className="mr-2 h-4 w-4" /> 开始执行
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>执行状态</CardTitle>
              <CardDescription>
                {isRunning
                  ? '正在执行测试...'
                  : executionResults.length > 0
                  ? '测试执行完成'
                  : '等待开始执行'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>执行进度</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {executionResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">执行结果</h3>
                    <div className="flex space-x-2">
                      <Badge variant="outline">总计: {executionResults.length}</Badge>
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        成功: {executionResults.filter((result) => result.status === '成功').length}
                      </Badge>
                      <Badge variant="destructive">
                        失败: {executionResults.filter((result) => result.status === '失败').length}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>测试集</TableHead>
                          <TableHead>测试用例</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>相似度</TableHead>
                          <TableHead>执行时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {executionResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{result.testSetName}</TableCell>
                            <TableCell className="whitespace-normal">
                              {result.testCaseName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={result.status === '成功' ? 'outline' : 'destructive'}
                                className={
                                  result.status === '成功' ? 'bg-green-100 text-green-800' : ''
                                }
                              >
                                {result.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={result.similarity} className="w-24" />
                                <span>{result.similarity}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{result.executionTime}ms</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {!isRunning && executionResults.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="rounded-full bg-muted p-6">
                    <RefreshCw className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium">等待执行</h3>
                    <p className="text-sm text-muted-foreground">
                      选择测试集并点击"开始执行"按钮开始测试
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
