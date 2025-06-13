## 1.0.31(2024-8/27)
- **intl**:
修复国际化中复数规则多value值覆盖问题：https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/177

## 1.0.30(2024-8/19)
- **intl**:
- 1、优化国际化无法解析当文档中存在'‘
- 2、支持vue-i18n的相关API


## 1.0.29（2024-4-29）

- **intl**:
- 1、优化国际化简写方法，支持intl.$t方法
- 2、支持国际化的富文本元素
- 3、修复一些类型系统

## 1.0.28（2024-3-12）

- **intl**: 回退IE1.0.26版本，用于优化IE浏览器下打印出编译后的日志信息

## 1.0.27（2024-2-21）

- **intl**: 修复useIntl返回参数非全量参数问题，与injectIntl组件保持一致


## 1.0.26（2024-1-24）

- **intl**: 修复intl组件修复
- 1、优化IE浏览器下打印出编译后的日志信息
- 2、添加message的动态改变
- 3、在useIntlhook中添加缓存，避免重复渲染
