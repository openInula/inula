---
order: 7
title:
  zh-CN: 开启列编辑
  en-US: Column Edit
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import Button from 'eview-ui/Button';
import DivMessage from 'eview-ui/DivMessage';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

import img1 from '@images/table_1';
import img2 from '@images/table_2';

let clientTimezoneRule = (year, id) => {

  let ruleForYear = {
    dstEndTime: "2017-10-29 04:00:00",
    dstStartTime: "2017-03-26 03:00:00",
    endDuration: "-3600",
    startDuration: "3600"
  }
  return ruleForYear;
}

let onEnterPress = () => {
  console.log("On Enter key press CallBack!!");
}

const optionStyle = {
  items: 2
};
const customProps = {
  optionStyle: optionStyle,
};
const columns = [
  {
    title: 'VPN data Name',
    titleTipShow: 'never',
    renderType: Table.ColumnRenderType.TEXT_FIELD,
    width: 150,
    key: 'vpndata',
    customSort: true,
    options: { isFocus: true },
    tipFormatter: (v) => {
      console.log("hello: ", v);
      return '';
    }
  },
  {
    title: 'SelectSite',
    titleTipShow: 'always',
    titleTipData: "Custom Title for this header",
    renderType: Table.ColumnRenderType.SELECT,
    options: [
      { text: 'China', value: 1 },
      { text: 'UK', value: 2 },
      { text: 'USA', value: 3 },
    ],
    width: 100,
    isShowPopup: true,
    key: 'site',
    customProps: customProps,
    render: (v, row, options, rowdata) => {
      if (v === 1) {
        return 'China';
      } else if (v === 2) {
        return 'UK';
      }
      else if (v === 3) {
        return 'USA';
      }
      return 'Others';
    },
    tipFormatter: (v) => {
      console.log("v: ", v);
      if (v === 1) {
        return 'China';
      } else if (v === 2) {
        return 'UK';
      }
      else if (v === 3) {
        return 'USA';
      }
      return 'Others';
    }
  },

  {
    title: 'Time',
    renderType: Table.ColumnRenderType.TIME_SELECTOR,
    width: 200,
    render: v => {
      let renderVal = '';
      if (v && v.length == 3) {
        renderVal = v[0] + ':' + v[1] + ':' + v[2];
      }
      if (v && v.length == 2) {
        renderVal = v[0] + ':' + v[1];
      }
      return renderVal;
    },
    options: { format: 'hh:mm:ss' },
    key: 'time'
  },
  {
    title: 'gender',
    width: 150,
    renderType: Table.ColumnRenderType.RADIO_GROUP,
    render: v => {
      if (v === 1) {
        return 'Male';
      } else if (v === 0) {
        return 'Female';
      }
      return 'Others';
    },
    options: [
      { text: 'Male', value: 1 },
      { text: 'Female', value: 0 },
      { text: 'Others', value: 2 },
    ],
    key: 'gender'
  },
  {
    title: 'Hobbies',
    width: 200,
    renderType: Table.ColumnRenderType.CHECK_BOX_GROUP,
    render: v => {
      if (v && v.length) {
        //Conctruct the value to be displayed
        var value = '';
        for (var i = 0; i < v.length; i++) {
          if (v[i] === 1) {
            value = value + 'Singing';
          } else if (v[i] === 2) {
            value = value + 'Swimming';
          }
          else if (v[i] === 3) {
            value = value + 'Movies';
          }
          else if (v[i] === 4) {
            value = value + 'Play';
          }
          value = value + ' ';
        }
        return value;
      }
      return '';
    },
    options: [
      { text: 'Singing', value: 1 },
      { text: 'Swimming', value: 2 },
      { text: 'Movies', value: 3 },
      { text: 'Play', value: 4 },
    ],

    key: 'hobbies'
  },
  {
    title: 'Stamina',
    width: 150,
    options: {
      format: 'percent',
    },
    customSort: true
  },
  {
    title: 'Acitve',
    width: 100,
    renderType: Table.ColumnRenderType.CHECK_BOX,
    options: {
      label: 'Acitve',
    },
    render: v => {
      if (v) {
        return 'Active';
      }
      return 'DeActive';
    },
  },
  {
    title: 'InputSelectSite',
    width: 200,
    renderType: Table.ColumnRenderType.INPUT_SELECT,
    options: [
      { text: 'China', value: 1 },
      { text: 'UK', value: 2 },
      { text: 'USA', value: 3 },
    ],
    onEnterCallBack: onEnterPress,
    key: 'inputsite',
    render: v => {
      if (v === 1) {
        return 'China';
      } else if (v === 2) {
        return 'UK';
      }
      else if (v === 3) {
        return 'USA';
      }
      return 'Others';
    },
  },
  {

    title: 'Date',
    renderType: Table.ColumnRenderType.DATE_PICKER,
    width: 200,
    options: { type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss', callBack: clientTimezoneRule },
    render: (value, rowData, options, row) => {
      return options ? options.updateValue : value ? typeof value == 'string' ? value : value.toDateString() : "";
    },
    key: 'date'

  },
];

var rows = [];
rows.push(['R&D VPN2', 1, [10, 20, 20], 1, [1, 2], 12, true, 3, '2017-10-11 11:57:11']);
rows.push(['Shop Storage', 2, [10, 20, 20], 1, [4], 28, true, 3, '2017-10-11 11:57:11']);
rows.push(['IT Link', 3, [10, 20, 20], 1, [3, 4], 97, false, 2, '2017-10-11 11:57:11']);
rows.push(['Long text example Long text example Long text example Long text example', 3, [10, 20, 20], 0, [2, 3], 66, true, 1, '2017-10-11 11:57:11']);
rows.push(['R&D VPN6', 1, [10, 20, 20], 0, [2], 89, false, 1, '2017-10-11 11:57:11']);
rows.push(['R&D VPN2', 2, [10, 20, 20], 0, [3], 91, false, 2, '2017-10-11 11:57:11']);

const cellstyl = {
  0: {
    'hobbies': 'testcellgreen',
    'site': 'testcellgreen',
  },
  1: {
    'hobbies': 'testcellgreen',
    'site': 'testcellblue',
    'gender': 'testcellpink'
  },
  2: {
    'hobbies': 'testcellgreen',
    'site': 'testcellblue',
  },
  3: {
    'hobbies': 'testcellgreen',
    'site': 'testcellred',
  },
  4: {
    'hobbies': 'testcellgreen',
    'site': 'testcellblue',
  },
  5: {
    'hobbies': 'testcellgreen',
    'site': 'testcellblue',
  },
};



export default class TableEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      msg: null,
      showEmptyImage: true,
      disableRowIds: [],
      checkType: "multi",
      selectedIndex: [3]
    };
  }

  handleCellEdit = (old, newVal, cell, row, e) => {
    console.log(`Editing the cell value ...  Old Value:- ${old}, New Value:- ${newVal}, Edited Cell:- ${cell}, Edited Row:- ${row}`);
  }

  handleEditingCellBlur = (cell, row) => {
    console.log('handleEditingCellBlur .. ', cell, row);
  }

  handleRowCheck = (row, data) => {
    this.setState({ checkedRows: data , isRequiredToUpdateColumns: true})
    /* Get the state and order of the table save */
    console.log(this.table.state.columns)
  };

  handleEditClick = () => {
    this.table.setRowEditable(2);
  };

  hanldeChangeLastTwoColumns = () => {
    rows = [['R&D VPN2', 1, [10, 20, 20], 1, [1, 2], 12, true, '2017-10-11 11:57:11', 3]];
    this.setState({ selectedIndex: [2]})
  }

  handleEditOtherOneClick = () => {
    this.table.setRowEditable(4);
  };

  handleClearEdit = () => {
    this.table.setRowEditable();
  };

  handleGetRow = () => {
    const row = this.table.getEditData();
    if (!row) {
      this.setState({
        msg: (
          <div>
            getEditData：<br />
            null
          </div>
        ),
      });
      return;
    }
    this.setState({
      msg: (
        <div>
          getEditData：<br />
          [{row.map(v => v.toString()).join(',')}]
        </div>
      ),
    });
  };

  handleGetSelectedRow = () => {
    const row = this.table.getSelectedRowData();
    this.setState({
      msg: (
        <div>
          getSelectedRowData<br />
          [{row.map(v => v.toString()).join(',')}]
        </div>
      ),
    });
  };

  handleGetAllRow = () => {
    const rows = this.table.getDataset();
    this.setState({
      msg: (
        <div>
          getDataset：
          <br />
          [
          <br />
          {rows
            .map(row => `[${row.map(v => v.toString()).join(',')}]`)
            .join(',')}
          <br />
          ]
        </div>
      ),
    });
  };

  handleGetCheckedRow = () => {
    const rows = this.table.getCheckedRowsData();
    this.setState({
      msg: (
        <div>
          getCheckedRowsData：
          <br />
          [
          <br />
          {rows
            .map(row => `[${row.map(v => v.toString()).join(',')}]`)
            .join(',')}
          <br />
          ]
        </div>
      ),
    });
  };

  onRowRightClick = (e, row) => {
    console.log(row);
  }

  handleAutoFit = () => {
    this.table.setSizeColumnFit(0);
  };

  onRClick = () => {
    this.table.reSetcolumnSize();
  };

  onEmptyDataClick = () => {
    rows = [];
    this.setState({ showEmptyImage: true })
  };
  hanldeDisableRows = () => {
    this.setState({ disableRowIds: [0, 1, 2], checkedRows: this.table.getCheckedRowsIndexes(), selectedIndex: this.table.getSelectedRowIndex() });
  }
  hanldeEnableRows = () => {
    this.setState({ disableRowIds: [], checkedRows: this.table.getCheckedRowsIndexes(), selectedIndex: this.table.getSelectedRowIndex() });
  }

  hanldeCheckType = () => {
    if (this.state.checkType === "single") {
      this.setState({ checkType: "multi" });
    }
    else {
      this.setState({ checkType: "single" });
    }
  }

  onEmptyDataNoImageClick = () => {
    rows = [];
    this.setState({ showEmptyImage: false })
  };

  handleCustomSort = (key, aValue, bValue) => {
    console.log("handleCustomSort: ", key, aValue, bValue);
    if (aValue > bValue) {
      return -1;
    } else if (aValue < bValue) {
      return 1;
    }
    return 0;
  };

  onColumnSizeChange = (columnD) => {
    console.log(columnD);
  }

  onDoubleClickHandle = (row, cell, event) => {
    console.log("On double click", row, cell, event);
  }

  GetColumnOrder = () => {
    console.log(this.table.state.columns)
  }

  render() {
    let buttonStyle = { margin: "2px 2px" };
    const [version, theme] = getDemoVersion();
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div style={{ marginBottom: '10px' }}>
          <Button onClick={this.handleEditClick} style={buttonStyle} text="Edit 3rd Row" />
          <Button onClick={this.handleEditOtherOneClick} style={buttonStyle} text="Edit 5th Row" />
          <Button onClick={this.handleGetRow} style={buttonStyle} text="Read Data of Edit Line" />
          <Button onClick={this.handleClearEdit} style={buttonStyle} text="Remove Edit" />
          <Button onClick={this.handleGetSelectedRow} style={buttonStyle} text="Read Selected Row Data" />
          <Button onClick={this.handleGetCheckedRow} style={buttonStyle} text="Read Selected Checked Rows Data" />
          <Button onClick={this.handleGetAllRow} style={buttonStyle} text="Read All Data" />
        </div>

        <Table onRowRightClick={this.onRowRightClick}
          columns={columns}
          dataset={rows}
          checkedRows={this.state.checkedRows}
          pageSize={10}
          onRowExpend={this.handleRowExpend}
          customSortFun={this.handleCustomSort}
          enableColumnDrag
          enableCheckBox
          checkType={this.state.checkType}
          onRowCheck={this.handleRowCheck}
          selectedRowIndex={this.state.selectedIndex}
          disableRowIds={this.state.disableRowIds}
          onEdit={this.handleCellEdit}
          onEditingCellBlur={this.handleEditingCellBlur}
          cellClassName={cellstyl}
          mutiSelectEnable={true}
          onColumnSizeChange={this.onColumnSizeChange}
          onDoubleClick={this.onDoubleClickHandle}
          enableColumnFilter
          enableMulitiExpand
          className='eui_table_height'
          showEmptyImage={this.state.showEmptyImage}
          ref={table => { this.table = table; }}
          useCustomToolTip={true}
          customToolTipStyle={{ maxWidth: '12rem' }}
          itemOrderChanger={true}
        />

        {this.state.msg && <DivMessage text={this.state.msg} type="success" style={{ marginTop: '10px', width: '100%' }} />}

        <br />
        <Button text={"1st column auto Fit"} style={buttonStyle} onClick={this.handleAutoFit} />
        <Button text={"columns reset"} style={buttonStyle} onClick={this.onRClick} />
        <Button text={"Empty Data"} style={buttonStyle} onClick={this.onEmptyDataClick} />
        <Button text={"Empty Data No Image"} style={buttonStyle} onClick={this.onEmptyDataNoImageClick} />
        <Button text={"Disable Rows"} style={buttonStyle} onClick={this.hanldeDisableRows} />
        <Button text={"EnableRows"} style={buttonStyle} onClick={this.hanldeEnableRows} />
        <Button text={"Check Type"} style={buttonStyle} onClick={this.hanldeCheckType} />
        <Button text={"Get column order"} style={buttonStyle} onClick={this.GetColumnOrder} />
        <br />
        <Button text={"After the last two columns exchange positions, click this button to pass parameters"} style={buttonStyle} onClick={this.hanldeChangeLastTwoColumns} />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableEdit />, mountNode);

```
