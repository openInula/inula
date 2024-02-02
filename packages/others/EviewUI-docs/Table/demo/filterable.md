---
order: 12
title:
  zh-CN: 可筛选
  en-US: Custom Columns
---

## zh-CN



## en-US



```jsx
import Button from "eview-ui/Button";
import React, { Component } from "react";
import Table from "eview-ui/Table";
import expend from "@images/expend";
import Select from 'eview-ui/Select';
import DivMessage from 'eview-ui/DivMessage';
import PopUpMenu from 'eview-ui/PopUpMenu';
import Dialog from 'eview-ui/Dialog';
import TextField from 'eview-ui/TextField';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableColFilter extends Component {

  constructor(props) {
    super(props);
    this.textBoxVal = '';
  }

  handleValueChange = (textVal) => {
    this.textBoxVal = textVal;
  }

  handleClickOK = e => {
    if(typeof this.props.onClickOk == "function") {
      this.props.onClickOk(e,this.textBoxVal, this.props.columnTitle);
    }
  }

  render() {
    return (
      <div style={{ width: '280px', height: '50px' }}>
        <div style={{ margin: '10px', display: 'flex',alignItems: 'center' }}>
          <TextField onChange={this.handleValueChange} id={this.props.id+'_input'}  inputStyle={{ width: '150px', marginRight: '12px'}} />
          <Button text='Ok' onClick={this.handleClickOK} />  </div>
      </div>
    )
  }

}



let clientTimezoneRule = (year, id) => {

  let ruleForYear = {
    dstEndTime: "2017-10-29 04:00:00",
    dstStartTime: "2017-03-26 03:00:00",
    endDuration: "-3600",
    startDuration: "3600"
  }
  return ruleForYear;
}
const optionStyle = {
  items: 2,
  background: "Yellow",
  color: "Black"

};
const customProps = {
  optionStyle: optionStyle,
};

let optionsSelect = [{ text: "China ", value: 0 }, { text: "UK", value: 1 }, { text: "USA", value: 2 }, { text: "USAB", value: 3 },
{ text: "USAC", value: 4 }, { text: "USAD", value: 5 }, { text: "USAE", value: 6 }, { text: "USAF", value: 7 }, { text: "USAG", value: 8 }];
let style = { width: '150px' };


const rows = [
{
  VPNData: 'R&D VPN6',
  hideV: "R&D VPN2",
  Country: 'India',
  hobbies: "Sport",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "R&D VPNHHHHHHH",
  Country: 'China',
  hobbies: "Cricket",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "R&D VPN2HHHHHHHHHHHHHH",
  Country: 'India',
  hobbies: "Football",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "VPN2 YHHHHHHHHHHHHHHHHHHHHHHHHH",
  Country: 'China',
  hobbies: "Sport",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "R&D VHHHH",
  Country: 'India',
  hobbies: "Cricket",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "HHHHHHHHH",
  Country: 'China',
  hobbies: "Football",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "Huawei",
  Country: 'India',
  hobbies: "Sport",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "Center",
  Country: 'China',
  hobbies: "Cricket",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},
{
  VPNData: 'R&D VPN6',
  hideV: "R&D",
  Country: 'India',
  hobbies: "Football",
  Act: true,
  hideY: <Select options={optionsSelect} selectStyle={style} required={true} selectedIndex={1} />,
  inputsite: 1,
  date: '2017-10-11 11:57:11',
},

];

export default class TableColFilterExample extends Component {

  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'VPP data',
        allowSort: true,
        key: "VPNData",
        width:200,
      },
      {
        title: 'Engine',
        width:200,
        renderType: Table.ColumnRenderType.TEXT_FIELD,
        isEditable: true,
        allowSort: true,
        filter: { component: <TableColFilter
          id="selectSiteInput"
          onClickOk={this.handleClickFilter} columnTitle='hideV' />, className: 'eui_table_filter', style: { color: 'red' } },
        key: "hideV",
        customSort: true,
        options: { isFocus: true }
      },
      {
        title: 'Country',
        width:200,
        renderType: Table.ColumnRenderType.TEXT_FIELD,
        isEditable: true,
        allowSort: true,
        filter: { component: <TableColFilter
          id="selectSiteInput"
          onClickOk={this.handleClickFilter} columnTitle='Country' />, className: 'eui_table_filter', style: { color: 'red' } },
        key: "Country",
        customSort: true,
        options: { isFocus: true },
        help: {
          tipContent: 'arrow left, and you can set the position',
          arrowDirection: 'left',
          tipStyle: { width: '200px', backgroundColor: 'lightBlue', borderRadius: '5px'}
        },
      },
      {
        title: 'Hobbies',
        width:200,
        renderType: Table.ColumnRenderType.TEXT_FIELD,
        isEditable: true,
        allowSort: true,
        filter: { component: <TableColFilter
          id="selectSiteInput"
          onClickOk={this.handleClickFilter} columnTitle='hobbies' />, className: 'eui_table_filter', style: { color: 'red' } },
        customSort: true,
        options: { isFocus: true },
        key: 'hobbies'
      },

      {
        title: 'Acitve',
        display: false,
        width:200,
        renderType: Table.ColumnRenderType.CHECK_BOX,
        key: 'Act',
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
        title: 'Country',
        renderType: Table.ColumnRenderType.CUSTOM,
        key: 'hideY',
        align: 'center',
        customProps: customProps,
        allowSort: true,
        width:200,
        display: true,
        isMovable: true,
        render: (v, row, options, rowdata, r1, r2) => {
          return <Select options={v.props.options} selectStyle={style} required={true} onChange={this.handleChange} selectedIndex={this.state.selectedIndexValue} />;
        },
        help: {
          tipContent: 'arrow bottom, and you can set the position',
          arrowDirection: 'bottom',
        },
      },
      {
        title: 'InputSelectSite',
        renderType: Table.ColumnRenderType.INPUT_SELECT,
        options: [
          { text: 'China', value: 1 },
          { text: 'UK', value: 2 },
          { text: 'USA', value: 3 },
        ],
        width:200,
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
        width:200,
        renderType: Table.ColumnRenderType.DATE_PICKER,
        filter: { component: <TableColFilter /> },
        options: { type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss', callBack: clientTimezoneRule },
        render: (value, rowData, options, row) => {
          return options ? options.updateValue : value ? typeof value == 'string' ? value : value.toDateString() : "";
        },
        key: 'date'
      },
    ];

    this.state = {
      selectedRowIndex: null,
      msg: null,
      open: false,
      itemOrderChanger: false,
      selectedValue: 1,
      recordCount: 100,
      isMenuOpen: false,
      selectedIndexValue: 0,
      columns: this.columns,
      rows: rows,
      X: 100,
      Y: 100,
      offset: {
        X: 100,
        Y: 100
      },
    };
  }

  handleFileter = (event) => {
    console.log(event);
    this.setState({ open: !this.state.open });
  }

  handleClickFilter = (event, data, key) => {
    let newRow = [];
    if(data == "") {
      newRow = rows;
    } else {
      for(let i = 0; i < rows.length; i++) {
        if(rows[i][key].indexOf(data) > -1) {
          newRow.push(rows[i]);
        }
      }
    }
    this.setState(prevState => ({
      columns: prevState.columns.map(prevColumn => {
        if(prevColumn && prevColumn.filter) {
          if(prevColumn.key == key && data != "") {
            prevColumn.isFiltered = true;
            return prevColumn;
          }
        }
        prevColumn.isFiltered = false;
        return prevColumn;
      })
    }));
    this.setState({
      rows: newRow
    })
  }

  handleCellEdit = (old, newVal, cell, row, e) => {
    console.log(`Editing the cell value ...  Old Value:- ${old}, New Value:- ${newVal}, Edited Cell:- ${cell}, Edited Row:- ${row}`);
  }

  handleEditingCellBlur = (cell, row) => {
    console.log('handleEditingCellBlur .. ', cell, row);
  }

  handleRowCheck = (row, data) => {
    this.setState({
      checkedRows: data,
      isMenuOpen: false
    })
  };

  handleGetRow = () => {
    const row = this.table.getEditData();
    if (!row) {
      this.setState({
        msg: (
          <div>
            getEditData:<br />
            null
          </div>
        ),
      });
      return;
    }
    this.setState({
      msg: (
        <div>
          getEditData:<br />
          [{row.map(v => v.toString()).join(',')}]
        </div>
      ),
    });
  };


  handleRowExpend = () => <img src={expend} alt="expend demo" />;

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
          getDataset:
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
          getCheckedRowsData:
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
    this.setState({
      isMenuOpen: true,
      X: e.pageX,
      Y: e.pageY,
      offset: {
        X: e.offsetX, Y: e.offsetY
      },
      parentId: row.id,
      selectedRowIndex: row.data.id
    })
  }

  handleRowClick = (event, row) => {
    console.log("RowClick event...", row);
  };

  handleAutoFit = () => {
    this.table.setSizeColumnFit(0);
  };

  onRClick = () => {
    this.table.reSetcolumnSize();
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

  handleFilterOkClick = (left, right) => {
    this.setState({
      colTitle: right[0].newText,
      msg: (
        <div>
          {"column id : " + right[0].cid + ", Old Column Name : " + right[0].name + ", New Column name : " + right[0].newText}
        </div>
      ),

    });
  }

  handleChange = (value, oldvalue) => {
    this.setState({ msg: "onChange event callback, Selected value : " + oldvalue, selectedValue: oldvalue });
  };

  handleShowItemOrderChanger = () => {
    this.setState({
      itemOrderChanger: true
    });
  };
  handleChange = (value) => {
    console.log(value);
    this.setState({ selectedIndexValue: value });
  };

  render() {
    const [version, theme] = getDemoVersion();
    const style = {
      width: "300px"
    };

    let PopUpMenuOptions = [
      { text: "Item1", serialno: 1, submenus: [] },
      { text: "Item2", serialno: 2, submenus: [] },
      { text: "Item3", disable: true, serialno: 3, submenus: [] },
      { text: "Item4", serialno: 4, submenus: [] }
    ];

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme} >
        <Table
          columns={this.columns}
          dataset={this.state.rows}
          recordCount={this.state.recordCount}
          ref={table => { this.table = table; }}
          onRowExpend={this.handleRowExpend}
          onRowClick={this.handleRowClick}
          checkedRows={this.state.checkedRows}
          customSortFun={this.handleCustomSort}
          onEdit={this.handleCellEdit}
          onEditingCellBlur={this.handleEditingCellBlur}
          mutiSelectEnable={true}
          height={400}
          enableColumnFilter={true}
          onRowCheck={this.handleRowCheck}
          selectedRowIndex={this.state.selectedRowIndex}
          columnFilterZIndex={888}
          isRequiredToUpdateColumns={['width']}
        />

        <Dialog title={'Dialog'} isOpen={this.state.open} onClose={this.handleClick} closeOnEscape />
      </ConfigProvider>
    );
  }
}
ReactDOM.render(<TableColFilterExample />, mountNode);
```
