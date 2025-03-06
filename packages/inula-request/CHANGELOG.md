## 1.1.4(2024-11-6)

- Response为blob对象时，type与axios不一致([issue181](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/181))
- 优化typescript类型文件

## 1.1.2(2024-10-16)

- 兼容密信浏览器(chrome66)，解决配置拦截器时报错
- IrHeaders set方法兼容Axios([issue178](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/178))

## 1.0.48(2023-12-19)

- 更新了 peerDependencies, @cloudsop/horizon 的依赖方式由 0.0.58 更新为 >= 0.0.10，解决安装依赖时的版本不一致问题

## 1.0.49(2024-1-24)

- 优化了传入 params 参数为空对象时拼接 url 后携带 ? 的问题
- 新增了支持过滤请求参数中传入值为 null 时自动过滤的能力

## 1.0.50(2024-3-7)

- 新增了请求配置 onUploadProgress 回调函数可以接收更丰富的参数
- 修复了使用 onDownloadProgress 回调函数中 total 参数类型
- 新增了请求成功服务端不返回数据的兼容处理

## 1.0.51(2024-3-22)

- 修复了使用 isCancel 传入值为 undefined 不能正确判断的问题
- 解析错误抛出的错误修正为 IRError，提供更丰富的错误信息

## 1.1.0(2024-4-10)

- 修复了传入 params 中值为对象时不能正确解析请求参数的问题
- 新增基本功能支持 nodejs 环境能力（需要 node v18及以上版本）
- 移除了未被使用的 useIR API
