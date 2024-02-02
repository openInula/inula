---
category: Components
type: 通用
title: Button
subtitle: 按钮
group: Button 按钮
---

该组件默认分default和primary两种样式，支持添加图标、设置按钮文本，自定义样式，同时该组件底层采用原生的button标签，支持原生button的所有事件。


## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
|:-----|:-----|:-----|:-----|
| id | 自定义id | string | - |
| className |  自定义class | string | - |
| style |  自定义组件样式 | React.CSSProperties | - |
| title | 显示的title | string | - |
| status |  设置Button的使用场景，默认default样式，特殊场景下设置该属性值为primary | `default`\|`primary`\|`risk`| `default `|
| size |  设置组件的类型 | `small`\|`normal`\|`large` | `normal`  |
| text |  Button中的文本 | string | ''  |
| disabled |  设置Button的灰化状态 | bool | `false` |
| onClick |  点击按钮时的回调<br>*event:* 原生dom的点击事件 <br> | function: <br>`(event: object) => void` | - |
| focused| 设置组件是否默认聚焦 | bool|	`false`|
| leftIcon |  在Button中文本的左边设置图标，传入值为图标的绝对路径 | string | - |
| rightIcon |  在Button中文本的右边设置图标，传入值为图标的绝对路径 | string | - |
| leftIconProps |  设置leftIcon的附加属性 <br>**属性：** <br> *leftHoverIcon*: 光标悬停时的leftIcon <br>*leftIconClass*: leftIcon的自定义类  | object | null |
| rightIconProps |  设置rightIcon的附加属性 <br>**属性：** <br> *rightHoverIcon*: 光标悬停时的rightIcon <br>  *rightIconClass*: rightIcon的自定义类 | object | null |
| toolTipProps |  tip配置 *优先级高于其他tip相关配置* <br> **请使用Tooltip组件添加提示框,结构清晰,组件控制便捷** | object(具体配置见Tooltip组件文档) | null |
| tipStyle | tip样式 | React.CSSProperties | - |
| tipShow | 是否展示tip | `always`\|`never`\|`overflow`| `never` |
| tipData | tip值,默认显示text属性值  | string | text属性值 |
