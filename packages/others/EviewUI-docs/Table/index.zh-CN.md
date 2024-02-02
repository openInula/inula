---
category: Components
type: 数据展示
title: Table
subtitle: 表格
cols: 1
---

表格组件，支持分页、列过滤、排序、列宽拖动、列编辑等多种功能。

## Shortcut Keys
| Opration            | Shortcut Keys   |
| --------------      | ----------- | ------ | ------------------------------------------------------------------------------------------------|
| Tab                 | setFocus to the first header cell.Using tab key you set focus to next cell , In editable cell if use the tab again the focus set to the component like text filed , select etc |
| ctrl+End            | Focus Moved Out of the Table  |
| space or Enter      | To select the checkBox  |
| RightArrow          | Focus moves to the right side cell |
| LeftArrow           | Focus moves to the left side cell  |
| UpArrow             | Focus moves to the upper cell |
| DownArrow           | Focus moves to the down cell |
| shift+F             | To open the column filter dialog  |
| Esc                 | To dispose the filter dialog  |
| Enter               | To expand or collapse table row in expanded table  |
| ctrl+Home           | To get focus to the first table header element. |
| ctrl + Enter        | 响应 doubleClick 事件 |
| alt + Enter         | 选中可选行 |

## API

| 方法名                               | 描述                                                                                                                                                                                    | 参数          | 返回值 |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------| ------ |
| getSelectedRowData                | 单击选中行原始数据(若无选中项，则为空数组):[v1, v2, v3, ...]                                                                                                                                              | 无           | array  |
| getSelectedRowIndex               | 单击选中行的行号                                                                                                                                                                              | 无           | number |
| getCheckedRowsData                | 多选框选中项数组(若无选中项，则为空数组):[...,[v1, v2, v3, ...], ...]                                                                                                                                    | 无           | array  |
| getCheckedRowsIndexes             | 多选框勾选行的行号                                                                                                                                                                             | 无           | array  |
| getCurrentPage                    | 获取表格当前展示页序号                                                                                                                                                                           | 无           | number |
| getPageSize                       | 获取表格内展示的行数                                                                                                                                                                            | 无           | number |
| getSortColumn                     | 放回当前排序列的key,原始column中定义的key                                                                                                                                                           | 无           | string |
| getSortType                       | 返回当拍序列的排序方式                                                                                                                                                                           | 无           | string |
| getDataset                        | Table中全量数据(若数据，则为空数组):[...,[v1, v2, v3, ...], ...]                                                                                                                                    | 无           | array  |
| getEditData                       | 当前编辑行的数组(若无编辑中行，则为null):[v1, v2, v3, ...]                                                                                                                                             | 无           | array  |
| setRowEditable                    | 设置指定行可编辑，如果columns设置了可编辑列的数组，则只会有此行的指定列可编辑；只可指定一行编辑。                                                                                                                                  | id, columns | object |
| setSizeColumnFit                  | 设置指定列，使其内容能够完整展示;                                                                                                                                                                     | id          | None   |
| reSetcolumnSize                   | 将列宽重置为原始值。<br> 注意：该api只对列显隐及顺序没有改变的场景有效，其余场景请谨慎使用。                                                                                                                                    | None        | None   |
| setScrollPositionToColumn         | 滚动到指定的列位置. example:setScrollPositionToColumn(columnName)                                                                                                                              | string      | None   |
| handleParentResize                | 如果表格父元素宽度更新，则重新计算列宽 .  example:handleParentResize()                                                                                                                                   | None        | None   |
| getRowClickNotTriggerCheckBoxFlag | 获取行选中时是否出发checkbox标识 .  example:getRowClickNotTriggerCheckBoxFlag()                                                                                                                   | None        | bool   |
| getOriginDataset                  | 传入Table中的全量原始数据(若数据为空，则为空数组):[...,[v1, v2, v3, ...], ...]                                                                                                                             | 无           | array  |
| getRowSlidingMultipleSelectedFlag | 获取是否开启滑动多选标识 .  example:getRowSlidingMultipleSelectedFlag()                                                                                                                           | None        | bool   |
| setScrollBarAt                    | 设置纵向滚动条的位置(只在设定了表格height的场景下起作用), 传入行号 . example: setScrollBarAt(rowId)                                                                                                               | rowId       | 无 |
| resetStartRow                     | (ScrollTable组件专用)类似于setScrollBarAt的功能，支持从指定位置开始展示, 传入行号 . example: 取这个ref：wrapperRef={refTable => this.getTableWrapperRef = refTable}，然后用这个方法this.getTableWrapperRef.resetStartRow(0) | rowId       | 无 |
| setFilterClose                    | 设置过滤器关闭的回调函数                                                                                                                                                                          | 无           | 无 |

### 属性

| 属性名称 | 描述 | 输入 | 默认 |
|:-----|:-----|:-----|:-----|
| id |  表格的唯一标示编号，未指定则自动生成 | string | null |
| columns| 定义表格列头。<br>注意：冻结列的位置要排在最前面 | array |  |
| dataset |  行数据：推荐使用对象形式{键1：值1，键2：值2，...}；键对应columns里的key | array | []  |
| pagingType |  分页类型：下拉或数字（'list','select'） | string | 'list' |
| className |  Table组件所在div的样式 | string |  |
| height |  Table组件的高度（像素. This height is applicable to table Body part, Excluding the Table Header, Scroll Bar & Pagination. | number |  |
| minHeight |  Table组件的最小高度（像素） | number | '200px' |
| width |  Table组件的宽度（像素） | number |  |
| maxHeight   |  （以像素为单位）表格的最大高度。<br>注意：当配置maxHeight时，则不应配置height | number |  |
| onRowClick |  行选中事件回调<br><br>**签名:**<br>`function(row: Object, e: Object) => void`<br>*row:* 行对象<br>*e:* 原生点击事件 | function | null |
| onRowMouseEnter |  行mouseenter事件回调<br><br>**签名:**<br>`function(row: Object, e: Object) => void`<br>*row:* 行对象<br>*e:* 原生点击事件 | function | null |
| onRowMouseLeave |  行mouseleave事件回调<br><br>**签名:**<br>`function(row: Object, e: Object) => void`<br>*row:* 行对象<br>*e:* 原生点击事件 | function | null |
| onCellClick |  单元格点击事件回调<br><br>**签名:**<br>`function(cell: Object, row: Object, e: Object) => void`<br>*cell:* 列对象<br>*row:* 行对象<br>*e:* 原生点击事件 | function | null |
| onRowCheck |  行checkbox点击事件回调<br><br>**签名:**<br>`function(row: Object, checkedRows: array, e: Object) => void`<br>*row:* 行对象<br>*e:* 原生点击事件 | function | null |
| onHeaderCheck |  表头勾选事件回调<br><br>**Signature:**<br>`function(checkedRows: array, checked: bool) => void`<br>*checkedRows:* 已勾选行数据主键数组，若设置keyIndex，数组元素为行数据中keyIndex列的数据，若不设置，则为行序号. <br>*checked:* 当前headerCheckbox勾选状态 | function | null |
| onPageChange |  分页点击回调<br><br>**签名:**<br>`function(currentPage: num) => void`<br>*currentPage:* 当前页的序号 | function | null |
| onPageSizeChange |  分页尺寸点击回调<br><br>**签名:**<br>`function(pageSize: num) => void`<br>*pageSize:* 表格页面可容纳行数 | function | null |
| onColumnSort |  排序点击事件<br><br>**签名:**<br>`function(sortColumn: Object, sortType: string) => void`<br>*sortColumn:* 排序列<br>*sortType:* 排序方式 | function | null |
| onRowExpend |  点击展开的时候的回调函数<br><br>**签名:**<br>`function(row: Object) => void`<br>*row:* Table行对象 <br> Note : Avoid calling the setState on Table in this method. If required to set the state in table then use onRowExpendClick | function | null |
| customSortFun | 自定义排序函数<br><br>**Signature:**<br>`function(key: string, aValue: string, bValue: string) => -1(aValue>bValue), 1(bValue>aValue), 0(aValue==bValue)`<br>*key:* Column key value<br>*aValue:* first value to compare<br>*bValue:* second value to compare | function | function(key, aValue, bValue) {} |
| onEdit |  单元格编辑时的回调函数 <br><br>**Signature:**<br>`function(oldval: string, newval: string, cell: Object, row: Object,event:Object) => void`<br>*oldval:* The current value of the cell<br>*newval:* the new value of the cell<br>*cell:* the current cell which is being edited<br>*row:* the current row which is being edited  <br>*event:* native event for edit| function | function () { } |
| onEditingCellBlur |  正在编辑的单元格的blur回调事件 <br><br>**Signature:**<br>`function(cell: Object, row: Object) => void`<br>*cell:* Cell that is being edited<br>*row:* Row that is being edited | function | function () { } |
| enablePagination |  开启分页 。<br>注意：当表格column列数很少并且开启分页时，则不应该配置maxHeight，可能导致分页元素遮挡| bool | false |
| pagingProps | Paging子组件的props, 详情请查阅Paging的API | object |  |
| splitPagination | 如果为“true”，则将分页切换到右侧。| bool |  true |
| enableColumnDrag |  开启拖动 | bool | true |
| enableColumnFilter |  开启列筛选 | bool | false |
| columnFilterZIndex |  自定义列筛选Dialog的zIndex | bool | false |
| enableCheckBox |  开启多选框复选支持 | bool | false |
| disableHeaderCheckbox |  是否禁用表头复选框 | bool | false |
| checkType |  启用复选框时，可指定选择类型。Single : 单选, Multi : 多选  | enum:<br>&nbsp;'single'<br>&nbsp;'multi'<br> | multi |
| HeaderCheckedStatus |	业务组自行控制表头复选框的状态（ScrollTable、VirtualizedTable 需要用到该属性）。可选项有：empty、all、half | string |  |
| enableRowExpand |  启用展开 | bool | false |
| enableMulitiExpand |  允许展开多个 | bool | false |
| pageSize |  表格可展示行数：是 pageSizeOptions 的第 0 个元素 | number | 10 |
| recordCount |  总记录数 | number | 0 |
| recordCountDisp |  自定义总记录数的显示，会替代recordCount作为展示内容 | string |  |
| currentPage |  当前页码 | number | 1 |
| pageSizeOptions |  分页选项<br>[10, 20, 50, 100] | array | [10, 20, 50, 100] |
| selectedRowIndex |  设置选中行号 | number | null |
| checkedRows |  checkbox勾选项数组，如果是ScrollTable，则checkedRows中需要保存原始全量数据的索引 | array | [] |
| disableRowIds |  Array of rowIds to disable | array | [] |
| disableRowExpand | 传入rowId禁用行展开 | array | [] |
| onRowRightClick |  鼠标右键单击事件回调函数 <br><br>**签名:**<br>`function(e: Object, row: Object) => void`<br>*e:* Native click event<br>*row:* Line object | function |  |
| cellClassName |  会应用于单个单元格的类名里。形如以下格式的对象：`{    [rowindex]: {      [colkey]:[cellclassname]    } }`<br><br>注意：此类中给出的样式不应尝试覆盖可能会扰乱组件本身的默认样式。使用该属性时要小心 | object |  |
| customStyleRows |  为指定行设置css style, 数据格式如下: `{[rowindex]: {rowStyle} }` 或者传入一个函数，返回数据结构 { className: value1, style: value2 }, 不必同时存在className和style 将作用于整个行样式。注意: 该属性仅支持自定义行样式，无法覆盖单元格样式。 | object |  |
| rowStyle |  为所有行设置css style, 数据格式如下: `{{rowStyle}}`。注意: 该属性优先级比customStyleRows要低，会被customStyleRows样式覆盖。 | object |  |
| itemOrderChanger|	在列选择器里是否使用项目顺序调整功能 | bool     |false|
| disableEviewSort|	如果业务组不希望使用组件的默认排序能力，可使用该属性。注意：如果设置为真， "customSortFun" 也将不会再调用 | bool     |false|
| mutiSelectEnable|	if true the multi select using control+click is supported .| bool     |false|
| onFilterOkClick |  列展示双向选择器中“确定”按钮的回调函数。<br><br>**Signature:**<br>`function(leftItems: Object, rightItems: Object) => void`<br>*leftItems:* Line object <br>*rightItems:* Line object | function |  |
| editOptions |  启用renderType: Table.ColumnRenderType.SELECT时，可按行、按列自定义select组件的options（可参考 列依赖性 样例）。格式为一个二维数组：[      [{列的key: { options: {}, isEditable: true/false } }],      [...],      ]     其中 isEditable属性为false时，用于表示单元格不可编辑 | array |  |
| onColumnSizeChange| 列宽调整时的回调函数.<br><br>**签名:**<br>`function(column: Object) => void`<br>*column:* column object |function|null|
| paginationPopupDirection |  定义分页组件中每页展示数控件弹出窗口的方向 | enum:<br>&nbsp;'top'<br>&nbsp;'bottom'<br> |  |
| onDoubleClick | 双击不可编辑单元格上的事件回调 <br><br>**签名:**<br>`function(row: Object, cell: Object,e:Object) => void`<br>*row:* Line object <br>*cell:* cell object <br>*e:* Native click event| function |  |
| expandedRow |  已扩展的行索引数组 | array | [] |
|onRowExpendClick| 行展示时的回调函数 <br><br>**签名:**<br>`function( row: Object) => void`<br>*row:* Line object <br> Note : Related Callback onRowExpend|function| |
| showEmptyImage|	当表中不存在数据时，是否展示默认背景图 | bool     |true|
| emptyTableMsg|	当表中不存在数据时，自定义展示消息 | string |true|
| useCustomToolTip| 启用自定义提示框，代替浏览器提示框。| bool |false|
| customToolTipStyle| 自定义提示框样式，需和useCustomToolTip一块使用。| object | {} |
| showTooltipOverFlow | 是否文本溢出时才显示自定义 tooltip （0.1.x 版本支持) | boolean | false |
|checkBoxPopupData| 在表头checkbox列旁边支持生成一个popup弹出框，参考 基本属性设置 样例。数据形如 {{data:options, optionStyle:{ width: '15rem' },onItemClick:this.handleItemClick1 }}.| object |  |
|isRequiredToUpdateColumns| 是否更新columns。如果设置为true，不会保存之前的列状态，由业务组自己维护列状态。<br>特殊场景：如果设置为 [["width"]]，表示列宽度将由组件维护保存，此时外部重新设置的列宽将不起作用。 | bool或[["width"]] | false |
|pagingSelectWidth| 自定义分页中Select下拉菜单的宽度 | string | |
|totalCount| 总记录数(滚动表格和滚动分页动态表格使用)，此字段应为必填字段 | number |0 |
|displayPerPage| 设置每页的记录数，如果用户没有输入，则由组件通过行高计算生成  | number |0 |
| onTurnPage  | 滚动表格滚动时的回调函数，参数（currentStartRow, oldStartRow, displayPerPage, event）,分别是当前页起始序号、上次序号、每页展示数、事件 | function | none  |
| headerCheckBoxSortAllow|	是否允许表头复选框选中元素排序，为true，则出现排序箭头图标 | bool |false|
| slidingMultipleSelected|	是否开启滑动多选，默认不开启。(此功能在enableCheckBox为true是生效) | bool |false|
| onMouseUpOnRowForDrag| 滑动选择事件,参数(startRow, endRow, checkedRows, e)分别是滑动起始行、结束行、选中行、事件 . | function | none  |
| onHeaderColumnSort| 表头checkbox排序点击事件响应函数 .<br>`function(event: Object, sort: string) => void`<br>event:鼠标点击事件<br>*sort:* 排序类型 'asc' or 'desc'<br>| function | none  |
| enableShowLineNumber| 是否显示行号列 | bool | false|
| groupHeaders |  二级表头。使用原有columns配置二级表头的第二行列头。使用此配置配置二级表头的第一行列头。未配置列合并的表头会自动进行行合并。例如： [{startColumnKey： String 指定开始列的Key,numberOfColumns: Number 合并列的个数,title: String 列头显示的文本}，...] | array | [] |
| allowShortCutsFilter| 允许快捷方式 shift+F 打开列过滤器对话框 | bool |  true |
| isScrollToExpandedRow| 是否滚动到展开行(表体Y轴出现滚动条属性生效) | bool | false |
| disableHeaderDoubClick| 是否禁用表头的双击恢复列宽 | bool | false |
| disableCheckboxArr | 是否禁用checkBox复选框 | array | [] |
| onMouseMoveOnRowForDrag | 滑动多选过程中的回调 `function( checkedRows: Object) => void` | function | null |
| defaultColumns | 设置表格重置的默认值, 数组中传入columns中key值 | array | |
| enableOriginSort | 设置是否排序中存在origin 状态 | boolean | true |
| onScroll | 滚动回调 | function(target) |  |
| keepTableWidthAfterDragging | 拖拽中是否保持表格宽度不变 | boolean | true |
| canTabIntoTable | 是否可以使用tab键进入到表格内部，默认只能通过方向键 | boolean | false |
| autoAdjustMaxWidth |	Sets the table column width to the maximum value configured | number | 1000 |
| autoAdjustWidth |	Enables the table column width auto adjust feature | boolean | false |
| enableZebraCrossing | 表格是否显示斑马纹(aui3.0有效) | boolean | false |
| isDisplayHeaderMultipleLine | 是否开启表头列换行展示,注意该功能不适用于居中对齐的列 | boolean | false |
| enableColumnFilterSearch | 列筛选是否支持搜索 | boolean | false |

## 属性详情

> 列  `<a id="columns"></a>`

| 属性名称 | 描述 | 输入 | 默认 |
|:-----|:--------------------------------------------|:-----|:-----|
| align | 列对齐，支持3个属性 'left' 'center' 'right' | string | 'center' |
| allowSort | 设置列顺序切换,支持'true' 'false' | bool | 'true' |
| sort | 添加一个默认排序类型之后点击不再排序，支持3个属性'asc' 'desc' 'origin' | string | 'asc' |
| display | 列显示或隐藏 | bool | 'true' |
| renderType | 设置列编辑类型。如果该参数不设置该字段的值不可编辑。参考上述参数枚举值 | object | 'text_field','date_picker','check_box','check_box_group','radio','select','progress_bar','custom' |
| getCompareValue | 设置本地排序功能 | function | ' v => v.age'|
| key | 列数据的唯一标识 必须传入 | object |  |
| options | 需要建立编辑列表渲染的其他参数根据呈现类型 | object | '{}' |
| render | td中展现定制内容。编辑是其处于编辑模式时| function |'(v, r,options,row,{isEdit}) => ${v.age} Year' |
| tipFormatter | 自定义鼠标移入单元格后提示信息显示的内容，配置tipFormatter = 'custom_NO_TIP'，则此列(包含列头）不显示title或tip；配置function，将cell对象处理成title可识别的文本。<br><br> 特例：希望某数据单元格不弹出tip，可返回一个空格' '，组件会视为此时不需要弹出tip。 | function or string |         tipFormatter: (cellValue) => { return 'text'; } |
| titleTipShow | 列头是否展示title. 目前支持 : 'always', 'never' | string | 'always' |
| titleTipData | 自定义列头title属性的内容，默认为列头内容 | string | |
| title | 列title，必配 | string | |
| width | 列宽 | number | |
| validator | 回调的onchange事件验证文本字段,这样用户可以验证并显示错误提示 | function |  |
| customSort | 是否支持自定义排序 |  bool | |
| isMovable | 列是否可被移动 | bool | 'true' |
| isEditable | 列是否可编辑 | bool | 'true' |
| displayPolicy | 如果此属性设置为'不'与该列显示false不会向用户显示在任何一点也不过滤对话框中。但此属性必须配合用户显示错误还会有不良影响列显示。| string | 'never' |
| customProps | 用户可以添加自定义组件道具在此对象。支持道具选择Style为输入和Selectcomponent.Eg定义道具{选项样式选项样式} | string |  |
| freezeCol | 如果该属性配置在水平滚动该列将一直处于可见area.if此属性配置为true则不可见filterbox| bool | 'true'  |
| cellClassName |  它可以用来设置rowcells classname的特定列 | string | 'classnameforcellsofthiscolumn' |
| filter |  启用按列过滤功能： 包含属性有component: 自定义组件, className: 'eui_table_filter', style: { color: 'red' } | object | '{}' |
| isFiltered | 如果该列已经被过滤，则用户应该将值修改为true. | bool | 'false' |
| enableRowMoveUpDown | 支持行上移下移，设置为true，支持行上移下移，在当前列增加上移下移图标| bool | 'false' |
| disableOrderChange | 如果设置为true，该列不支持调整。| bool | 'false' |
| lineWrap | 如果需要table纯文本内容支持换行展示，可以设置此属性为‘lineWrap’，默认不换行展示。| string | 'lineWrap' |

## 枚举类型

> ColumnRenderType

| 枚举常量名      | 值                | 描述                           |
| --------------- | ----------------- | ------------------------------|
| TEXT_FIELD      | 'text_field',     | 单行文本控件                   |
| DATE_PICKER     | 'date_picker'     | 日期选择控件                   |
| TIME_SELECTOR   | 'time_selector'   | 时间选择控制                   |
| CHECK_BOX       | 'check_box'       | 复选控件                       |
| CHECK_BOX_GROUP | 'check_box_group' | 复选控件组                     |
| RADIO_GROUP     | 'radio_group'     | 单选控件                       |
| SELECT          | 'select'          | 下拉选择控件                   |
| INPUT_SELECT    | 'InputSelect'     | 下拉选择控件                   |
| PROGRESS_BAR    | 'progress_bar'    | 进度条控件(只展示，不参与编辑)   |
| CUSTOM          | 'custom'          | 自定义控件(自己render)         |


> Table.ColumnRenderType.CHECK_BOX_GROUP | Table.ColumnRenderType.RADIO | Table.ColumnRenderType.SELECT| Table.ColumnRenderType.INPUT_SELECT

```json
options: [
  { "text": "唱歌", "value": 1 },
  { "text": "游泳", "value": 2 },
  { "text": "拍片", "value": 3 },
  { "text": "打牌", "value": 4 },
],

dataset: [
  ...,
  [...,[1, 3],...] // 对应dataset中该列传值，意义是选中【唱歌】，【拍片】
  ...,
]
```
>  Table.ColumnRenderType.SELECT

```json
options: [
  { "text": "唱歌", "value": 1 },
  { "text": "游泳", "value": 2 },
  { "text": "拍片", "value": 3 },
  { "text": "打牌", "value": 4 },
],
isShowPopup:true,
dataset: [
  ...,
  [...,[1, 3],...] // 对应dataset中该列传值，意义是选中【唱歌】，【拍片】
  ...,
]
```

>  Table.ColumnRenderType.CHECK_BOX

```json
options: {
  "label": "激活",
},
dataset: [
  ...,
  [...,true,...] // 对应dataset中该列传值，意义是选中
  ...,
]
```
> Table.ColumnRenderType.TIME_SELECTOR
```json
 options:{format:'hh:mm:ss'},
```
> Table.ColumnRenderType.DATE_PICKER
```json
 options:{type:'datetime',callBack:clientTimezoneRule},
 ```
> Table.ColumnRenderType.PROGRESS_BAR

```json
options: {
  "format": "percent",
},
dataset: [
  ...,
  [...,98,...] // 对应dataset中该列传值，意义是选中
  ...,
]
```
**对于其它 `renderType` 无需设置 `options`**
- **render** `可选` 设置字段的渲染函数，未设置则根据 `renderType` 渲染
- **title** `必填` 显示在标头上的名称
```json
{
  "title": "School",
}
```
- **tipFormatter** `选填` 设置鼠标悬浮在单元格上时显示的内容的渲染函数（若数据为非文本或不可直接转为文本则必填）
- **width** `可选` 设置列宽度，如果没有设置，列宽自适应。纯数字。
```json
{
  "width": 120,
}
```
## 注意事项
- 事项一：ScrollTable、VirturalizedTable组件的使用过程中，当存在虚拟滚动条时，由于其逻辑计算与表格高度、行高等密切相关，要求使用者需要保证整体最小高度起码有一行数据能显示全，否则可能会出现滚动条不显示的异常情形。
- 事项二：Table组件表头复现框的选中状态由当前表格所有数据的状态控制。规则为：<br/>
  1、数据项都为选中态，则表头为全选；<br/>
  2、数据项都为未选中态，则表头为未选中；<br/>
  3、否则为半选；<br/>
  至于数据项是否为选中态，规则为：<br/>
  1、真实选中，即出现在checkedRows里；<br/>
  2、checkedRows长度大于0且出现在disableRowIds里；<br/>
  3、checkedRows长度大于0且出现在disableCheckboxArr里；<br/>
  由于历史原因，此规则一直沿用。如有不适用场景，请使用 HeaderCheckedStatus 属性，自行控制状态。
- 事项三：仅ScrollTable支持shift跨页勾选。规则为：<br/>
  1、需要给ScrollTable传入enableShiftCheck=true字段
  2、相应的表格数据需新增`{key:"scrollRowIndex",value:i}`

  - 如果是二维数组形式的数据

    ```
        const totalDataList = [];
        for(let i = 0; i < 20000; i++) {
            totalDataList.push([
                i,
                `VPN Name${i}`,
                `State${i}`,
                `Site${i}`,
                `Alarm${i}`,
                `Warn${i}`,
                `Info${i}`,
                `Error${i}`,
              {key:"scrollRowIndex",value:i},//其中i 为原始数据下标
            ]);
        }
    ```

  - 如果是对象数组的形式格式如下

 ```
    const totalDataList = [];
    for(let i = 0; i < 20000; i++) {
        totalDataList.push({
            id: i,
            name: `VPN Name${i}`,
            state: `State${i}`,
            site: `Site${i}`,
            alarm: `Alarm${i}`,
            warn: `Warn${i}`,
            info: `Info${i}`,
            error: `Error${i}`,
            scrollRowIndex:i //其中i为原始数组下标
        });
    }
```
  3、仅支持一次传入全量数据的使用场景，滚动请求新数据的场景不支持shift跨页勾选；<br/>
  4、操作shift跨页勾选时，单次操作数据量应该小于1万，否则不保证操作性能；<br/>
  5、跨页shift多选不支持排序操作；<br/>

## 特殊场景处理方案

### 场景一：表格设置了最大高度，扩展行内容延时加载，撑满最大高度后，表格缺少竖向滚动条
- 可通过table句柄，调用 setTableHeight() 方法来调整表格样式

### 场景二：表格设置了高度、isScrollToExpandedRow，扩展行内容延时加载，扩展行内容未显示完整
- 可通过table句柄，在扩展行内容渲染完成后调用 scrollToExpandedRow() 方法来手动调整
