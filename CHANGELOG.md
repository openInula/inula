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
