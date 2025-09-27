#!/bin/bash

# CopilotKit Debug Example Next Development Script
echo "🚀 启动 CopilotKit Debug Example Next 开发环境..."

# 检查环境变量
if [ ! -f "backend/.env" ]; then
    echo "❌ 未找到 backend/.env 文件"
    echo "请先运行: ./scripts/setup.sh"
    exit 1
fi

# 检查API密钥
if ! grep -q "OPENAI_API_KEY\|DEEPSEEK_API_KEY" backend/.env; then
    echo "⚠️  警告: 未在 backend/.env 中找到 API 密钥"
    echo "请确保配置了 OPENAI_API_KEY 或 DEEPSEEK_API_KEY"
fi

echo "✅ 环境检查完成"

# 启动开发服务器
echo "🔄 启动前后端服务器..."

# 在后台启动后端
echo "🐍 启动 Python 后端服务器..."
cd backend
python server.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务器启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务器启动成功"
else
    echo "❌ 后端服务器启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端
echo "⚛️  启动 React 前端服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 开发环境启动完成！"
echo ""
echo "服务地址："
echo "- 前端应用: http://localhost:5173"
echo "- 后端API: http://localhost:8000"
echo "- API文档: http://localhost:8000/docs"
echo "- 健康检查: http://localhost:8000/health"
echo ""
echo "按 Ctrl+C 停止服务器"

# 清理函数
cleanup() {
    echo ""
    echo "🛑 停止服务器..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# 捕获退出信号
trap cleanup SIGINT SIGTERM

# 等待
wait 