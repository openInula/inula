# Function RAG System 使用示例

本目录包含了 Function RAG System 的各种使用示例，帮助您快速了解和使用系统的不同功能。

## 示例列表

### 1. 基础使用 (`basic_usage.py`)
**适用人群**: 初学者，首次接触 Function RAG System 的用户

**功能展示**:
- 系统初始化和配置
- 添加示例函数（数学、文本、数组处理）
- 基本搜索功能演示
- 按类别和相似度搜索
- 系统健康检查和统计信息

**运行方式**:
```bash
cd CopilotKit/packages/function-rag-py/examples
python basic_usage.py
```

### 2. API 客户端 (`api_client_example.py`)
**适用人群**: 需要通过 HTTP API 与系统交互的开发者

**功能展示**:
- HTTP 客户端实现
- 完整的 REST API 操作（添加、搜索、获取、删除函数）
- 高级搜索和过滤器使用
- 错误处理和异常管理
- 性能监控

**运行方式**:
```bash
# 首先启动 Function RAG System 服务
python main.py

# 在另一个终端运行客户端示例
python examples/api_client_example.py
```

**前置条件**: 确保 Function RAG System 服务在 `http://localhost:8000` 运行

### 3. 批量操作 (`batch_operations.py`)
**适用人群**: 需要批量处理大量函数的用户

**功能展示**:
- 批量添加不同类别的函数
- 数学函数集合（求和、乘积、平均值）
- 文本处理函数集合（格式化、清理、分析）
- 工具函数集合（验证、生成、时间处理）
- 批量搜索验证和统计分析
- 错误处理和数据清理

**运行方式**:
```bash
python examples/batch_operations.py
```

### 4. 搜索策略 (`search_strategies.py`)
**适用人群**: 需要深入理解搜索机制的高级用户

**功能展示**:
- 语义搜索：理解用户意图的自然语言搜索
- 关键词搜索：基于标签和关键词的精确匹配
- 类别搜索：按函数分类浏览
- 高级过滤器：组合多种搜索条件
- 相似性搜索：基于函数特征的推荐
- 搜索性能分析和结果统计

**运行方式**:
```bash
python examples/search_strategies.py
```

### 5. 集成示例 (`integration_example.py`)
**适用人群**: 计划将 Function RAG System 集成到实际应用的开发者

**功能展示**:
- 智能函数推荐器实现
- 聊天机器人集成演示
- 意图识别和实体提取
- 参数建议和推荐理由生成
- Web API 集成场景
- 对话历史分析和日志导出

**运行方式**:
```bash
python examples/integration_example.py
```

**特色功能**:
- 模拟聊天机器人对话
- 自动生成 `conversation_log.json` 对话日志
- API 集成模式演示

### 6. Collection删除示例 (`delete_collection_example.py`)
**适用人群**: 需要管理向量数据库collection的管理员和高级用户

**功能展示**:
- Collection状态检查和统计
- 安全的collection删除操作（自动重建）
- 手动collection删除（不重建）
- 删除前后的数据验证
- Collection管理最佳实践说明
- 操作风险和注意事项

**运行方式**:
```bash
python examples/delete_collection_example.py
```

**⚠️ 重要警告**:
- 此操作将永久删除所有存储的函数数据
- 建议在测试环境中运行
- 生产环境使用前请备份重要数据

## 环境配置

在运行示例之前，请确保：

1. **安装依赖**:
```bash
cd CopilotKit/packages/function-rag-py
pip install -r requirements.txt
```

2. **配置环境变量**:
```bash
cp .env.example .env
# 编辑 .env 文件，设置您的 API 密钥
```

3. **启动 Qdrant 向量数据库**:
```bash
# 使用 Docker
docker run -p 6333:6333 qdrant/qdrant:latest

# 或使用 Docker Compose
docker-compose up -d qdrant
```

## 快速开始

如果您是第一次使用，建议按以下顺序运行示例：

1. 🚀 **从基础开始**: `python basic_usage.py`
   - 了解核心概念和基本操作

2. 🔍 **深入搜索**: `python search_strategies.py`
   - 掌握各种搜索技巧

3. 📦 **批量操作**: `python batch_operations.py`
   - 学习如何高效管理大量函数

4. 🌐 **API 交互**: `python api_client_example.py`
   - 了解 HTTP API 的使用方法

5. 🤖 **实际集成**: `python integration_example.py`
   - 看看如何集成到实际应用中

6. 🗑️ **管理数据**: `python delete_collection_example.py`
   - 学习如何安全地删除和重建collection

## 示例数据

**数据管理**: 所有示例都包含自动数据清理功能：
- ✅ **运行前自动清理**: 每次运行都会删除所有旧数据，确保结果一致
- ✅ **避免数据累积**: 防止重复数据造成的混乱和统计错误
- ✅ **准确的测试结果**: 提供正确的函数统计（如"总函数数: 3"）

**手动清理数据**:
```python
# 在代码中手动清理
await rag_system.clear_all_functions()
```

## 常见问题

### Q: 示例运行失败，提示配置错误？
A: 请检查 `.env` 文件配置，确保：
- API 密钥正确设置
- Qdrant 数据库正常运行
- 网络连接正常

### Q: 搜索结果不理想？
A: 可以尝试：
- 调整搜索权重配置
- 增加更多示例函数
- 使用不同的搜索策略

### Q: 如何自定义示例？
A: 您可以：
- 修改现有示例中的函数定义
- 添加自己的测试查询
- 调整搜索参数和配置

### Q: 可以在生产环境中使用这些代码吗？
A: 这些示例主要用于学习和演示，生产环境使用前请：
- 添加适当的错误处理
- 实现日志记录
- 考虑安全性和性能优化
- 进行充分测试

## 贡献

欢迎贡献更多示例！如果您有好的使用案例或发现了 bug，请：
1. 提交 Issue 描述问题或建议
2. 提交 Pull Request 贡献代码
3. 完善文档和注释

## 技术支持

如果您在使用过程中遇到问题：
1. 查看示例代码中的注释和错误处理
2. 检查系统日志和健康状态
3. 参考主项目的 README.md
4. 在 GitHub 上提交 Issue

---

祝您使用愉快！🎉