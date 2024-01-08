# openInula 开源项目

## 项目介绍

单词 Inula（发音为：[ˈɪnjʊlə]），意为一类旋覆花属菊科的植物。openInula 是一款用于构建用户界面的 JavaScript 库，提供响应式 API 帮助开发者简单高效构建 Web 页面，比传统虚拟 DOM 方式渲染效率提升30%以上！同时 openInula 提供与 React 保持一致的 API，并且提供5大常用功能组件：状态管理器、路由、国际化、请求组件、应用脚手架，以便开发者高效、高质量的构筑基于 openInula 的前端产品。

## 技术架构

![](https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/misc/structure.png)

## 核心能力

### 响应式API

openInula 通过监听状态变量的变化，以细粒度的依赖追踪机制来实现响应式更新，避免了虚拟 DOM 的开销。通过最小化重新渲染的范围，从而进行高效的UI渲染。无需用户过度关注性能优化。

>（实验性功能，可在 `reactive` 分支查看代码或使用 npm 仓中 experimental 版本体验）

### 兼容 React API

提供与 React 一致的 API，完全支持 React 生态，可将 React 应用可零修改切换至 openInula。

### openInula 配套组件

#### 状态管理器 inula-X

inula-X 是 openInula 默认提供的状态管理器。无需额外引入三方库，就可以简单实现跨组件/页面共享状态。

inula-X 与 Redux 相比，可创建多个 Store，不需要在 Reducer 中返回 state 并且简化了 Action 和 Reducer 的创建步骤，原生支持异步能力，组件能做到精准重渲染。inula-X 均可使用函数组件、class 组件，能提供 redux 的适配接口及支持响应式的特点。

#### 路由 inula-router

inula-router 为 openInula 提供前端路由的能力，是构建大型应用必要组件，涵盖 react-router、history、connect-react-router 的功能。

#### 请求 inula-request

inula-request 是 openInula 的网络请求组件，不仅涵盖常见的网络请求方式，还提供动态轮询钩子函数给用户更便捷的定制化请求体验。

#### 国际化 inula-intl

inula-intl 是基于 openInula 的国际化组件，涵盖了基本的国际化组件和钩子函数，允许用户更方便地构建国际化能力。

#### 调试工具 inula-dev-tools

inula-dev-tools 是一个为 openInula 开发者提供的强大工具集，能够方便地查看和编辑组件树、管理应用状态以及进行性能分析，极大提高了开发效率和诊断问题的便捷性。

#### 脚手架 create-inula

create-inula 是一套用于创建 openInula 项目的脚手架工具。它预置了一系列项目模板，允许开发者通过命令行按需快速生成可运行的项目代码。

## 参与贡献

我们鼓励开发者以各种方式参与代码贡献、生态拓展或文档反馈，献您的原创内容，详细请参考[贡献指南](https://docs.openinula.net/docs/%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97)。

### 官方链接

欢迎访问 openInula 官网与文档仓库，参与 openInula 开发者文档开源项目，与我们一起完善开发者文档。

* openInula 官网：[https://www.openinula.net/](https://www.openinula.net/)
* openInula 文档：[https://docs.openinula.net/](https://docs.openinula.net/)
* openInula 仓库地址：[https://gitee.com/openinula/inula](https://gitee.com/openinula/inula)
* openInula 社提案备忘录（RFC）：[https://gitee.com/openInula/rfcs](https://gitee.com/openInula/rfcs)

### 社区贡献者案例

**[`umi-inula`](https://gitee.com/congxiaochen/inula)**

基于 umijs 与 openInula 的开发框架，集成官方组件与UI、AIGC等功能，开箱即用。

**[`VoerkaI18n`](https://github.com/zhangfisher/voerka-i18n/)**

适用于多框架的 JavaScript 国际化解决方案，提供对 openInula 的适配。

- [适配示例](https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Fzhangfisher%2Fvoerka-i18n%2Ftree%2Fmaster%2Fexamples%2Fopeninula)
- [适配文档](https://gitee.com/link?target=https%3A%2F%2Fzhangfisher.github.io%2Fvoerka-i18n%2F%23%2Fzh%2Fguide%2Fintegration%2Fopeninula)

## 许可协议

openInula 主要遵循 [Mulan Permissive Software License v2](http://license.coscl.org.cn/MulanPSL2) 协议，详情请参考各代码仓 LICENSE 声明。

## 联系方式

* 官方邮箱: [team@inulajs.org](mailto:team@inulajs.org)

* 微信公众号:

![](https://www.openinula.net/assets/qrcode.inula-02f99d58.jpg)
