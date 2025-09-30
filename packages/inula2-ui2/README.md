# openinula2.0 组件库

[![NPM version](https://img.shields.io/npm/v/inulaUI.svg?style=flat)](https://npmjs.org/package/inulaUI)
[![NPM downloads](http://img.shields.io/npm/dm/inulaUI.svg?style=flat)](https://npmjs.org/package/inulaUI)

## 项目简介
openinula2.0 组件库是基于 [openinula](https://github.com/openinula/openinula) 的现代化 React UI 组件库，包含丰富的基础组件，适用于企业级中后台和移动端应用开发。组件库采用现代化设计风格，支持亮暗主题切换，具备良好的可扩展性和易用性。

## 开发说明
进入library目录
```bash
npm install
npm run dev
```
组件统一小写并放在components目录下，目录结构为（以Button组件为例）:

```
button/
├── demos/      # 按钮示例（不同功能的放不同文件）
├── demo.jsx    # 按钮示例整体文件
├── index.jsx   # 按钮组件
└── index.css   # 按钮样式
```


## 目录结构

```
openInula2.0_Library/
├── inulaUI/                # 组件库主包
│   ├── docs/               # 文档与指南
│   ├── src/                # 组件源码
│   │   ├── button/         # 按钮组件
│   │   │   ├── demos/      # 按钮组件演示
│   │   │   ├── index.jsx   # 按钮组件实现
│   │   │   ├── index.md    # 按钮组件文档
│   │   │   └── index.css   # 按钮样式
│   │   ├── index.ts        # 入口文件
│   │   └── global.d.ts     # 全局类型声明
│   ├── package.json        # 组件库包配置
│   └── ...
├── library_code/           # 组件库演示/测试项目
│   ├── src/
│   │   ├── components/
│   │   │   └── button/
│   │   │       ├── demos/  # 按钮演示
│   │   │       ├── demo.jsx
│   │   │       ├── index.jsx
│   │   │       └── index.css
│   │   ├── index.jsx       # 入口
│   │   └── index.css
│   ├── index.html
│   └── ...
└── README.md               # 项目说明文档
```

## 贡献指南
1. Fork 本仓库并创建分支。
2. 提交代码前请确保通过 lint 检查和单元测试。
3. 提交 PR 时请详细描述变更内容。
4. 欢迎补充文档、修复 bug 或新增组件。


## License
MIT
