#!/bin/bash

echo "🚀 启动Smart Components示例..."

# 检查是否在正确目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在smart-components-lib根目录下运行此脚本"
    exit 1
fi

# 构建组件库
echo "📦 构建组件库..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 组件库构建失败"
    exit 1
fi

# 进入示例目录并启动
echo "🌟 启动示例应用..."
cd example

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📥 安装示例项目依赖..."
    npm install
fi

# 启动开发服务器
echo "🎉 在 http://localhost:3000 启动示例应用"
npm start