## 1.0.16(2025-02-17)

- 修复BrowserRouter下在查询参数后使用/#导致/#数量异常([issue251](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/251))
- 加固`<Link>`props to不传参数时报错的问题

## 1.0.15(2025-01-22)

- 无变更，解决1.0.14类型文件未正确构建的问题，重新构建

## 1.0.14(2024-11-6)

- 修复withRouter参数传递顺序不兼容react-router

## 1.0.13(2024-10-24)

- 修复Prompt组件一直弹出提示的问题

## 1.0.11(2024-7-15)

- history可以处理相对路径
- Switch不限制子组件为Route或Redirect

## 1.0.10(2024-1-18)

- 修复hashRouter push与当前页面相同的URL时页面不刷新的问题

## 1.0.9(2023-12-14)

- 修复Horizon-router路由匹配规则不兼容react-router
- HashHistory初始化时URL hash格式不合法时重定向至合法URL
