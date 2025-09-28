# 🎭 Playwright 执行引擎

> 在浏览器中直接运行 Playwright 脚本的执行引擎

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0--beta-blue.svg)](https://github.com/your-username/playwright-execution-engine)

## 🎯 项目简介

Playwright 执行引擎是一个革新性的工具，让您能够在浏览器环境中直接运行 Playwright 录制的脚本，无需任何修改。这意味着您可以：

- ✅ **直接运行** Playwright 录制的脚本，无需修改代码
- ✅ **浏览器兼容** 在任何现代浏览器中运行自动化脚本  
- ✅ **完整 API 支持** 实现了 Playwright 的核心 API
- ✅ **现代定位器** 支持 `getByRole()`, `getByText()` 等现代定位器
- ✅ **零依赖** 纯 JavaScript 实现，无需额外依赖

## 🚀 快速开始

### 1. 基础使用

```html
<!DOCTYPE html>
<html>
<head>
    <title>Playwright 执行引擎</title>
</head>
<body>
    <!-- 引入执行引擎 -->
    <script src="dist/playwright-execution-engine.js"></script>
    
    <script>
        // 创建引擎实例
        const engine = new PlaywrightExecutionEngine();
        
        // 直接运行 Playwright 脚本
        const script = `
            import { test, expect } from '@playwright/test';
            
            test('我的测试', async ({ page }) => {
                await page.goto('https://example.com');
                await page.click('#button');
                await expect(page.locator('#result')).toBeVisible();
            });
        `;
        
        // 执行脚本
        engine.runScript(script).then(result => {
            console.log('执行结果:', result);
        });
    </script>
</body>
</html>
```

### 2. 从文件加载脚本

```javascript
// 从文件加载并执行
const result = await engine.loadAndRun('/scripts/my-test.js');

// 批量执行多个脚本
const results = await engine.runScripts([
    '/scripts/login-test.js',
    '/scripts/search-test.js',
    '/scripts/checkout-test.js'
]);
```

### 3. 使用快捷方法

```javascript
// 快速执行脚本
PlaywrightExecutionEngine.run(`
    import { test, expect } from '@playwright/test';
    
    test('快速测试', async ({ page }) => {
        await page.fill('#input', 'Hello World');
        await page.click('#submit');
        await expect(page.locator('.result')).toBeVisible();
    });
`);

// 快速加载文件
PlaywrightExecutionEngine.load('/path/to/test.js');
```

## 📦 安装

### 方式 1: 直接下载

1. 下载构建好的文件：`dist/playwright-execution-engine.js`
2. 在 HTML 中引入：

```html
<script src="playwright-execution-engine.js"></script>
```

### 方式 2: 从源码构建

```bash
# 克隆仓库
git clone https://github.com/your-username/playwright-execution-engine.git
cd playwright-execution-engine

# 安装依赖
npm install

# 使用 Vite 构建（推荐）
npm run build

# 使用传统构建（备用）
npm run build:legacy

# 开发服务器（热重载）
npm run dev

# 预览构建产物
npm run preview
```

### 方式 3: 开发模式

基于 Vite 的现代开发体验：

```bash
# 启动开发服务器
npm run dev

# 浏览器自动打开 http://localhost:3000
# 支持热重载，修改源码即时更新
```

## 🏗️ 构建系统

项目使用 **Vite** 作为现代构建工具，提供以下优势：

### 构建格式
- **ES Module** (`playwright-execution-engine.es.js`) - 现代 ES6 模块格式
- **UMD** (`playwright-execution-engine.umd.js`) - 通用模块格式，支持 AMD/CommonJS/全局变量
- **IIFE** (`playwright-execution-engine.iife.js`) - 立即执行函数，直接在浏览器中使用

### 使用不同格式

```html
<!-- IIFE 格式：直接在浏览器中使用 -->
<script src="dist/playwright-execution-engine.iife.js"></script>
<script>
  const engine = new PlaywrightExecutionEngine();
</script>

<!-- ES Module 格式：现代浏览器 -->
<script type="module">
  import PlaywrightExecutionEngine from './dist/playwright-execution-engine.es.js';
  const engine = new PlaywrightExecutionEngine();
</script>

<!-- UMD 格式：Node.js 或 AMD 环境 -->
<script>
  // 自动检测环境并适配
</script>
```

### 构建特性
- ✅ **代码压缩** - 使用 Terser 压缩代码
- ✅ **Source Maps** - 便于调试
- ✅ **模块别名** - 支持 `@/` 等路径别名
- ✅ **热重载** - 开发模式下自动刷新
- ✅ **类型检查** - ES2015+ 语法支持

## 🎮 功能特性

### ✅ 已实现的 API

#### 页面导航
- `page.goto(url)` - 导航到指定页面
- `page.url()` - 获取当前 URL
- `page.title()` - 获取页面标题
- `page.reload()` - 刷新页面
- `page.goBack()` / `page.goForward()` - 浏览器导航

#### 元素交互
- `page.click(selector)` - 点击元素
- `page.dblclick(selector)` - 双击元素
- `page.fill(selector, value)` - 填充表单
- `page.press(selector, key)` - 按键操作
- `page.type(selector, text)` - 模拟输入
- `page.hover(selector)` - 鼠标悬停

#### 表单操作
- `page.check(selector)` - 选择复选框
- `page.uncheck(selector)` - 取消选择
- `page.selectOption(selector, value)` - 下拉选择

#### 现代定位器
- `page.locator(selector)` - 创建定位器
- `page.getByRole(role, options)` - 根据角色定位
- `page.getByText(text)` - 根据文本定位
- `page.getByLabel(text)` - 根据标签定位
- `page.getByPlaceholder(text)` - 根据占位符定位
- `page.getByTestId(testId)` - 根据测试 ID 定位

#### 等待机制
- `page.waitForSelector(selector)` - 等待元素出现
- `page.waitForTimeout(ms)` - 等待指定时间
- `page.waitForFunction(fn)` - 等待函数条件
- `page.waitForURL(url)` - 等待 URL 变化
- `page.waitForLoadState(state)` - 等待加载状态

#### 断言系统
- `expect(locator).toBeVisible()` - 验证可见性
- `expect(locator).toBeHidden()` - 验证隐藏
- `expect(locator).toBeEnabled()` - 验证启用状态
- `expect(locator).toBeDisabled()` - 验证禁用状态
- `expect(locator).toBeChecked()` - 验证选中状态
- `expect(locator).toHaveText(text)` - 验证文本内容
- `expect(locator).toHaveValue(value)` - 验证输入值
- `expect(locator).toHaveAttribute(name, value)` - 验证属性
- `expect(locator).toHaveClass(className)` - 验证类名

#### Locator API
- `locator.click()` - 点击
- `locator.fill(value)` - 填充
- `locator.press(key)` - 按键
- `locator.hover()` - 悬停
- `locator.check()` / `locator.uncheck()` - 复选框操作
- `locator.selectOption(value)` - 下拉选择
- `locator.textContent()` - 获取文本
- `locator.getAttribute(name)` - 获取属性
- `locator.isVisible()` - 检查可见性
- `locator.isEnabled()` - 检查启用状态
- `locator.first()` / `locator.last()` / `locator.nth(n)` - 选择器
- `locator.filter(options)` - 过滤器

### 🔄 兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 📖 详细文档

### API 参考

#### PlaywrightExecutionEngine

```javascript
// 创建引擎实例
const engine = new PlaywrightExecutionEngine({
    logLevel: 'info',    // 日志级别: debug, info, warn, error
    timeout: 30000       // 默认超时时间（毫秒）
});

// 执行脚本字符串
const result = await engine.runScript(scriptContent, scriptName);

// 加载并执行脚本文件
const result = await engine.loadAndRun(scriptPath);

// 批量执行脚本
const results = await engine.runScripts(scriptPaths);

// 设置全局配置
engine.configure({ timeout: 60000 });

// 设置全局钩子
engine.setHooks({
    beforeAll: async () => { /* 初始化 */ },
    afterAll: async () => { /* 清理 */ },
    beforeEach: async ({ page }) => { /* 每个测试前 */ },
    afterEach: async ({ page }) => { /* 每个测试后 */ }
});

// 获取执行统计
const stats = engine.getStats(results);

// 清理资源
engine.cleanup();
```

#### 快捷方法

```javascript
// 静态方法快速执行
const result = await PlaywrightExecutionEngine.run(script, options);
const result = await PlaywrightExecutionEngine.load(scriptPath, options);

// 检查浏览器兼容性
const isCompatible = PlaywrightExecutionEngine.checkCompatibility();

// 获取版本信息
const version = PlaywrightExecutionEngine.getVersion();
```

### 测试脚本示例

```javascript
import { test, expect } from '@playwright/test';

test('完整功能测试', async ({ page }) => {
    // 1. 页面导航
    await page.goto('https://example.com');
    console.log('当前页面:', await page.title());
    
    // 2. 表单填写
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.selectOption('#country', 'cn');
    await page.check('#agree');
    
    // 3. 使用现代定位器
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByRole('button', { name: '提交' }).click();
    
    // 4. 等待和验证
    await page.waitForSelector('.success-message');
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toHaveText('注册成功');
    
    // 5. 高级操作
    const locator = page.locator('.user-info');
    await expect(locator).toHaveCount(1);
    await expect(locator.first()).toHaveAttribute('data-user', 'testuser');
});

test('多步骤工作流', async ({ page }) => {
    // 步骤 1: 登录
    await page.fill('#login-username', 'user');
    await page.fill('#login-password', 'pass');
    await page.click('#login-btn');
    
    // 步骤 2: 导航到设置页面
    await page.click('#settings-link');
    await page.waitForURL('**/settings');
    
    // 步骤 3: 修改设置
    await page.getByLabel('接收邮件通知').check();
    await page.getByRole('combobox', { name: '语言' }).selectOption('zh-CN');
    
    // 步骤 4: 保存设置
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText('设置已保存')).toBeVisible();
});
```

## 🔧 高级配置

### 自定义日志级别

```javascript
const engine = new PlaywrightExecutionEngine({
    logLevel: 'debug'  // 显示详细调试信息
});
```

### 自定义超时设置

```javascript
const engine = new PlaywrightExecutionEngine({
    timeout: 60000  // 设置为 60 秒
});

// 或者在运行时配置
engine.configure({ timeout: 30000 });
```

### 错误处理

```javascript
try {
    const result = await engine.runScript(script);
    if (result.success) {
        console.log('所有测试通过!');
    } else {
        console.error('测试失败:', result.error);
    }
} catch (error) {
    console.error('执行引擎错误:', error);
}
```

## 🎪 演示示例

项目包含完整的演示页面，展示了所有功能：

1. 打开 `examples/demo.html`
2. 尝试不同的示例脚本
3. 查看执行结果和日志

## 🚧 限制说明

由于浏览器安全限制，以下 Playwright API 无法实现：

- `browser.newPage()` - 无法创建新标签页
- `page.screenshot()` - 无法截图（需要额外库支持）
- `page.pdf()` - 无法生成 PDF
- `page.setViewportSize()` - 无法修改视口大小
- 网络拦截相关 API

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙋‍♂️ 常见问题

### Q: 为什么需要这个项目？
A: 传统的 Playwright 需要 Node.js 环境运行，这个项目让您可以在纯浏览器环境中运行 Playwright 脚本，特别适合演示、教学和轻量级测试场景。

### Q: 性能如何？
A: 由于直接操作 DOM，性能相当优秀。对于大多数自动化场景，性能表现良好。

### Q: 支持哪些 Playwright 功能？
A: 支持核心的页面操作、元素交互、现代定位器和断言功能。详见功能特性部分。

### Q: 如何调试脚本？
A: 设置 `logLevel: 'debug'` 可以看到详细的执行日志，帮助调试脚本。

## 📞 支持

- 🐛 [报告 Bug](https://github.com/your-username/playwright-execution-engine/issues)
- 💡 [功能建议](https://github.com/your-username/playwright-execution-engine/discussions)
- 📧 邮箱: your-email@example.com

---

⭐ 如果这个项目对您有帮助，请给个 Star！