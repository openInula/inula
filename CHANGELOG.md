## 0.0.48 (2023-05-18)
- **core**: 解决style中属性WebkitLineClamp值被转换成字符串问题

## 0.0.45 (2023-05-10)
- **core**: 修改belongClassVNode属性为Symbol提升性能
- **core**: 优化内部循环实现，提升性能

## 0.0.44 (2023-04-03)
- **core**: 修复horizonX-devtool Firefox75报错

## 0.0.43 (2023-03-30)
- **core**: 解决act方法无法等待useEffect触发的更新完成问题

## 0.0.42 (2023-03-24)
- **core**: 解决直接通过defineProperty赋值vtype，enumerable为false，导致vtype为空问题

## 0.0.41 (2023-03-15)
- **core**: #105 redux + forwardRef组合使用场景会报错，redux获取组件类型不对
- **core**: 增加jsx-dev-runtime文件，给vite使用

## 0.0.40 (2023-03-08)
- **core**: #103 使用Memo、React.forwardRef包装组件后，defaultProps失效
- **core**: #104 --max-segment-num的style无法使用
- **core**: 状态管理器的优化

## 0.0.39 (2023-02-21)
- **core**: #102 使用eview-react组件Dialog时，关闭组件horizon报错，且无法再打开弹框

## 0.0.38 (2023-02-01)
- **core**: 增加flushSync接口

## 0.0.37 (2023-01-31)
- **core**: 增加jsxs方法

## 0.0.36 (2023-01-30)
- **core**: #100 horizon从上层页面透传到iframe页面里使用，创建的dom元素instanceof HTMLElement为false

## 0.0.35 (2023-01-28)
- **core**: 在 cloneDeep JSXElement 的时候会出现死循环

## 0.0.34 (2023-01-19)
- **core**: #95 新增jsx接口
- **core**: #96 #97 fix testing-library 的UT错误

## 0.0.33 (2023-01-11)
- **horizonX-devtool**: 修复IE中报错

## 0.0.32 (2023-01-04)
- **CI**: 生成态输出文件改为horiozn.producion.min.js

## 0.0.26 (2022-11-09)
- **CI**: 包信息同步CMC

## 0.0.25 (2022-11-03)
- **core**: fix 修改IE中Set的不兼容问题

## 0.0.24 (2022-10-25)
- **core**: fix 修改IE上报Symbol错误的问题

## 0.0.23 (2022-09-23)
- **core**: #86 兼容ReactIs API

## 0.0.22 (2022-09-22)
- **core**: #83 #75 #72 input支持受控

## 0.0.21 (2022-09-20)
- **core**: #85 所有事件中发生的多次更新都合并执行

## 0.0.20 (2022-09-14)
- **core**: #81 fix Memo场景路径错误

## 0.0.19 (2022-09-13)
- **core**: fix 弹窗的input可能无法触发onChange事件

## 0.0.18 (2022-09-08)
- **core**: fix 键盘事件使用历史记录填充时key为undefined

## 0.0.17 (2022-09-07)
- **core**: fix 不在树上的节点发起更新导致错误

## 0.0.16 (2022-09-07)
- **core**: #56,#65 diff null 不能正确卸载组件

## 0.0.15 (2022-09-06)
- **core**: #43 fix portal root 跟 app root重合时重复监听
- **core**: #38 修复合成事件受普通事件stopPropagation影响无法触发

## 0.0.14 (2022-09-04)
- **core**: #44 修复unmount根节点事件未清除

## 0.0.13 (2022-08-02)
- **horizonX**: 修复redux兼容器bug

## 0.0.12 (2022-07-25)
- 修复IE兼容性问题，IE环境下Event只读，导致合成事件逻辑报错

## 0.0.11 (2022-07-21)
### Bug Fixes
- **horizonX**: 修复IE兼容性问题，空catch导致崩溃
- 增加`Object.assign`的babel polyfill

-
## 0.0.10 (2022-07-14)
- **core**: #24 修复lazy包裹memo时，卸载错误
- **core**: #21 修复异步更新时路径错误

## 0.0.9 (2022-07-12)
### Bug Fixes
- **horizonX**: 修复对store进行deepClone时循环克隆

## 0.0.8 (2022-07-08)
### Features
- 增加HorizonX提供状态管理能力
### Bug Fixes
- **core**: 修复局部更新场景下context计算错误
### Code Refactoring
- 重构事件机制，取消全量挂载事件，改为按需懒挂载
