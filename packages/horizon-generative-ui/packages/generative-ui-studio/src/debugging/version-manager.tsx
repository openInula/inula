"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, GitBranch, GitMerge, GitCommit, Clock } from "lucide-react"
import { Button } from "@/components/base/button"
import  Input  from "@/components/base/input"
import { Textarea } from "@/components/base/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// 模拟版本数据
const initialVersions = [
  {
    id: "v1.0.0",
    name: "v1.0.0",
    description: "初始稳定版本",
    status: "已发布",
    date: "2023-04-15",
    author: "张三",
    changes: ["实现基础UI组件生成", "支持简单布局结构", "添加表单元素生成"],
    metrics: {
      passRate: 80,
      avgSimilarity: 85,
      executionTime: 1500,
    },
  },
  {
    id: "v1.1.0",
    name: "v1.1.0",
    description: "功能增强版本",
    status: "已发布",
    date: "2023-05-01",
    author: "李四",
    changes: ["改进响应式布局生成", "优化表单验证逻辑", "添加更多组件类型支持"],
    metrics: {
      passRate: 85,
      avgSimilarity: 88,
      executionTime: 1400,
    },
  },
  {
    id: "v1.2.0-beta",
    name: "v1.2.0-beta",
    description: "Beta测试版本",
    status: "测试中",
    date: "2023-05-06",
    author: "王五",
    changes: ["实现复杂交互组件生成", "支持嵌套布局结构", "添加动画效果生成", "优化代码质量和性能"],
    metrics: {
      passRate: 92,
      avgSimilarity: 94,
      executionTime: 1200,
    },
  },
]

// 模拟部署历史
const deploymentHistory = [
  {
    id: "deploy-1",
    version: "v1.0.0",
    environment: "生产环境",
    date: "2023-04-16 10:30",
    status: "成功",
    deployedBy: "张三",
  },
  {
    id: "deploy-2",
    version: "v1.1.0",
    environment: "生产环境",
    date: "2023-05-02 14:15",
    status: "成功",
    deployedBy: "李四",
  },
  {
    id: "deploy-3",
    version: "v1.2.0-beta",
    environment: "测试环境",
    date: "2023-05-06 16:45",
    status: "成功",
    deployedBy: "王五",
  },
]

export default function VersionManager() {
  const [versions, setVersions] = useState(initialVersions)
  const [selectedVersion, setSelectedVersion] = useState<string | null>("v1.2.0-beta")
  const [isAddingVersion, setIsAddingVersion] = useState(false)
  const [newVersion, setNewVersion] = useState({
    name: "",
    description: "",
    changes: "",
  })
  const [activeTab, setActiveTab] = useState("details")

  const handleAddVersion = () => {
    if (newVersion.name.trim() === "") return

    const newId = newVersion.name.trim()
    setVersions([
      ...versions,
      {
        id: newId,
        name: newVersion.name,
        description: newVersion.description,
        status: "开发中",
        date: new Date().toISOString().split("T")[0],
        author: "当前用户",
        changes: newVersion.changes.split("\n").filter((change) => change.trim() !== ""),
        metrics: {
          passRate: 0,
          avgSimilarity: 0,
          executionTime: 0,
        },
      },
    ])
    setNewVersion({ name: "", description: "", changes: "" })
    setIsAddingVersion(false)
    setSelectedVersion(newId)
  }

  const handleDeleteVersion = (id: string) => {
    setVersions(versions.filter((version) => version.id !== id))
    if (selectedVersion === id) {
      setSelectedVersion(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">版本管理</h2>
        <Button onClick={() => setIsAddingVersion(true)}>
          <Plus className="mr-2 h-4 w-4" /> 新建版本
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>版本列表</CardTitle>
              <CardDescription>管理Agent的不同版本</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedVersion === version.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedVersion(version.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{version.name}</div>
                        <Badge
                          variant={
                            version.status === "已发布"
                              ? "outline"
                              : version.status === "测试中"
                                ? "secondary"
                                : "default"
                          }
                          className={version.status === "已发布" ? "bg-green-100 text-green-800" : ""}
                        >
                          {version.status}
                        </Badge>
                      </div>
                      <div className="text-xs mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {version.date}
                      </div>
                      <div className="text-xs mt-1">{version.description}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedVersion ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <GitBranch className="h-5 w-5 mr-2" />
                      {versions.find((version) => version.id === selectedVersion)?.name}
                      <Badge variant="outline" className="ml-2">
                        {versions.find((version) => version.id === selectedVersion)?.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {versions.find((version) => version.id === selectedVersion)?.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> 编辑
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteVersion(selectedVersion)}>
                      <Trash2 className="h-4 w-4 mr-2" /> 删除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">详情</TabsTrigger>
                    <TabsTrigger value="metrics">性能指标</TabsTrigger>
                    <TabsTrigger value="deployments">部署历史</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">版本信息</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">创建日期:</span>
                            <span>{versions.find((version) => version.id === selectedVersion)?.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">创建者:</span>
                            <span>{versions.find((version) => version.id === selectedVersion)?.author}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">状态:</span>
                            <span>{versions.find((version) => version.id === selectedVersion)?.status}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">操作</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <GitCommit className="h-4 w-4 mr-2" /> 提交更改
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <GitMerge className="h-4 w-4 mr-2" /> 合并到主分支
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">变更记录</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {versions
                          .find((version) => version.id === selectedVersion)
                          ?.changes.map((change, index) => (
                            <li key={index}>{change}</li>
                          ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="metrics" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">通过率</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {versions.find((version) => version.id === selectedVersion)?.metrics.passRate}%
                          </div>
                          <p className="text-xs text-muted-foreground">测试用例通过率</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">平均相似度</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {versions.find((version) => version.id === selectedVersion)?.metrics.avgSimilarity}%
                          </div>
                          <p className="text-xs text-muted-foreground">与预期结果的平均相似度</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">平均执行时间</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {versions.find((version) => version.id === selectedVersion)?.metrics.executionTime}ms
                          </div>
                          <p className="text-xs text-muted-foreground">测试用例平均执行时间</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>性能趋势</CardTitle>
                        <CardDescription>版本性能指标随时间变化趋势</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={versions.map((v) => ({
                                name: v.name,
                                通过率: v.metrics.passRate,
                                平均相似度: v.metrics.avgSimilarity,
                                执行时间: v.metrics.executionTime / 20,
                              }))}
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
                              <Bar dataKey="执行时间" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="deployments" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>部署历史</CardTitle>
                        <CardDescription>版本部署记录</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>版本</TableHead>
                              <TableHead>环境</TableHead>
                              <TableHead>部署时间</TableHead>
                              <TableHead>部署人</TableHead>
                              <TableHead>状态</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deploymentHistory
                              .filter((deploy) => deploy.version === selectedVersion)
                              .map((deploy) => (
                                <TableRow key={deploy.id}>
                                  <TableCell>{deploy.version}</TableCell>
                                  <TableCell>{deploy.environment}</TableCell>
                                  <TableCell>{deploy.date}</TableCell>
                                  <TableCell>{deploy.deployedBy}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={deploy.status === "成功" ? "outline" : "destructive"}
                                      className={deploy.status === "成功" ? "bg-green-100 text-green-800" : ""}
                                    >
                                      {deploy.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">部署到生产环境</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium">未选择版本</h3>
                <p className="text-muted-foreground">请从左侧选择一个版本或创建新的版本</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加版本对话框 */}
      <Dialog open={isAddingVersion} onOpenChange={setIsAddingVersion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建版本</DialogTitle>
            <DialogDescription>创建一个新的Agent版本</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                版本号
              </label>
              <Input
                id="name"
                placeholder="例如: v1.3.0"
                value={newVersion.name}
                onChange={(e) => setNewVersion({ ...newVersion, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                描述
              </label>
              <Textarea
                id="description"
                placeholder="输入版本描述"
                value={newVersion.description}
                onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="changes" className="text-sm font-medium">
                变更记录 (每行一条)
              </label>
              <Textarea
                id="changes"
                placeholder="输入变更记录，每行一条"
                className="min-h-[100px]"
                value={newVersion.changes}
                onChange={(e) => setNewVersion({ ...newVersion, changes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingVersion(false)}>
              取消
            </Button>
            <Button onClick={handleAddVersion}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
