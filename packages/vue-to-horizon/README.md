# horizon

## 工程编译：

Horizon 采用 monorepo 方式管理项目，意思是在版本控制系统的单个代码库里包含了许多项目的代码

monorepo 工具采用 npm workspaces **（npm 版本需要大于 7.x）**

### 工程命令

#### 安装

```shell
pnpm install
```

> 需要使用 npm7.x 以后版本安装，monorepo 的依赖才能正确安装到 node_modules

#### 打包

```shell
npm run build
```

#### 全局单元测试

```shell
npm run test
```

#### 发布包：

```shell
npm publish build/horizon --_auth=XXX
```

XXX 是 base64 编码后的密码值，CMO 保管。

## 不兼容：

1. input 中的 defaultValue 值不支持改变，即：只有开始设置的值生效。
2. JSX 里面不支持<!-- xxx -->注释。

# horizon-vue

install packages and build horizon:

```shell
npm i --legacy-peer-deps
npm run build
```

## horizon vue demos:

Following npm commands can be used to build a complete demo and run server.

### basic functionality

test of basic vue functionality and directives
**horizon**:

```shell
npm run horizon:basic
```

**vue**:

```shell
npm run vue:basic
```

### chat

more complex app with router, stores, multiple views...

**horizon**:

```shell
npm run horizon:chat
```

**vue**:

```shell
npm run vue:chat
```

### element plus

wip features of element plus conversion

**horizon**:

```shell
npm run horizon:element-plus
```

**vue**:

```shell
npm run vue:element-plus
```

### DMC website

complex real-life vue application

**horizon**:

```shell
npm run horizon:config
```

**vue**:

```shell
npm run vue:dmc
```

## other usage:

horizon-vue [action] --src [source] --out [output] --config [config] [--fast]

### possible actions:

**convert**: only translates templates and creates output project
**run**: same as convert, but also serves project
**watch**: same as run but also watches source directory for any changes

### options:

**--src**: source folder (usually containing App.vue)
**--out**: target folder for new converted project
**--fast**: optional flag, fast build skips build of horizon and installation of any dependencies. Only replaces old templates with newly converted ones
**--config**: alternative flag to specify config file containing source, output, whitelist and blacklist
**--whitelist**: array of globs containing paths to files that should be included in build
**--blacklist**: array of globs containing paths to files that should be excluded from build
**--fast**: experimental feature that only build new files and keeps existing ones untouched
