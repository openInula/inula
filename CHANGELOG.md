## 0.1.13
- **core**：修复transferNonInulaStatics horizon-is API用法错误([issue254](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/254))

## 0.1.12
- **core**：修复类组件使用connect后静态属性丢失的问题([issue253](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/253))

## 0.1.11
- **core**: reduxAdapter兼容reducer为非纯函数的场景([issue252](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/252))

## 0.1.10
- **core**：修复reduxAdapter API replaceReducer不触发更新的bug([issue246](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/246))

## 0.1.9
- **core**: 修复组件更新后再卸载存在的内存泄漏问题([issue241](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/241))
- **core**: 修复compose未能在props中注入方法([issue244](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/244))

## 0.1.8 (2025-1-16)
- **core**: 修复bindActionCreators不返回的问题([issue242](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/242))

## 0.1.7 (2025-1-6)
- **core**: 修复组件卸载后存在的内存泄漏问题([issue238](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/238))

## 0.1.6 (2024-12-11)
- **core**: `getCurrentHook`函数等价改写规避浏览器可能存在的问题

## 0.1.5 (2024-11-8)
- **core**: treeRoot标识符重复导致事件触发错误([issue](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-ecosystem/issues/11))
- **core**  处理horizon类型不兼容([issue180](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/180))
## 0.1.4 (2024-9-27)
- **core**: 修复SVG属性处理错误

## 0.1.3 (2024-7-30)
- **core**: 新增JSX命名空间，提供Horizon.InulaNode方式使用类型声明

## 0.1.2 (2024-7-22)
- **core**: 修复状态管理器connect注入的方法没有返回值

## 0.1.1 (2024-5-11)
- **core**: 修复原生option dom不能正确更新的问题([issue172](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/172))

## 0.1.0 (2024-4-15)
- **core**: 修复Horizon属性处理与react不一致的地方([issue170](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/170))
- **core**: 修复Suspense组件报错
- **core**: 导出状态管理器Context，兼容react-redux

## 0.0.77 (2024-3-5)
- **core**: 防止firefox中的同步ajax请求导致渲染然入口重入(降级方案)

## 0.0.76 (2024-2-26)
- **core**: 防止firefox中的同步ajax请求导致渲染然入口重入([issue167](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/167))
- **core**: 在导出对象中增加version字段，兼容mobx-react([issue169](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/169))

## 0.0.75 (2024-2-20)
- **core**: 对于没有children的元素，设置dangerouslySetInnerHTML不生效

## 0.0.74 (2024-2-19)
- **core**: 不允许同时设置dangerouslySetInnerHTML和children([issue166](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/166))

## 0.0.73 (2024-2-18)
- **core**: 修复horizonx connect API嵌套使用报错的问题([issue151](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/151))

## 0.0.72 (2024-1-30)
- **core**: 修复响应式状态管理器触发组件渲染不调用生命周期函数的问题([issue164](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/164))

## 0.0.71 (2023-12-19)
- **core**: 修复antd Tree组件报错([issue157](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/157))

## 0.0.70 (2023-12-08)
- **core**：修复状态管理器比较函数处理null值时的逻辑错误([issue154](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/154))
- **core**：避免状态管理器useSelector API导致页面重新渲染([issue152](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/152))

## 0.0.69 (2023-12-04)
- **core**：createStore dispatch API兼容redux([issue149](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/149))

## 0.0.68 (2023-11-24)
- **core**: Dom上键值增加随机字符，防止Dom上键值相同重复挂载事件([issue146](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/146))
- **core**: 修复StrictMode导致子组件状态丢失的问题([issue144](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/144))
- **core**: 修复Portal root入栈顺序错误的问题([issue136](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/136))

## 0.0.67 (2023-11-15)
- **core**: 修复Hooks调用错误问题

## 0.0.66 (2023-11-1)
- **core**: 修复portal下节点事件无法触发问题([issue128](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/128))
- **core**: 修复Fragment设置Key后仍然会导致组件重新渲染的问题([issue140](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/140))
- **core**: 修复状态管理器createStore 传入enhancer不生效的问题([issue145](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/145))

## 0.0.65 (2023-10-25)
- **core**: 修复状态管理器使用connect方法更新值后props里获取不到的问题([issue134](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/134))

## 0.0.64 (2023-10-25)
- **core**: 状态管理器connect API支持forwardRef参数([issue129](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/129))
- **core**: 修复状态管理器connect API后props没有dispatch的问题([issue130](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/130))
- **core**: 修复状态管理器applyMiddleware API后报错的问题([issue131](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/131))
- **core**: 修复状态管理器dispatch方法异步使用时数据无法更新的问题([issue132](https://open.codehub.huawei.com/innersource/fenghuang/horizon/horizon-core/issues/132))
- **core**: 修复状态管理器可能导致的页面无限渲染的问题

## 0.0.63 (2023-10-10)
- **core**: 解决事件卸载失败问题

## 0.0.62 (2023-10-07)
- **core**: 解决mouseEnter事件重复触发问题

## 0.0.60 (2023-09-28)
- **core**: 解决数组合并导致的Maximum call stack size exceeded的问题

## 0.0.59 (2023-09-26)
- **core**: 解决事件对象defaultPrevented属性值不准确的问题

## 0.0.58 (2023-09-15)
- **core**: 提升类型兼容性

## 0.0.57 (2023-09-14)
- **core**: 提升类型兼容性

## 0.0.56 (2023-09-13)
- **core**: 内部代码修改为 inula
- **core**: 工程转变为 monorepo 架构

## 0.0.54 (2023-08-01)
- **core**: 修复 removeEffect is not a function 的错误

## 0.0.53 (2023-06-13)
- **core**: codecheck 清理

## 0.0.52 (2023-05-29)
- **build**: ejs属于构建依赖

## 0.0.51 (2023-05-29)
- **core**: 增加mouseenter和mouseleave事件代理机制

## 0.0.50 (2023-05-23)
- **core**: 解决IE11不兼容Symbol问题

## 0.0.49 (2023-05-19)
- **core**: 解决当组件被销毁，业务若异步（定时器）调用setState修改状态，可能出现路径错误问题。

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
- **core**: #103 使用Memo、forwardRef包装组件后，defaultProps失效
- **core**: #104 --max-segment-num的style无法使用
- **core**: 状态管理器的优化

## 0.0.39 (2023-02-21)
- **core**: #102 使用eview组件Dialog时，关闭组件horizon报错，且无法再打开弹框

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
- **core**: #86 兼容Is API

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
