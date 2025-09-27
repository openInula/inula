# Function RAG System (Python)

一个全面的 RAG（检索增强生成）系统，用于存储和查询 LLM 函数，具有多阶段混合搜索功能。

## 功能特性

- **多层向量嵌入**：为函数的不同方面生成语义嵌入（主要描述、详细信息、使用场景、关键词）
- **混合搜索**：结合语义、关键词和基于类别的搜索，支持可配置权重
- **向量存储**：使用 Qdrant 进行高效的相似度搜索和存储
- **REST API**：基于 FastAPI 的完整 REST API 端点
- **DeepSeek 支持**：兼容 DeepSeek 和 OpenAI 嵌入 API
- **批量操作**：支持批量函数添加和处理
- **健康监控**：全面的健康检查和系统统计
- **可配置**：通过环境变量进行灵活配置

## 快速开始

### 1. 安装

```bash
# 克隆仓库
git clone <repository-url>
cd function-rag

# 安装依赖
pip install -r requirements.txt
```

### 2. 环境配置

```bash
# 复制环境配置模板
cp .env.example .env

# 编辑 .env 配置文件
# 设置你的 DeepSeek 或 OpenAI API 密钥
DEEPSEEK_API_KEY="your-api-key-here"
```

### 3. 启动 Qdrant（向量数据库）

```bash
# 使用 Docker
docker run -p 6333:6333 qdrant/qdrant:latest

# 或使用 Docker Compose（如果可用）
docker-compose up -d qdrant
```

### 4. 运行应用

```bash
# 开发模式
python main.py

# 或直接使用 uvicorn
uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload
```

API 将在以下地址可用：
- 主 API：http://localhost:8000
- 交互式文档：http://localhost:8000/docs
- ReDoc 文档：http://localhost:8000/redoc

## API 端点

### 函数管理

- `POST /functions/` - 添加新函数
- `POST /functions/batch` - 批量添加函数
- `GET /functions/{function_id}` - 根据 ID 获取函数
- `DELETE /functions/{function_id}` - 删除函数

### 搜索

- `POST /functions/search` - 使用详细请求搜索函数
- `GET /functions/search?q=query` - 通过查询参数进行简单搜索
- `GET /functions/{function_id}/similar` - 获取相似函数
- `GET /functions/category/{category}` - 按类别获取函数

### 健康检查和统计

- `GET /health/` - 综合健康检查
- `GET /health/stats` - 系统统计信息
- `GET /health/ready` - 就绪探针
- `GET /health/alive` - 存活探针

## 配置

所有配置都可以通过环境变量完成。查看 `.env.example` 了解可用选项：

### 主要配置选项

- **EMBEDDING_PROVIDER**：选择 "deepseek" 或 "openai"
- **EMBEDDING_MODEL**：用于生成嵌入的模型
- **VECTOR_DB_URL**：Qdrant 数据库 URL
- **RETRIEVAL_*_WEIGHT**：配置混合搜索权重

## 使用示例

### 添加函数

```bash
curl -X POST "http://localhost:8000/functions/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "calculate_sum",
    "description": "计算两个数字的和",
    "category": "math",
    "parameters": {
      "a": {"type": "number", "description": "第一个数字", "required": true},
      "b": {"type": "number", "description": "第二个数字", "required": true}
    },
    "examples": [
      {"input": "calculate_sum(2, 3)", "output": "5"}
    ],
    "tags": ["数学", "算术", "计算器"]
  }'
```

### 搜索函数

```bash
# 简单搜索
curl "http://localhost:8000/functions/search?q=计算数字&limit=5"

# 高级搜索
curl -X POST "http://localhost:8000/functions/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "我需要一个将两个数字相加的函数",
    "limit": 10,
    "include_scores": true
  }'
```

### 健康检查

```bash
curl "http://localhost:8000/health/"
```

## 架构

系统由几个关键组件组成：

1. **嵌入服务**：使用 OpenAI 兼容 API 生成向量嵌入
2. **向量存储**：使用 Qdrant 管理函数存储和检索
3. **检索引擎**：带查询处理的多阶段混合搜索
4. **RAG 系统**：协调所有组件的主要编排器
5. **FastAPI 应用**：具有完整端点的 REST API 层

## 开发

### 项目结构

```
app/
├── __init__.py
├── api/                 # FastAPI 应用
│   ├── main.py
│   └── routes/
├── core/                # 核心业务逻辑
│   ├── config.py
│   └── rag_system.py
├── models/              # Pydantic 模型
│   ├── schemas.py
│   └── function_model.py
├── services/            # 业务服务
│   ├── embedding_service.py
│   ├── vector_storage.py
│   └── retrieval_engine.py
└── utils/               # 工具类
    └── logger.py
```

### 运行测试

```bash
# 安装开发依赖
pip install -e ".[dev]"

# 运行测试
pytest

# 运行覆盖率测试
pytest --cov=app
```

### 代码质量

```bash
# 格式化代码
black app/

# 代码检查
flake8 app/

# 类型检查
mypy app/
```

## 部署

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

### Kubernetes

查看 `k8s/` 目录中的 Kubernetes 部署清单。

### 生产环境变量

```env
DEBUG=false
LOG_LEVEL=INFO
LOG_FORMAT=json
WORKERS=4
RETRIEVAL_USE_CACHE=true
```

## 性能考虑

- **批量处理**：使用批量端点添加多个函数
- **缓存**：在生产环境中启用嵌入缓存
- **向量数据库**：确保 Qdrant 有足够的资源
- **并发工作者**：生产部署使用多个工作者
- **连接池**：为高吞吐量配置适当的连接池

## 监控

系统通过以下方式提供全面监控：

- 健康检查端点
- 使用 loguru 的结构化日志
- 系统统计和指标
- 错误跟踪和报告

## 许可证

MIT 许可证 - 详见 LICENSE 文件。

## 支持

问题和疑问：
- GitHub 问题：[Project Issues](https://github.com/your-org/function-rag/issues)
- 文档：[API 文档](http://localhost:8000/docs)