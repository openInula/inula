'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Filter } from 'lucide-react';

// 模拟测试结果数据
const mockResults = [
  {
    id: 'run-1',
    name: '测试运行 #1',
    date: '2023-05-06 14:30',
    version: 'v1.0.0',
    totalTests: 15,
    passedTests: 12,
    failedTests: 3,
    avgSimilarity: 87,
    testSets: ['基础UI组件测试集', '复杂布局测试集'],
  },
  {
    id: 'run-2',
    name: '测试运行 #2',
    date: '2023-05-07 10:15',
    version: 'v1.1.0',
    totalTests: 18,
    passedTests: 15,
    failedTests: 3,
    avgSimilarity: 89,
    testSets: ['基础UI组件测试集', '响应式设计测试集'],
  },
  {
    id: 'run-3',
    name: '测试运行 #3',
    date: '2023-05-07 16:45',
    version: 'v1.1.0',
    totalTests: 12,
    passedTests: 11,
    failedTests: 1,
    avgSimilarity: 92,
    testSets: ['表单交互测试集'],
  },
];

// 模拟详细测试结果数据
const mockDetailedResults = [
  {
    id: 'test-1',
    testSet: '基础UI组件测试集',
    testCase: '登录表单测试',
    status: '通过',
    similarity: 95,
    executionTime: 1250,
    details: {
      expectedComponents: ['form', 'input', 'button'],
      actualComponents: ['form', 'input', 'button'],
      missingComponents: [],
      extraComponents: [],
    },
  },
  {
    id: 'test-2',
    testSet: '基础UI组件测试集',
    testCase: '产品卡片测试',
    status: '通过',
    similarity: 88,
    executionTime: 980,
    details: {
      expectedComponents: ['card', 'image', 'heading', 'text', 'button'],
      actualComponents: ['card', 'image', 'heading', 'text', 'button'],
      missingComponents: [],
      extraComponents: [],
    },
  },
  {
    id: 'test-3',
    testSet: '复杂布局测试集',
    testCase: '电商首页测试',
    status: '失败',
    similarity: 65,
    executionTime: 2100,
    details: {
      expectedComponents: ['header', 'nav', 'main', 'footer', 'product-grid'],
      actualComponents: ['header', 'nav', 'main', 'footer'],
      missingComponents: ['product-grid'],
      extraComponents: [],
    },
  },
];

// 图表数据
const similarityDistribution = [
  { name: '90-100%', value: 8 },
  { name: '80-90%', value: 4 },
  { name: '70-80%', value: 2 },
  { name: '<70%', value: 1 },
];

const componentAccuracy = [
  { name: '表单', accuracy: 95 },
  { name: '按钮', accuracy: 98 },
  { name: '卡片', accuracy: 92 },
  { name: '导航', accuracy: 85 },
  { name: '列表', accuracy: 90 },
  { name: '表格', accuracy: 88 },
];

const COLORS = ['#4ade80', '#22c55e', '#facc15', '#f87171'];

export default function ResultsAnalyzer() {
  const [selectedRun, setSelectedRun] = useState<string>('run-1');
  const [activeTab, setActiveTab] = useState<string>('overview');

  const selectedRunData = mockResults.find((run) => run.id === selectedRun);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">结果分析</h2>
        <div className="flex items-center space-x-2">
          <SimpleSelect
            placeholder="选择测试运行"
            className="w-[350px]"
            value={selectedRun}
            onSelect={setSelectedRun}
            items={mockResults.map((run) => ({
              value: run.id,
              name: `${run.name} - ${run.date}`,
            }))}
          ></SimpleSelect>
          <Button variant="secondary">
            <Filter className="mr-2 h-4 w-4" /> 筛选
          </Button>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" /> 导出
          </Button>
        </div>
      </div>

      {selectedRunData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总测试数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedRunData.totalTests}</div>
              <p className="text-xs text-muted-foreground">{selectedRunData.testSets.join(', ')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">通过率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((selectedRunData.passedTests / selectedRunData.totalTests) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedRunData.passedTests} 通过 / {selectedRunData.failedTests} 失败
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">平均相似度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedRunData.avgSimilarity}%</div>
              <p className="text-xs text-muted-foreground">与预期结果的平均相似度</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Agent版本</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedRunData.version}</div>
              <p className="text-xs text-muted-foreground">{selectedRunData.date}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="details">详细结果</TabsTrigger>
          <TabsTrigger value="comparison">版本对比</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>相似度分布</CardTitle>
                <CardDescription>测试结果相似度分布情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={similarityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {similarityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>组件准确率</CardTitle>
                <CardDescription>各类组件生成准确率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={componentAccuracy}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="accuracy" name="准确率" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>测试结果摘要</CardTitle>
              <CardDescription>测试运行的主要问题和成功点</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">主要问题</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>复杂布局中的产品网格组件缺失 (相似度: 65%)</li>
                    <li>响应式设计在移动视图中存在溢出问题</li>
                    <li>表单验证逻辑与预期不符</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">成功点</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>基础UI组件生成准确率高 (平均相似度: 92%)</li>
                    <li>按钮和表单元素的样式与预期一致</li>
                    <li>导航组件结构正确</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>详细测试结果</CardTitle>
              <CardDescription>查看每个测试用例的详细结果</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>测试集</TableHead>
                    <TableHead>测试用例</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>相似度</TableHead>
                    <TableHead>执行时间</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDetailedResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.testSet}</TableCell>
                      <TableCell>{result.testCase}</TableCell>
                      <TableCell>
                        <Badge
                          variant={result.status === '通过' ? 'outline' : 'destructive'}
                          className={result.status === '通过' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.similarity}%</TableCell>
                      <TableCell>{result.executionTime}ms</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>版本对比</CardTitle>
              <CardDescription>比较不同版本的Agent性能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'v1.0.0',
                        通过率: 80,
                        平均相似度: 87,
                        执行时间: 1500,
                      },
                      {
                        name: 'v1.1.0',
                        通过率: 83,
                        平均相似度: 89,
                        执行时间: 1400,
                      },
                      {
                        name: 'v1.2.0-beta',
                        通过率: 92,
                        平均相似度: 94,
                        执行时间: 1200,
                      },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="通过率" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="平均相似度" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-medium">版本改进分析</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>指标</TableHead>
                      <TableHead>v1.0.0</TableHead>
                      <TableHead>v1.1.0</TableHead>
                      <TableHead>v1.2.0-beta</TableHead>
                      <TableHead>变化</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>通过率</TableCell>
                      <TableCell>80%</TableCell>
                      <TableCell>83%</TableCell>
                      <TableCell>92%</TableCell>
                      <TableCell className="text-green-600">+12%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>平均相似度</TableCell>
                      <TableCell>87%</TableCell>
                      <TableCell>89%</TableCell>
                      <TableCell>94%</TableCell>
                      <TableCell className="text-green-600">+7%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>平均执行时间</TableCell>
                      <TableCell>1500ms</TableCell>
                      <TableCell>1400ms</TableCell>
                      <TableCell>1200ms</TableCell>
                      <TableCell className="text-green-600">-300ms</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
