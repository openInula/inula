# Function Generator Backend

Express.js 后端服务，提供 Function 生成、Playwright 录制等服务。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量配置文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的设置：

```bash
# Node.js Configuration
NODE_ENV=development

# Server Configuration  
SERVER_PORT=5000
HOST=localhost

# DeepSeek 配置  
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_MODEL=deepseek-chat

# Playwright Configuration
PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH}

# Logging
LOG_LEVEL=info
```

### 3. 启动服务

#### 开发模式（自动重启）

```bash
npm run dev
```

#### 生产模式

```bash
npm start
```

## API 端点

### Playwright 录制相关

- `POST /api/playwright/record` - 启动 Playwright 录制
- `POST /api/playwright/check-script` - 检查录制的脚本
- `POST /api/playwright/install` - 安装 Playwright 浏览器

### Function Generator 相关（待实现）

- `POST /api/generate-function` - 生成 LLM Function 定义和 Executor 代码
- `POST /api/rag/store` - 存储到 RAG 数据库
- `GET /api/export/:type` - 导出文件

### 健康检查

- `GET /api/health` - 健康检查接口

## 项目结构

```
backend/
├── server.js           # 主服务器文件
├── package.json        # 依赖配置
├── .env               # 环境变量（不提交到 git）
├── .env.example       # 环境变量模板
├── access.log         # 访问日志
└── README.md          # 说明文档
```

## 依赖包

- **express** - Web 框架
- **cors** - 跨域支持
- **dotenv** - 环境变量管理
- **playwright** - 浏览器自动化
- **winston** - 日志记录
- **express-rate-limit** - 速率限制

## 开发依赖

- **nodemon** - 开发时自动重启

## 特性

- ✅ **完整的日志记录** - 使用 Winston 进行结构化日志
- ✅ **CORS 支持** - 允许前端跨域访问
- ✅ **速率限制** - 防止 API 滥用
- ✅ **错误处理** - 全局错误捕获和处理
- ✅ **环境配置** - 使用 dotenv 管理配置
- ✅ **优雅关闭** - 处理 SIGTERM/SIGINT 信号
- ✅ **Playwright 集成** - 支持浏览器录制功能

## 日志

服务器会将访问日志保存到 `access.log` 文件中，同时在控制台输出彩色日志。

日志格式包括：
- 时间戳
- 日志级别
- 消息内容
- 请求相关信息（IP、User-Agent、响应时间等）

## 健康检查

访问 `GET /api/health` 可以检查服务状态：

```json
{
  "status": "healthy",
  "service": "function-generator-backend",
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```