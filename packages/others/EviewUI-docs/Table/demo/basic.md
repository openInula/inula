---
order: 0
title:
  zh-CN: 基本属性设置
  en-US: Basic Setting
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import img1 from '@images/table_1';
import img2 from '@images/table_2';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

const rows = [];
rows.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo']);
rows.push(['Shop Storage', 'Active', 3, 'ICMP Echo']);
rows.push(['IT Link', 'Active', 7, 'Critical']);
rows.push(['R&D VPN1', 'Active', 3, 'Major']);
rows.push(['R&D VPN6', 'TO BE', 5, 'ICMP Echo']);

const childTableRowCheckRecord = {};
export default class TableBasic extends React.Component {

  state = {
    checkedRows: []
  };
  handleHeaderCheck = (row, checkedRows, e) => {
    console.log("header checked...")
  };
  handleRowCheckForChildTable = (selects, curParentRowIndex) => {
    childTableRowCheckRecord[curParentRowIndex] = selects;
  };

  handleRowExpend = (row) => {
    let columns = [
      {
        title: 'VPN Name',
        width: 300,
        key: 'col_1',
      },
      {
        title: 'State',
        width: 300,
        key: 'col_2',
      },
      {
        title: 'Site',
        width: 300,
        key: 'col_3',
      },
      {
        title: 'Alarm',
        allowSort: false,
        key: 'col_4',
      },
    ];
    const rowsdata = [];

    for (let i = 0; i < 5; i++) {
      rowsdata.push([`R&D VPN2${i}`, 'Active', i, 'ICMP Echo']);
    }
    return (<div style={{ padding: "20px", background: "#efefef" }}>
      <Table
        columns={columns}
        dataset={rowsdata}
        enableCheckBox
        headerCheckBoxSortAllow={true}
        checkedRows={childTableRowCheckRecord[row.rowIndex]}
        onRowCheck={(curRow, rows) => this.handleRowCheckForChildTable(rows, row.rowIndex)}
        ref={innerTable => { this.innerTable = innerTable; }} /></div>);
  }
  handleItemClick1 = (item) => {
    let res = [];
    if (item.value === 1) {
      rows.forEach((_, index) => res.push(index));
    } else if (item.value === 2) {
      rows.forEach((_, index) => {
        (index + 1) % 2 !== 0 && res.push(index);
      });
    } else if (item.value === 3) {
      rows.forEach((_, index) => {
        (index + 1) % 2 === 0 && res.push(index);
      });
    }
    this.setState({ checkedRows: res})
  };
  renderStateColumn(cell) {
    if (cell === 'TO BE') {
      return (
        <div>
          <img src={img1} style={{ verticalAlign: 'bottom' }} alt="TO BE" />
          {' '}
          TO BE
        </div>
      );
    }
    return (
      <div>
        <img src={img2} style={{ verticalAlign: 'bottom' }} alt="Active" />
        {' '}
        Active
      </div>
    );
  }


  render() {
    const [version, theme] = getDemoVersion();
    const columns = [
      {
        title: 'VPN Name',
        key: 'c_1',
        id: "col_1",
      },
      {
        title: 'State',
        key: 'c_2',
        render: cell => this.renderStateColumn(cell),
        allowSort: false,
        id: "col_2",
      },
      {
        title: 'Site',
        display: true, // Hide column,
        id: "col_3",
        key: 'c_3',
      },
      {
        title: 'Alarm',
        key: 'c_4',
      },
    ];

    let options = [{ text: "Select All Data", value: 1 },
      { text: "Select Odd Rows", value: 2 },
      { text: "Select Even Rows", value: 3 }];

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Table
          columns={columns} // Column Details
          dataset={rows} // Data Set
          selectedRowIndex={2} // Row ID 2 is selected.
          enableColumnFilter //Allow column to be selected.
          checkBoxOptions={options}
          onRowExpend={this.handleRowExpend}
          onRowCheck={this.handleHeaderCheck}
          enableCheckBox
          checkedRows={this.state.checkedRows}
          enableRowExpand
          disableRowExpand={[2]}
          checkBoxPopupData={{ data: options, optionStyle: { width: '15rem' }, onItemClick: this.handleItemClick1 }}
        />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableBasic />, mountNode);

```
