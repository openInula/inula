# @copilotkit/menu-analysis

基于 Playwright 和 LLM 的大规模 Web 应用菜单功能自动分析工具。

## 功能特性

- 🕷️ **智能菜单发现**: 自动发现和爬取菜单结构
- 🧠 **LLM 智能分析**: 使用大语言模型生成智能化功能描述
- 📊 **JSON 输出格式**: 结构化的 JSON 格式输出，便于后续处理
- 🔐 **登录支持**: 处理私有系统的身份验证
- ⚡ **并发处理**: 高效处理数百个菜单
- 🎯 **详细分析**: 提取表单、表格、按钮等页面元素
- 📈 **进度跟踪**: 实时进度监控和详细日志

## 安装

```bash
npm install @copilotkit/menu-analysis
```

## 快速开始

### 命令行使用

```bash
# 分析公开网站
npx @copilotkit/menu-analysis analyze -u https://example.com -o ./results

# 带身份验证的分析
npx @copilotkit/menu-analysis analyze \
  -u https://admin.example.com \
  --login-url https://admin.example.com/login \
  --username admin \
  --password secret \
  -o ./results

# 分析单个页面
npx @copilotkit/menu-analysis single \
  -u https://example.com/dashboard \
  -n "仪表板" \
  -o ./dashboard-analysis.json
```

### 编程方式使用

```typescript
import { MenuAnalysisEngine, createDefaultConfig, createMenuConfig } from '@copilotkit/menu-analysis';

async function analyzeWebsite() {
  // 创建配置
  const config = createDefaultConfig();
  config.llm.apiKey = 'your-deepseek-api-key';
  config.output.outputPath = './analysis-results';
  config.output.format = 'json';

  // 创建菜单配置
  const menuConfig = createMenuConfig('https://your-website.com');
  menuConfig.loginConfig = {
    loginUrl: 'https://your-website.com/login',
    usernameSelector: 'input[name="username"]',
    passwordSelector: 'input[name="password"]',
    submitSelector: 'button[type="submit"]',
    username: 'your-username',
    password: 'your-password'
  };

  // 创建并运行分析引擎
  const engine = new MenuAnalysisEngine({
    ...config,
    crawler: {
      ...config.crawler,
      ...menuConfig
    }
  });

  const results = await engine.analyze();
  console.log(`分析了 ${results.length} 个菜单`);
}
```

## 配置说明

### 环境变量

```bash
# LLM 配置 (DeepSeek)
DEEPSEEK_API_KEY=your-deepseek-api-key
LLM_MODEL=deepseek-chat
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

# 爬虫配置
CRAWLER_CONCURRENCY=3
CRAWLER_DELAY=1000
CRAWLER_TIMEOUT=30000

# 输出配置
OUTPUT_FORMAT=json
OUTPUT_PATH=./menu-analysis-results
INCLUDE_SCREENSHOTS=false
INCLUDE_RAW_CONTENT=false
```

### 配置文件

生成配置模板：

```bash
npx @copilotkit/menu-analysis config -o ./menu-analysis.config.json
```

配置文件示例：

```json
{
  "llm": {
    "provider": "deepseek",
    "model": "deepseek-chat",
    "apiKey": "your-api-key",
    "temperature": 0.3,
    "maxTokens": 2000
  },
  "crawler": {
    "concurrency": 3,
    "delay": 1000,
    "retries": 3,
    "timeout": 30000
  },
  "output": {
    "format": "json",
    "outputPath": "./results",
    "includeScreenshots": false,
    "includeRawContent": false
  },
  "menu": {
    "baseUrl": "https://your-website.com",
    "menuSelectors": [
      "[role=\"navigation\"] a",
      ".menu a",
      ".nav a"
    ],
    "excludePatterns": ["logout", "help"],
    "maxDepth": 3,
    "waitTimeout": 30000,
    "loginConfig": {
      "loginUrl": "https://your-website.com/login",
      "usernameSelector": "input[name=\"username\"]",
      "passwordSelector": "input[name=\"password\"]",
      "submitSelector": "button[type=\"submit\"]",
      "username": "your-username",
      "password": "your-password"
    }
  }
}
```

## 命令行工具

### analyze 命令

分析网站上的所有菜单：

```bash
npx @copilotkit/menu-analysis analyze [选项]
```

选项：
- `-u, --url <url>`: 网站基础 URL（必需）
- `-o, --output <path>`: 输出文件路径
- `-f, --format <format>`: 输出格式（仅支持 json）
- `--login-url <url>`: 登录页面 URL
- `--username <username>`: 登录用户名
- `--password <password>`: 登录密码
- `--menu-selectors <selectors>`: 逗号分隔的菜单 CSS 选择器
- `--exclude-patterns <patterns>`: 逗号分隔的排除模式
- `--max-depth <number>`: 最大菜单深度
- `--concurrency <number>`: 并发页面分析数
- `--delay <number>`: 请求间延迟（毫秒）
- `--llm-model <model>`: 使用的 LLM 模型（默认：deepseek-chat）

### single 命令

分析单个页面：

```bash
npx @copilotkit/menu-analysis single [选项]
```

选项：
- `-u, --url <url>`: 要分析的页面 URL（必需）
- `-n, --name <name>`: 菜单/页面名称（必需）
- `-o, --output <path>`: 输出文件路径

### config 命令

生成配置模板：

```bash
npx @copilotkit/menu-analysis config [选项]
```

选项：
- `-o, --output <path>`: 配置文件输出路径

## 输出格式

### JSON 格式
结构化数据，包含完整的分析结果（唯一支持的输出格式）：

```json
{
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "totalMenus": 150,
    "version": "1.0.0"
  },
  "functionalities": [
    {
      "menuId": "dashboard-0-1",
      "menuName": "用户管理",
      "menuPath": "系统管理 > 用户管理",
      "url": "https://example.com/admin/users",
      "primaryFunction": "用户账户管理和权限控制",
      "capabilities": ["用户查询", "用户新增", "用户编辑", "权限分配"],
      "businessScope": "系统用户和权限管理",
      "userActions": ["搜索用户", "创建用户", "编辑用户信息", "删除用户"],
      "dataManagement": {
        "dataTypes": ["用户信息", "角色权限"],
        "operations": ["增删改查", "批量操作"],
        "integrations": ["LDAP", "SSO"]
      },
      "technicalDetails": {
        "componentTypes": ["数据表格", "表单", "搜索框"],
        "frameworks": ["React"],
        "apis": ["/api/users", "/api/roles"]
      },
      "usageScenarios": ["新员工入职", "权限调整", "用户信息维护"],
      "relatedModules": ["角色管理", "权限管理"],
      "confidence": 0.95
    }
  ]
}
```


## 高级用法

### 自定义 LLM 提供商

```typescript
import { MenuAnalysisEngine } from '@copilotkit/menu-analysis';

const config = {
  llm: {
    provider: 'custom',
    baseUrl: 'https://your-llm-api.com',
    model: 'your-model',
    apiKey: 'your-api-key'
  },
  // ... 其他配置
};
```

### 自定义菜单选择器

```typescript
const menuConfig = {
  baseUrl: 'https://your-site.com',
  menuSelectors: [
    '.custom-menu a',
    '[data-menu-item]',
    '.sidebar-nav a'
  ],
  excludePatterns: [
    'logout',
    'help',
    'external-link'
  ]
};
```

### 进度监控

```typescript
import { MenuAnalysisEngine, Logger } from '@copilotkit/menu-analysis';

const logger = new Logger('debug', './analysis.log');
const engine = new MenuAnalysisEngine(config);

// 引擎会自动记录进度
const results = await engine.analyze();
```

## 最佳实践

1. **小规模测试**: 先用少量菜单测试
2. **限流设置**: 使用适当的延迟避免压垮服务器
3. **身份验证**: 安全存储凭据，考虑使用环境变量
4. **错误处理**: 监控日志查看失败页面并调整选择器
5. **LLM 成本**: 注意大规模菜单集的 token 使用量

## 故障排除

### 常见问题

1. **登录失败**: 检查选择器和凭据
2. **未找到菜单**: 验证菜单选择器是否匹配你的网站结构
3. **LLM 错误**: 检查 API 密钥和速率限制
4. **超时错误**: 为加载缓慢的页面增加超时值

### 调试模式

启用详细日志：

```bash
npx @copilotkit/menu-analysis analyze -u https://example.com --verbose
```

### 日志文件

查看生成的日志文件：
- `menu-analysis.log`: 主应用程序日志
- `progress.json`: 实时进度状态

## 使用示例

### 基础使用
```typescript
// examples/basic-usage.ts
import { MenuAnalysisEngine, createDefaultConfig } from '@copilotkit/menu-analysis';

const config = createDefaultConfig();
config.llm.apiKey = process.env.DEEPSEEK_API_KEY;
const engine = new MenuAnalysisEngine(config);
const results = await engine.analyze();
```

### 带身份验证
```typescript
// examples/with-authentication.ts
const menuConfig = createMenuConfig('https://admin.example.com');
menuConfig.loginConfig = {
  loginUrl: 'https://admin.example.com/login',
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  // ... 其他配置
};
```

### 批量分析
```typescript
// examples/batch-analysis.ts
const targets = [
  { name: 'main-website', baseUrl: 'https://example.com' },
  { name: 'admin-panel', baseUrl: 'https://admin.example.com' },
  // ... 更多目标
];

for (const target of targets) {
  const results = await analyzeTarget(target);
  console.log(`${target.name}: ${results.length} 个菜单`);
}
```

## 项目结构

```
src/
├── core/                 # 核心分析引擎
│   └── MenuAnalysisEngine.ts
├── crawler/              # 爬虫模块
│   └── MenuCrawler.ts
├── analyzer/             # 页面分析器
│   └── PageAnalyzer.ts
├── llm/                  # LLM 集成
│   └── LLMAnalyzer.ts
├── output/               # 输出管理
│   └── OutputManager.ts
├── utils/                # 工具类
│   ├── Logger.ts
│   └── ProgressTracker.ts
├── config/               # 配置管理
│   └── ConfigManager.ts
└── types/                # 类型定义
    └── index.ts
```

## 性能建议

- **并发控制**: 建议并发数不超过 5，避免过度请求
- **延迟设置**: 请求间隔至少 1000ms，尊重目标服务器
- **批量处理**: 对于 800+ 菜单，建议分批处理
- **资源监控**: 监控内存和网络使用情况

## 贡献指南

欢迎贡献！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

## 许可证

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 技术支持

如有问题或建议，请：
1. 查看 [故障排除](#故障排除) 部分
2. 检查 [GitHub Issues](https://github.com/your-repo/issues)
3. 创建新的 Issue 描述你的问题

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新内容。