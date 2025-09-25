# OpenInula 官网（Next.js 版）

## 项目简介

OpenInula 是一个现代化的 JavaScript UI 框架，致力于提供极致性能和开发体验。本仓库为 OpenInula 新一代官网，基于 Next.js 13+（App Router）与 Tailwind CSS 构建，提供文档、教程、示例与 Playground 等站点能力。

---

## 核心特性

- **编译优先**：在编译期完成大部分工作，缩短运行时开销
- **细粒度响应式**：自动追踪依赖，减少不必要重渲染
- **API 兼容性**：与 React 生态高度契合，平滑迁移
- **模板增强**：内置 if/for 等模板指令
- **站点体验**：深色模式、搜索、高亮、课程与示例、交互动效

---

## 环境要求

- Node.js ≥ 18
- 包管理器：推荐 pnpm（也可使用 yarn/npm）
- 由于本仓库包含 `openInula` 子项目（Vite 应用），其 Vite 插件要求 Node ≥ 18

---

## 安装与启动

1. 安装依赖（根项目）：

```bash
pnpm install
```

2. 安装依赖（可选，openInula 子项目用于 Playground REPL 示例）：

```bash
cd openInula && pnpm install
```

3. 本地开发：

```bash
# 在根目录启动 Next.js 开发服务器
pnpm dev

# 如需同时启动 openInula 子项目（可选）
cd openInula && pnpm dev
```
4. 启用文档搜索
```bash
#首先构建项目
pnpm build --no-lint

#然后运行 postbuild 生成搜索索引
pnpm postbuild
```
---

## 构建与部署

- 根站点构建：
首先将openInula文件夹移到其他地方，不要在项目根目录。同时，也需要进入openInula文件夹进行一次pnpm build构建

```bash
pnpm build --no-lint
pnpm postbuild
```

- 站点启动（生产）：

```bash
pnpm start
```

- 构建后搜索索引：构建完成会自动执行 `postbuild`，用 Pagefind 生成到 `public/_pagefind`。

- 注意事项（重要）：
  - 本仓库包含 `openInula/` 子目录（一个独立的 Vite 应用，仅供 REPL/Playground），默认情况下并不会影响 Next.js 的构建。但如果你的自定义流程将其纳入同一产物或分析，请避免把 `openInula` 误当作 Next.js 的子模块进行打包。

---

## 目录结构（节选）

```
website-next/
├─ src/
│  ├─ app/                # Next.js App Router 页面与路由
│  │  ├─ docs/            # 文档（MDX）与文档页
│  │  ├─ playground/      # 教学与 Playground 页面
│  │  ├─ api/             # API 文档/说明页
│  │  └─ ...
│  ├─ components/         # 站点通用组件（含 HomePage、UI 组件等）
│  └─ lib/                # 工具、hooks、性能与 utils
├─ public/                # 静态资源（含 Pagefind 索引输出 _pagefind）
├─ openInula/             # 独立 Vite 应用（用于 REPL/Playground 示例）
├─ package.json
└─ README.md
```

---

## 常用脚本

根目录 `package.json`：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postbuild": "pagefind --site .next/server/app --output-path public/_pagefind"
  }
}
```

- **dev**: 启动 Next.js 开发服务器
- **build**: 生产构建（会为 App Router 产出 `.next`）
- **start**: 启动生产服务
- **lint**: 运行 ESLint 检查
- **postbuild**: 构建后生成 Pagefind 搜索索引

`openInula/package.json`（子项目）：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## FAQ / 故障排查

- **Pagefind 索引未生成或搜索无结果**
  - 确认构建成功后已执行 `postbuild`。也可手动运行：
    ```bash
    pnpm build && pnpm exec pagefind --site .next/server/app --output-path public/_pagefind
    ```
- **本地开发页面加载缓慢或样式异常**
  - 删除 `.next/` 与 `node_modules/` 重新安装依赖；检查 `tailwindcss` 版本与 PostCSS 配置是否匹配。
- **Playground 示例不工作**
  - `openInula/` 子项目需单独 `pnpm install` 与 `pnpm dev`；确保依赖 `openinula`、`inula-router` 正常安装。

---

## 贡献

欢迎任何形式的贡献！

1. Fork 本仓库并克隆到本地
2. 从 `main` 切出特性分支进行开发
3. 发起 MR 并补充说明变更点与动机

详细流程与行为准则请参阅：

- `src/app/docs/conventional/ContributingGuide/page.mdx`
- `src/app/docs/conventional/CodeOfConduct/page.mdx`

---