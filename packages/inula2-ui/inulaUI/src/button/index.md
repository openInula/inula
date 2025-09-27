---
title: Button 按钮组件
description: 支持五种类型和四种状态属性。
demo:
  cols: 2
---

## 按钮类型
- 主按钮（`primary`）：用于主行动点，一个操作区域只能有一个主按钮。
- 默认按钮（`default`）：用于没有主次之分的一组行动点。
- 虚线按钮（`dashed`）：常用于添加操作。
- 文本按钮（`text`）：用于最次级的行动点。
- 链接按钮（`link`）：一般用于链接，即导航至某位置。

## 状态属性
- 危险（`danger`）：删除/移动/修改权限等危险操作，一般需要二次确认。
- 幽灵（`ghost`）：用于背景色比较复杂的地方，常用在首页/产品页等展示场景。
- 禁用（`disabled`）：行动点不可用的时候，一般需要文案解释。
- 加载中（`loading`）：用于异步操作等待反馈的时候，也可以避免多次提交。

## 代码演示
<code src="./demos/demo1.jsx" description="展示按钮的五种类型：主按钮、默认按钮、虚线按钮、文本按钮、链接按钮。">基本</code>
<code src="./demos/demo2.jsx" description="展示五种类型按钮的'危险'状态用法。">危险</code>
<code src="./demos/demo3.jsx" description="展示按钮的'幽灵'状态，包括主按钮、默认按钮和危险主按钮的幽灵样式。">幽灵</code>
<code src="./demos/demo4.jsx" description="展示五种类型按钮的'禁用'状态用法。">禁用</code>
<code src="./demos/demo5.jsx" description="展示五种类型按钮的'加载中'状态用法。">加载中</code>
<code src="./demos/demo6.jsx" description="演示点击按钮后进入加载中状态，1.5秒后恢复。">交互加载</code>


## API
| 属性      | 说明           | 类型      | 默认值    |
|---------|--------------|---------|--------|
| type    | 按钮类型        | `string`  | default|
| danger  | 危险状态        | `boolean` | false  |
| ghost   | 幽灵状态        | `boolean` | false  |
| disabled| 禁用状态        | `boolean` | false  |
| loading | 加载中状态      | `boolean` | false  |