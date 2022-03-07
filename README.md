# horizon
## 工程编译：
Horizon采用monorepo方式管理项目，意思是在版本控制系统的单个代码库里包含了许多项目的代码

monorepo工具采用yarn
### yarn配置
1. yarn1（推荐）
``` shell
// 先安装yarn
npm i yarn -g
```
在 `C:\Users\[工号]\.yarnrc`无相应文件需要新建

加入yarn配置：
```shell
registry "http://szxy1.artifactory.cd-cloud-artifact.tools.huawei.com/artifactory/api/npm/sz-npm-public"
no-proxy .huawei.com
lastUpdateCheck 1646381423295
strict-ssl false
```
2. yarn2

由于yarn2+有不兼容更新，安装方式依赖node 16+的corepack功能，安装参考 [yarn官网](https://yarnpkg.com/getting-started/install)
在 `C:\Users\[工号]\.yarnrc.yml`加入yarn配置，无相应文件需要新建

加入yarn配置：
```shell
npmRegistryServer "http://szxy1.artifactory.cd-cloud-artifact.tools.huawei.com/artifactory/api/npm/sz-npm-public"
```
注意：yarn2配置文件和字段都存在大量不兼容，参考[详细配置](https://yarnpkg.com/configuration/yarnrc#npmRegistryServer)
### 工程命令
#### 安装
```shell
yarn
```
> 需要使用yarn安装，monorepo的依赖才能正确安装到node_modules
#### 打包
```shell
yarn run build
```
#### 全局单元测试
```shell
yarn run test
```

#### 发布包：
```shell
npm publish build/horizon --_auth=XXX
```
XXX是base64编码后的密码值，CMO保管。

## 不兼容：
1. input中的defaultValue值不支持改变，即：只有开始设置的值生效。
2. JSX里面不支持<!-- xxx -->注释。
