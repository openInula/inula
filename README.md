# horizon
## 工程编译：
Horizon采用monorepo方式管理项目，意思是在版本控制系统的单个代码库里包含了许多项目的代码

monorepo工具采用npm workspaces **（npm版本需要大于7.x）**
### 工程命令
#### 安装
```shell
npm install
```
> 需要使用npm7.x以后版本安装，monorepo的依赖才能正确安装到node_modules
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
XXX是base64编码后的密码值，CMO保管。

## 不兼容：
1. input中的defaultValue值不支持改变，即：只有开始设置的值生效。
2. JSX里面不支持<!-- xxx -->注释。
