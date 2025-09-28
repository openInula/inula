# 🚀 快速启动指南

## 一键启动

### 1. 安装依赖
```bash
./scripts/setup.sh
```

### 2. 配置API密钥
编辑 `backend/.env` 文件，添加您的API密钥：
```bash
# 选择一个或多个
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
- **前端**: http://localhost:5173
- **后端API**: http://localhost:8000/docs

## 测试功能

### 基本对话
1. 打开 http://localhost:5173
2. 在聊天框中输入："你好，请介绍一下自己"
3. 查看AI助手的回复

### 测试动作
尝试以下命令：
- "现在几点了？"
- "计算 15*8+24"
- "查看我的用户信息"
- "检查系统状态"

### 快速按钮
使用右侧的快速操作按钮直接触发特定功能。

## 故障排除

### 后端启动失败
```bash
# 检查Python依赖
cd backend
pip install -r requirements.txt

# 检查API密钥
cat .env
```

### 前端启动失败
```bash
# 重新安装依赖
cd frontend
rm -rf node_modules
npm install
```

### 端口冲突
- 后端默认端口: 8000
- 前端默认端口: 5173

如需修改端口，编辑相应配置文件。

## 开发指南

### 添加新动作
1. 编辑 `backend/server.py`
2. 在 `create_demo_actions()` 中添加新动作
3. 重启后端服务器

### 修改前端界面
1. 编辑 `frontend/src/components/HomePage.tsx`
2. 添加新的 `useCopilotAction` 或修改UI
3. 前端支持热重载

### 查看日志
- 后端日志: 在启动后端的终端窗口中查看
- 前端日志: 浏览器开发者工具控制台

## 性能优化

### 生产环境部署
```bash
# 构建前端
npm run build-frontend

# 生产模式启动
npm run start
```

### 监控和调试
- 使用 `/health` 端点监控后端状态
- 启用 `showDevConsole` 查看CopilotKit调试信息
- 查看网络面板了解API调用情况

## 更多资源

- [完整文档](./README.md)
- [CopilotKit官方文档](https://docs.copilotkit.ai)
- [故障排除指南](./README.md#故障排除) 