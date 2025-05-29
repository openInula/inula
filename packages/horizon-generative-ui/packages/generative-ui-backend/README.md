# Generative UI Backend

基于NestJS、Prisma和PassportJS的后端项目，用于身份验证和权限管理。

## 项目设置

### 前提条件

- Node.js (v16+)
- Docker Desktop
- 代理服务器访问（如果在公司网络环境中）

### 安装步骤

1. 克隆仓库后，安装依赖：

```bash
npm install
```

2. 启动PostgreSQL数据库容器：

```bash
docker-compose up -d
```

3. 执行Prisma迁移：

```bash
npx prisma migrate dev --name init
```

4. 启动开发服务器：

```bash
npm run start:dev
```

或者使用快捷脚本一键执行所有操作：

```bash
start-dev.bat
```

### API端点

- `POST /auth/register` - 注册新用户
- `POST /auth/login` - 登录并获取JWT令牌
- `GET /auth/profile` - 获取用户资料（需要JWT认证）

## 技术栈

- NestJS - 后端框架
- Prisma - ORM工具
- PostgreSQL - 数据库
- PassportJS - 身份验证
- JWT - 令牌管理
- Node.js内置crypto模块 - 密码哈希（替代bcrypt）

## 项目结构

```
generative-ui-backend/
├── docker-compose.yml        # Docker 配置
├── .env                      # 环境变量
├── prisma/                   # Prisma配置
│   └── schema.prisma         # 数据库模型
├── src/
│   ├── app.module.ts         # 应用主模块
│   ├── main.ts               # 应用入口
│   ├── prisma/               # Prisma服务
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── users/                # 用户模块
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   └── auth/                 # 认证模块
│       ├── auth.module.ts
│       ├── auth.service.ts
│       ├── auth.controller.ts
│       ├── strategies/       # 认证策略
│       │   ├── local.strategy.ts
│       │   └── jwt.strategy.ts
│       └── guards/           # 认证守卫
│           ├── jwt-auth.guard.ts
│           └── local-auth.guard.ts
└── start-dev.bat             # 启动脚本
```

## 特殊处理说明

### 密码哈希实现

本项目最初计划使用bcrypt进行密码哈希，但由于在某些环境中bcrypt安装可能会遇到问题（如编译原生模块失败），我们改为使用Node.js内置的crypto模块实现密码哈希。

当前实现在`src/users/users.service.ts`中：
- `hashPassword`方法使用PBKDF2算法和SHA-512哈希函数
- `verifyPassword`方法用于验证密码

这是一个适用于开发环境的解决方案。在生产环境中，建议根据实际情况考虑以下选项：

1. 重新尝试使用bcrypt（如果环境支持）：
   ```bash
   npm install bcrypt --no-build-from-source
   ```

2. 使用argon2等替代库（如果环境支持）：
   ```bash
   npm install argon2
   ```

## 故障排除

如果遇到项目运行问题，请参考以下文档：

- `TROUBLESHOOTING.md` - 常见问题和解决方案
- `INSTALLATION.md` - 详细安装指南，包括网络问题解决方案

### 常见问题

1. **bcrypt相关错误**：
   - 我们已移除bcrypt依赖，使用Node.js内置crypto模块
   - 查看`TROUBLESHOOTING.md`获取更多解决方案

2. **Prisma相关错误**：
   - 我们使用模拟的PrismaClient实现来解决某些环境中的安装问题
   - 详见`src/prisma/prisma.service.ts`

对于任何其他问题，请查看`TROUBLESHOOTING.md`文件或提交issue。
