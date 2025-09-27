# CopilotKit 集成审批系统使用说明

## 🎯 概述

已成功将人工审批系统集成到 CopilotKit copilot-server 中，实现了工具调用的人工审批功能。现在任何使用 CopilotKit 的项目都可以轻松启用审批系统。

## 🚀 快速开始

### 1. 启动集成版服务器

```bash
cd backend
python server_integrated.py
```

服务器将在 `http://localhost:8005` 启动，包含以下端点：

- **API文档**: `http://localhost:8005/docs`
- **健康检查**: `http://localhost:8005/api/copilotkit/api/health`
- **聊天端点**: `http://localhost:8005/api/copilotkit/api/chat/stream`
- **审批管理**: `http://localhost:8005/api/copilotkit/api/approvals/*`

### 2. 打开 Web 管理界面

在浏览器中打开：`backend/approval_dashboard_integrated.html`

### 3. 测试审批流程

1. 与 AI 对话，让它调用需要审批的工具：
   - "帮我计算 2+3*4"（会触发 `calculate` 工具）
   - "检查系统状态"（会触发 `check_status` 工具）

2. AI 会返回审批提示消息，包含审批ID

3. 在 Web 管理界面中查看和处理审批请求

## 📋 集成架构

### 核心组件

1. **ApprovalManager**: 单例审批管理器
   - 管理待审批请求
   - 处理审批决策
   - 执行原始工具调用

2. **ApprovalMiddleware**: 审批中间件
   - 配置哪些工具需要审批
   - 自动包装需要审批的工具
   - 创建审批包装器

3. **CopilotRuntime**: 增强的运行时
   - 支持审批系统配置
   - 自动应用审批中间件
   - 无缝集成到现有工作流

4. **FastAPI 集成**: 增强的 API
   - 自动添加审批端点
   - 完整的 REST API
   - Web 管理界面支持

### 工作流程

```
用户请求 → AI 判断工具调用 → 审批中间件检查 → 
需要审批？
├─ 是 → 创建审批请求 → 返回审批提示 → 人工审批 → 执行工具
└─ 否 → 直接执行工具 → 返回结果
```

## 🔧 在项目中使用

### 基础用法

```python
from copilotkit_runtime.lib.runtime.copilot_runtime import (
    CopilotRuntime, CopilotRuntimeConstructorParams
)
from copilotkit_runtime.lib.integrations.fastapi_integration import create_copilot_app

# 创建带审批系统的运行时
runtime_params = CopilotRuntimeConstructorParams(
    actions=your_actions,
    enable_approval_system=True,  # 启用审批系统
    approval_required_actions=["sensitive_tool", "dangerous_action"]  # 需要审批的工具
)

runtime = CopilotRuntime(runtime_params)

# 创建应用（自动包含审批API）
app = create_copilot_app(runtime, service_adapter)
```

### 高级配置

```python
from copilotkit_runtime.lib.approval import ApprovalMiddleware

# 手动创建审批中间件
approval_middleware = ApprovalMiddleware(
    approval_required_tools={"tool1", "tool2", "tool3"}
)

# 动态添加需要审批的工具
approval_middleware.add_approval_required_tool("new_tool")

# 在运行时配置中使用
runtime_params = CopilotRuntimeConstructorParams(
    actions=actions,
    enable_approval_system=True,
    approval_required_actions=list(approval_middleware.approval_required_tools)
)
```

## 🔌 API 端点

### 审批管理 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/approvals/pending` | 获取待审批请求列表 |
| POST | `/api/approvals/approve` | 审批工具调用 |
| DELETE | `/api/approvals/{approval_id}` | 取消审批请求 |
| GET | `/api/approvals/status` | 获取审批系统状态 |

### 审批请求格式

```json
{
  "approval_id": "uuid-string",
  "approved": true
}
```

### 审批响应格式

```json
{
  "approval_id": "uuid-string",
  "status": "approved_and_executed",
  "result": "工具执行结果",
  "error": null
}
```

## 🎮 Web 管理界面

集成版审批管理界面提供：

- **实时状态监控**: 系统状态、待审批数量
- **审批请求管理**: 查看、批准、拒绝请求
- **操作日志**: 完整的审批操作记录
- **自动刷新**: 可选的自动数据刷新
- **快捷操作**: 键盘快捷键支持

### 使用技巧

1. **Ctrl/Cmd + R**: 快速刷新数据
2. **自动刷新**: 点击"自动刷新"按钮启用每5秒自动更新
3. **API文档**: 点击"API文档"按钮查看完整API文档

## ⚙️ 配置选项

### CopilotRuntime 配置

```python
CopilotRuntimeConstructorParams(
    # 基础配置
    actions=actions_list,
    service_adapter=your_adapter,
    
    # 审批系统配置
    enable_approval_system=True,           # 启用审批系统
    approval_required_actions=[            # 需要审批的工具列表
        "calculate",
        "check_status", 
        "dangerous_operation"
    ]
)
```

### FastAPI 集成配置

```python
app = create_copilot_app(
    runtime=runtime,
    service_adapter=adapter,
    prefix="/api/copilotkit",             # API前缀
    cors_origins=["*"],                   # CORS设置
    title="Your App with Approval",      # API标题
    version="1.0.0"                      # 版本
)
```

## 🔒 安全考虑

1. **工具分类**: 将工具分为需要审批和无需审批两类
2. **审批权限**: 确保只有授权人员可以访问审批接口
3. **审计日志**: 所有审批操作都有完整日志记录
4. **超时处理**: 考虑为待审批请求设置超时机制

## 📊 监控和日志

### 结构化日志

系统使用 `structlog` 提供结构化日志：

```python
logger.info("工具调用需要审批",
    tool_name=tool_name,
    approval_id=approval_id,
    arguments=arguments
)
```

### 关键指标

- 待审批请求数量
- 审批通过率
- 平均审批时间
- 工具调用成功率

## 🚨 故障排除

### 常见问题

1. **审批系统未启动**
   - 检查 `enable_approval_system=True`
   - 确认 `approval_required_actions` 不为空

2. **工具未被拦截**
   - 确认工具名称在 `approval_required_actions` 中
   - 检查中间件是否正确应用

3. **审批接口404**
   - 确认API前缀配置正确
   - 检查路由注册

### 调试模式

启用详细日志：

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔄 版本兼容性

- **Python**: >= 3.8
- **CopilotKit Runtime**: >= 1.8.15
- **FastAPI**: >= 0.100.0
- **Pydantic**: >= 2.0

## 📚 相关资源

- [CopilotKit 官方文档](https://docs.copilotkit.ai/)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [审批系统设计原理](./approval_system_design.md)

## 🎉 结论

集成审批系统成功地将人工审批功能无缝集成到 CopilotKit copilot-server 中，提供了：

- **零侵入性**: 现有代码无需修改
- **灵活配置**: 可自由选择哪些工具需要审批
- **完整API**: 提供完整的REST API和Web界面
- **高可用性**: 基于成熟的FastAPI框架
- **易于扩展**: 支持自定义审批逻辑和界面

这个系统为AI应用提供了必要的人工控制点，确保敏感操作得到适当的人工监督。