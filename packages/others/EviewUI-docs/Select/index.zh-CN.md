---
category: Components
type: 数据录入
title: Select
subtitle: 下拉选择框
cols: 1
group: Selector 选择框
---

该组件用来设置下拉框，需设置文本显示值text和数据库存取值value，同时可设置初始化选中项，支持自定义样式和onChange事件的回调。

## API

| 方法名 | 描述 | 参数 | 返回 |
|---|---|---|---|
|getValue|用于获取选定项的值在下拉框中|不|下拉框选择配置项的值|
|validate|用于手动进行非空检查返回是否通过|不|检查结果bool类型|
|focus|设置下拉框焦点|No|不|

### 属性

| 属性名称 | 描述 | 输入 | 默认 |
|:-----|:-----|:-----|:-----|
| options |  设置传入数据<br> [{`text`: "Create",  //页面展示值<br> `value`: 1, //.该值作为回调参数传入，*每个列表项有唯一的回调参数*。<br> `icon`:"image/create-default.png",//下拉项中的图标（可不定义）<br> `iconActive`:"image/create-selected.png" //下拉项选中时的图标（可不定义）<br> `label`: true // //将列表项设置为标签。（可不定义）<br>},<br> {text: "Delete",value: 3, icon:"image/delete-default.png", iconActive:"image/delete-selected.png" }]; | array |  |
| id |  设置Select的id | string |  |
| style |  通过自定义style来改变组件的的整体样式 例如:margin padding display | object |  |
| className |  通过自定义class来改变组件的整体样式 例如:margin padding display | string |  |
| labelClassName |  通过添加class的方式自定义label的名称的样式 | string |  |
| labelStyle |  通过添加style的方式自定义label的名称的样式 | object |  |
| selectClassName |  通过自定义class来改变select的样式 例如:border color background width height | string |  |
| selectStyle |  通过自定义style来改变select的样式 例如:border color background width height | object |  |
| optionClassName |  通过自定class来改变option的样式 | string |  |
| optionStyle |  通过自定style来改变option的样式, *set optionStyle.width for setting the width of the popup window | object |  |
| iconClassName |  通过添加class的方式自定义下拉框中的图标以及样式 | string |  |
| iconStyle |  通过添加style的方式自定义下拉框中的图标以及样式 | object |  |
| label |  设置下拉框的名称文字 | string |  |
| labelPosition |  设置组件的名称文字的位置 before代表名称文字在组件的左边，after代表名称文字在组件的右边 | enum:<br>&nbsp;"before"<br>&nbsp;"after"<br> | "before" |
| selectedIndex |  设置选中的index,此处为数据属性options中对应的index | number |  |
| value |  通过设置value值来选中select中的对应项 | any |  |
| disabled |  设置组件的灰化 | bool | false |
| defaultLabel |  在列表中指定默认的建议文本。| string |  |
| enablHorzScroll |  Set the horizontal Scrollbar for the popup window | bool | false |
| hintType | 显示提示信息 | enum:<br>&nbsp;"div"<br>&nbsp;"tip"<br> | 'div' |
| required |  设置组件是否为必填项 | bool |  |
| zIndex | select Popup zIndex can be override by the user  | number | 9999 |
| onChange |  设置select的onChange事件，参数为：<br><br>**签名:**<br>`function(value: any, oldValue: any, text: any, oldText: any) => void`<br>*value:* 当前选中的select的value值<br>*oldValue:* 组件上一次选中值<br>*text:* Selected Displayed Text<br>*oldText:* Selected Old Displayed Text | function |  |
| onFocus |  设置select的onFocus事件，参数为：<br><br>**签名:**<br>`function(event: object) => void`<br>*event:* 原生dom的聚焦事件 | function |  |
| onBlur |  设置select的onBlur事件，参数为：<br><br>**签名:**<br>`function(event: object) => void`<br>*event:* 原生dom的聚焦事件 | function |  |
| popupDirection |  定义弹出方向选择控制 | enum:<br>&nbsp;'top'<br>&nbsp;'bottom'<br> |  |
| lazySearch |  Object that defines the lazy search options. If this property is defined, then the records that are being shown in the search suggestion drop down will be paged, and lazy loaded through the defined callback method. User need to provide only a set of 10 records at a time. The data structure is as : <br>`totalRecords`: The total number of search results for the searched string <br>`onLoadRecords`: The callback that will load next set of the data to be displayed in the popup. This method will have the index of the first element in the view port as the parameter. [Under development]| object |  |
| isScrollAlwaysDisplay |  设置滚动条一直出现 | bool | false |
| tipStyle |  通过添加tipStyle来自定义提示框的样式 | object |  |