---
order: 10
title:
  zh-CN: 列选择选项
  en-US: Additional Data
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import Select from 'eview-ui/Select';
import Checkbox from 'eview-ui/Checkbox';
import DropDown from 'eview-ui/DropDown';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

const optionsValue = [{ text: "5", value: 5 }, { text: "10", value: 10 }, { text: "20", value: 20 }];
const columns = [
  {
    title: 'CheckBox',
    renderType: Table.ColumnRenderType.CUSTOM,
    key: 'Name_1',
    align: 'center',
    allowSort: true,
    display: true,
    isMovable: true,
  },
  {
    title: 'select ',
    renderType: Table.ColumnRenderType.CUSTOM,
    key: 'Name_2',
    align: 'center',
    allowSort: true,
    display: true,
    isMovable: true,
  },
  {
    title: 'Age',
    renderType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'age_1',
    align: 'center',
    allowSort: true,
    display: true,
    isMovable: true,
  },
  {
    title: 'DropDown',
    renderType: Table.ColumnRenderType.CUSTOM,
    key: 'dropDown_1',
    align: 'center',
    allowSort: true,
    display: true,
    isMovable: true,
  },
  {
    title: 'Progress',
    renderType: Table.ColumnRenderType.PROGRESS_BAR,
    options: {
      format: 'percent',
    },
  },
];

export default class TableAdditionalData extends React.Component {

  handleCellEdit = (old, newVal, cell, row) => {
    console.log(`Editing the cell value ...  Old Value:- ${old}, New Value:- ${newVal}, Edited Cell:- ${cell}, Edited Row:- ${row}`);
  };
  handleEditingCellBlur = (cell, row) => {
    console.log('handleEditingCellBlur .. ', cell, row);
  };
  handleChangeCheck = (a, b, event, data) => {
    console.log('handleChange..additional data: ', data);
  };
  handleClickButton = (e, data) => {
    console.log('handleClickButton: ', data);
  };

  render() {
    let switchStyle = { background: "blue" };
    const data = [1, 2];

    let options = [{ text: "Disabled", value: 1, disabled: true }, { text: "UK", value: 2 }, { text: "USA", value: 3 },
    { text: "UFO", value: 5 }, { text: "China", value: 4 }];

    let checkedState = null; let disabledState = null;

    const rows = [];
    for (let c = 1; c <= 5; c++) {
      rows.push([
        <Checkbox value="1" label="The Internet" checked={true} additionalData={{ row: c, column: 1 }} onChange={this.handleChangeCheck}></Checkbox>,
        <Select options={optionsValue} />,
        '28           dfgdfg_' + c,
        <DropDown text="text" position="left" data={options} />,
        Math.floor((Math.random() * 100) + 1) //Return a random number between 1 and 100
      ]);
    }
    const [version, theme] = getDemoVersion();

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Table
          columns={columns}
          dataset={rows}
          pageSize={10}
          ref={table => { this.table = table; }}
          className="tableColor"
          height={310}
          onEdit={this.handleCellEdit}
          onEditingCellBlur={this.handleEditingCellBlur}
          useCustomToolTip={false}
        />

      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableAdditionalData />, mountNode);

```
