# openInula 开源项目

## 项目介绍

单词 Inula（发音为：[ˈɪnjʊlə]），意为一类旋覆花属菊科的植物。openInula 是一款用于构建用户界面的 JavaScript 库，提供响应式 API 帮助开发者简单高效构建 web 页面，比传统虚拟 DOM 方式渲染效率提升30%以上！同时 InulaJS 提供与 React 保持一致的 API，并且提供5大常用功能丰富的核心组件：状态管理器、路由、国际化、请求组件、应用脚手架，以便开发者高效、高质量的构筑基于 InulaJS 的前端产品。

## 技术架构

![输入图片说明](https://gitee.com/openInula/inula-docs/raw/master/static/img/structure.png)

### 核心能力

**响应式API**

* openInula 通过最小化重新渲染的范围，从而进行高效的UI渲染。这种方式避免了虚拟DOM的开销，使得 openInula 在性能方面表现出色。
* openInula 通过比较变化前后的 JavaScript 对象以细粒度的依赖追踪机制来实现响应式更新，无需用户过度关注性能优化。
* 简洁API：
  1. openInula 提供了两组简洁直观的API--响应式 API 和与 React 一致的传统API，使得开发者可以轻松地构建复杂的交互式界面。
  2. openInula 简洁的API极大降低了开发者的学习成本，开发者使用响应式API可以快速构建高效的前端界面。

**兼容 ReactAPI**

* 与 React 保持一致 API 的特性、可以无缝支持 React 生态。
* 使用传统 API 可以无缝将 React 项目切换至 openInula，React 应用可零修改切换至 openInula。

### openInula 配套组件

**状态管理器/inula-X**

inula-X 是 openInula 默认提供的状态管理器，无需额外引入三方库，就可以简单实现跨组件/页面共享状态。
inula-X 与 Redux 比可创建多个 Store，不需要在 Reducer 中返回 state 并且简化了 Action 和 Reducer 的创建步骤，原生支持异步能力，组件能做到精准重渲染。inula-X 均可使用函数组件、class 组件，能提供 redux 的适配接口及支持响应式的特点。

**路由/inula-router**

inula-router 是 openInula 生态组建的一部分，为 openInula 提供前端路由的能力，是构建大型应用必要组件。
inula-router 涵盖 react-router、history、connect-react-router 的功能。

**请求/inula-request**

inula-request 是 openInula 生态组件，涵盖常见的网络请求方式，并提供动态轮询钩子函数给用户更便捷的定制化请求体验。

**国际化/inula-intl**

inula-intl 是基于 openInula 生态组件，其主要提供了国际化功能，涵盖了基本的国际化组件和钩子函数，便于用户在构建国际化能力时方便操作。

**调试工具/inula-dev-tools**

inula-dev-tools 是一个为 openInula 开发者提供的强大工具集，能够方便地查看和编辑组件树、管理应用状态以及进行性能分析，极大提高了开发效率和诊断问题的便捷性。

**脚手架/inula-cli**

inula-cli 是一套针对 openInula 的编译期插件，它支持代码优化、JSX 语法转换以及代码分割，有助于提高应用的性能、可读性和可维护性。

## openInula 文档

欢迎访问 openInula 官网文档仓库，参与 openInula 开发者文档开源项目，与我们一起完善开发者文档。

[访问官网](https://www.openinula.net/)

## 代码仓地址

openInula 仓库地址：[https://gitee.com/openinula](https://gitee.com/openinula)

## 如何参与

**参与贡献**
欢迎您参与[贡献](https://gitee.com/openinula/docs/blob/master/%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97.md)，我们鼓励开发者以各种方式参与文档反馈和贡献。

您可以对现有文档进行评价、简单更改、反馈文档质量问题、贡献您的原创内容，详细请参考[贡献文档](https://gitee.com/openinula/docs/blob/master/%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97.md)。

## 许可协议

openInula 主要遵循 Mulan Permissive Software License v2 协议，详情请参考各代码仓 LICENSE 声明。

## 联系方式

team@inulajs.org


