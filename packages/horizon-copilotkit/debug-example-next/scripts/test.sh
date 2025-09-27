#!/bin/bash

# CopilotKit Debug Example Next Test Script
echo "🧪 测试 CopilotKit Debug Example Next..."

# 测试后端健康检查
echo "🔍 测试后端健康检查..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端健康检查通过"
    
    # 获取后端状态
    echo "📊 后端状态:"
    curl -s http://localhost:8000/health | python -m json.tool
    echo ""
else
    echo "❌ 后端健康检查失败 - 请确保后端服务器正在运行"
    exit 1
fi

# 测试API文档
echo "📚 测试API文档..."
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "✅ API文档可访问"
else
    echo "❌ API文档不可访问"
fi

# 测试前端
echo "🌐 测试前端..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 前端应用可访问"
else
    echo "❌ 前端应用不可访问 - 请确保前端服务器正在运行"
fi

# 测试CopilotKit端点
echo "🤖 测试CopilotKit端点..."
RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/copilotkit)
if [ "$RESPONSE" = "405" ] || [ "$RESPONSE" = "422" ]; then
    echo "✅ CopilotKit端点响应正常 (HTTP $RESPONSE)"
else
    echo "⚠️  CopilotKit端点响应异常 (HTTP $RESPONSE)"
fi

echo ""
echo "🎉 测试完成！"
echo ""
echo "如果所有测试都通过，您可以："
echo "1. 访问前端应用: http://localhost:5173"
echo "2. 查看API文档: http://localhost:8000/docs"
echo "3. 开始与AI助手聊天"
echo "" 