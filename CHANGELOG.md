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
