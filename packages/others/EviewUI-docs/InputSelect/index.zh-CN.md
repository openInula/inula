---
category: Components
type: 数据录入
title: InputSelect
subtitle: 可输可选组件
cols: 1
---

该组件用来设置可输入的下拉框，需设置文本显示值text和数据库存取值value，同时可设置初始化选中项，同时可在输入框中过滤下拉选项，当下拉列表中只有一个选项时，可回车选中。

## API

|方法名|描述|参数|返回值|
|---|---|---|---|
|getValue|用来获取下拉框中被选中项的value值|无|下拉框选中项的值|
|validate|用来校验下拉选项是否被选中，返回是否通过校验|无|校验结果，bool类型|
|focus|用来设置下拉框聚焦|无|无|

### 属性

| 属性名称 | 描述 | 输入 | 默认 |
|:-----|:-----|:-----|:-----|
| options |  设置传入数据let options = [{ text: "111", value: 1 }, {text: "222", value: 2}, {text: "333",value: 2}]; <br>其中text是页面展示值，value是数据库存取值 | array |  |
| id |  设置InputSelect的id | string |  |
| style |  通过自定义style来改变InputSelect的整体样式 例如:边缘边距宽度 | object |  |
| className |  通过自定义class来改变InputSelect的整体样式 例如:边缘边距宽度 | string |  |
| labelClassName |  通过添加class的方式自定义下拉框的名称的样式 | string |  |
| labelStyle |  通过添加style的方式自定义下拉框的名称的样式 | object |  |
| selectClassName |  通过自定义class来改变input的样式 例如:边框颜色背景 | string |  |
| selectStyle |  通过自定义style来改变input的样式 例如:边框颜色背景 | object |  |
| optionClassName |  通过自定class来改变option的样式 | string |  |
| optionStyle |  通过自定style来改变option的样式, *set optionStyle={{width:'300px'}} for setting the width of the dropdown width | object |  |
| label |  设置下拉框的名称文字 | string |  |
| labelPosition |  设置输入框的名称文字的位置 before代表名称文字在输入框的左边，after代表名称文字在输入框的右边 | enum:<br>&nbsp;"before"<br>&nbsp;"after"<br> | "before" |
| value |  设置默认的value值,若同时设置了selectedIndex则以value为准 | number |  |
| selectedIndex |  设置默认的index,此处为数据属性options中对应的index | number |  |
| disabled |  设置inputSelect的灰化 | bool | false |
| enablHorzScroll | 是否为弹出窗口设置水平滚动条 | bool | false |
| showSearchTip |  是否启用“未找到”提示 | bool | true |
| required |  设置组件是否为必填项 | bool | false |
| zIndex | InputSelect Popup zIndex can be override by the user  | number | 9999 |
| popupDirection |  下拉框弹出方向(注:当弹出方向空间不够时会自动切换到其他方向) | "top"<br>"bottom" | "bottom" |
| onChange |  设置inputSelect的onChange事件,监听inputSelect选中值得变化<br><br>**签名:**<br>`function(value: any, oldValue: any) => void`<br>*value:* 当前选中的选项的value值<br>*oldValue:* 组件上一次算中值 | function |  |
| onFocus |  设置inputSelect的onFocus事件<br><br>**签名:**<br>`function(e: object) => void`<br>*e:* 原生dom事件 | function |  |
| onBlur |  设置inputSelect的onBlur事件<br><br>**签名:**<br>`function(e: object) => void`<br>*e:* 原生dom事件 | function |  |
| onInputEnter |  return the  value of input on Enter press. <br><br>**Signature:**<br>`function(e: object, value) => void`<br>*e:* Primary dom events`<br>*value:* value entered| function |  |
| onInputKeyUp |  inputSelect on inputbox keyUp event should fire this call back.<br><br>**Signature:**<br>`function(value) => void`<br>*value:* value entered | function |  |
