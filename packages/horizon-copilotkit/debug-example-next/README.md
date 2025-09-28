# CopilotKit Debug Example Next

基于 `copilot-client` 和 `runtime-next` 的完整调试示例工程。

## 概述

这个示例展示了如何使用 CopilotKit 的下一代架构：

- **前端**: React + TypeScript + Vite，基于 `@copilotkit/copilot-client`
- **后端**: Python + FastAPI，基于 `copilotkit-runtime-next`
- **API架构**: REST API（移除了GraphQL依赖）
- **LLM支持**: OpenAI 和 DeepSeek

## 项目结构

```
debug-example-next/
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── App.tsx       # 主应用组件
│   │   └── main.tsx      # 应用入口
│   ├── package.json      # 前端依赖
│   └── vite.config.ts    # Vite 配置
├── backend/              # Python 后端服务
│   ├── server.py         # FastAPI 服务器
│   └── requirements.txt  # Python 依赖
├── scripts/              # 工具脚本
└── package.json          # 根配置
```

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install-all

# 或者分别安装
npm run install-frontend  # 前端依赖
npm run install-backend   # 后端依赖
```

### 2. 配置环境变量

创建 `backend/.env` 文件：

```bash
# 选择一个或多个
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或者分别启动
npm run dev-backend   # 后端服务 (http://localhost:8000)
npm run dev-frontend  # 前端应用 (http://localhost:5173)
```

### 4. 访问应用

- **前端**: http://localhost:5173
- **后端API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 功能特性

### 前端特性
- ✅ 基于 `@copilotkit/copilot-client`
- ✅ 现代 React 18 + TypeScript
- ✅ Vite 构建工具
- ✅ 实时聊天界面
- ✅ 流式响应支持
- ✅ 错误处理和重试

### 后端特性
- ✅ 基于 `copilotkit-runtime-next`
- ✅ Python + FastAPI
- ✅ OpenAI 和 DeepSeek 适配器
- ✅ REST API 架构
- ✅ 自定义动作支持
- ✅ 流式响应
- ✅ 错误处理和日志

### 示例动作
- 🕐 获取当前时间
- 🧮 数学计算
- 👤 用户信息查询
- 🔧 系统状态检查

## 开发指南

### 添加新的动作

在 `backend/server.py` 中添加新的动作：

```python
def create_weather_action():
    async def get_weather(arguments):
        city = arguments.get("city", "北京")
        return f"今天{city}的天气是晴天，温度25°C"
    
    return Action(
        name="get_weather",
        description="获取指定城市的天气信息",
        parameters=[
            Parameter(
                name="city",
                type=ParameterType.STRING,
                description="城市名称",
                required=True
            )
        ],
        handler=get_weather
    )
```

### 前端组件开发

在 `frontend/src/components/` 中创建新组件：

```tsx
import { useCopilotAction } from "@copilotkit/copilot-client";

export function WeatherWidget() {
  useCopilotAction({
    name: "get_weather",
    description: "获取天气信息",
    parameters: [
      {
        name: "city",
        type: "string",
        description: "城市名称",
        required: true
      }
    ],
    handler: async ({ city }) => {
      // 处理天气查询
      return `${city}的天气信息`;
    }
  });

  return <div>天气组件</div>;
}
```

## 调试技巧

### 后端调试

```bash
# 查看后端日志
npm run dev-backend

# 测试API
npm run health

# 测试特定适配器
npm run test-openai
npm run test-deepseek
```

### 前端调试

```bash
# 开发模式（热重载）
npm run dev-frontend

# 构建生产版本
npm run build-frontend
```

### 网络调试

- 使用浏览器开发工具查看 WebSocket 连接
- 检查 `/api/copilotkit` 端点的请求/响应
- 查看控制台日志和错误信息

## 故障排除

### 常见问题

1. **端口冲突**: 确保 8000 和 5173 端口可用
2. **API密钥**: 检查 `.env` 文件配置
3. **依赖问题**: 删除 `node_modules` 重新安装
4. **CORS错误**: 检查后端CORS配置

### 日志位置

- 前端日志: 浏览器控制台
- 后端日志: 终端输出
- API请求: 网络面板

## 部署

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm run start
```

### Docker 部署
```bash
# 构建镜像
docker build -t copilotkit-debug-next .

# 运行容器
docker run -p 8000:8000 -p 5173:5173 copilotkit-debug-next
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License 