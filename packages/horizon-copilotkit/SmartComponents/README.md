# Smart Components Monorepo

这是一个使用npm workspaces管理的monorepo，包含Smart Components库和示例应用。

## 项目
SmartComponents/
├── packages/
│   ├── smart-components-lib/     # Smart Components React库
│   └── smart-components-example/ # 示例应用
├── package.json                  # 根package.json (workspaces配置)
├── .npmrc                       # npm配置
└── README.md                    # 项目说明
```

## 开始使用

### 安装依赖
```bash
npm install
```

### 构建组件库
```bash
npm run build:lib
```

### 启动示例项目
```bash
npm run dev
```

### 构建所有包
```bash
npm run build
```

## 开发工作流

1. 首次克隆项目后，运行 `npm install` 安装所有依赖
2. 运行 `npm run build:lib` 构建组件库
3. 运行 `npm run dev` 启动示例项目进行开发

## 可用脚本

- `npm run build` - 构建所有包
- `npm run dev` - 启动示例应用
- `npm run build:lib` - 仅构建组件库
- `npm run dev:lib` - 以监听模式构建组件库
- `npm run clean` - 清理所有构建产物
- `npm run lint` - 运行代码检查
- `npm run test` - 运行所有测试

## Workspace管理

此项目使用npm workspaces来管理多个包：

- `packages/smart-components-lib` - 核心组件库
- `packages/smart-components-example` - 示例应用

依赖会自动在workspace之间链接，避免了版本冲突问题。

## 优势

1. **统一依赖管理** - 所有包共享相同版本的React和其他依赖
2. **简化开发流程** - 一次安装，处处可用
3. **避免版本冲突** - workspace自动处理包之间的依赖关系
4. **便于维护** - 统一的构建和开发脚本