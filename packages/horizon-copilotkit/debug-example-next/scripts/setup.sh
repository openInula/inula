#!/bin/bash

# CopilotKit Debug Example Next Setup Script
echo "🚀 设置 CopilotKit Debug Example Next..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python 未安装，请先安装 Python 3.9+"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查pip
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo "❌ pip 未安装，请先安装 pip"
    exit 1
fi

echo "✅ 依赖检查完成"

# 安装根依赖
echo "📦 安装根目录依赖..."
npm install

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install
cd ..

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
pip install -r requirements.txt
cd ..

# 检查环境变量
echo "🔍 检查环境变量..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  未找到 backend/.env 文件"
    echo "📝 复制示例配置文件..."
    cp backend/env.example backend/.env
    echo "✏️  请编辑 backend/.env 文件，添加您的 API 密钥"
fi

echo ""
echo "🎉 设置完成！"
echo ""
echo "接下来的步骤："
echo "1. 编辑 backend/.env 文件，添加您的 API 密钥"
echo "   - OPENAI_API_KEY=your_openai_api_key_here"
echo "   - 或 DEEPSEEK_API_KEY=your_deepseek_api_key_here"
echo ""
echo "2. 启动开发服务器："
echo "   npm run dev"
echo ""
echo "3. 访问应用："
echo "   - 前端: http://localhost:5173"
echo "   - 后端API: http://localhost:8000"
echo "   - API文档: http://localhost:8000/docs"
echo "" 