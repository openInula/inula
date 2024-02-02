---
order: 5
title:
  zh-CN: 基本属性设置(list)
  en-US: Table Paging (list default) with Fixed Column'
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import Button from 'eview-ui/Button';
import DivMessage from 'eview-ui/DivMessage';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableMultiCheck extends React.Component {

  handlePaging = (currentPage) => {
    let checkedRows = this.table1.getCheckedRowsIndexes();
    let start = (this.state.currentPage - 1) * this.state.pageSize;
    //选中
    for (let position = start; position < start + this.state.pageSize; position++) {
      let rowId = position - start;
      if (checkedRows.indexOf(rowId) != -1) {
        this.state.rows[position].check = true;
      } else {
        this.state.rows[position].check = false;
      }
    }
    this.setState({currentPage});
  };

  handlePageSize = (pageSize) => {

    let checkedRows = this.table1.getCheckedRowsIndexes();
    let start = (this.state.currentPage - 1) * this.state.pageSize;
    //选中
    for (let position = start; position < start + this.state.pageSize; position++) {
      let rowId = position - start;
      if (checkedRows.indexOf(rowId) != -1) {
        this.state.rows[position].check = true;
      } else {
        this.state.rows[position].check = false;
      }
    }
    this.setState({pageSize});
  };

  onFilterOkClick = (leftItems, rightItems) => {
    console.log("leftItems:", leftItems);
    console.log("rightItems:", rightItems);
  };

  handleRowCHeckClick = (row, checkedRows, e) => {
    let start = (this.state.currentPage - 1) * this.state.pageSize;
    let position = start + row.id;
    //选中
    if (checkedRows.indexOf(row.id) != -1) {
      this.state.rows[position].check = true;
    } else {
      this.state.rows[position].check = false;
    }
  };

  onHeaderClick = (checkedRowsRef) => {
    console.log("call back");
    let start = (this.state.currentPage - 1) * this.state.pageSize;
    let toIndex = this.state.currentPage * this.state.pageSize;

    if (toIndex > this.state.recordCount) {
      toIndex = this.state.recordCount;
    }
    for (let i = start; i < toIndex; i++) {
      //去勾选
      if (checkedRowsRef.length == 0)  {
        this.state.rows[i].check = false;
      } else {
        this.state.rows[i].check = true;
      }
    }
  };

  onrowClick = (row, e) => {
    let checkedRows = this.table1.getCheckedRowsIndexes();
    let start = (this.state.currentPage - 1) * this.state.pageSize;
    let position = start + row.id;
    if (this.rowClickFlag) {
            //选中
        if (checkedRows.indexOf(row.id) != -1) {
            this.state.rows[position].check = false;
        } else {
            this.state.rows[position].check = true;
        }
        this.setState({selectedRowIndex: row.id});
    }
  };

  handleOnMouseUpOnRowForDrag = (startRow, endRow, checkedRows, e) => {
    console.log("check rows: " + checkedRows);
    console.log("start row: " + startRow);
    console.log("end row: " + endRow);
  };

  constructor(props, context) {
    super(props);

    let columns = [
      {
        title: 'VPN Name',
        width: 300,
        freezeCol: true,
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
        freezeCol: true,
        key: 'col_4',
      },
    ];

    const rows = [];
    for (let i = 0; i < 100; i++) {
      rows.push([`R&D VPN2${i}`, 'Active', i, 'ICMP Echo']);
    }

    this.state = {
      columns: columns,
      rows: rows,
      currentPage: 1,
      pageSize: 10,
      recordCount: 100,
      msg: '',
      slidingMultipleSelected: false,
      selectedRowIndex: undefined
    };

    this.rowClickFlag = false;
  }

  handleGetCheckedRow = () => {
    const rows = this.table1.getCheckedRowsData();
    let checkedRows = this.table1.getCheckedRowsIndexes();
    let start = (this.state.currentPage - 1) * this.state.pageSize;
    //选中
    for (let position = start; position < start + this.state.pageSize; position++) {
      let rowId = position - start;
      if (checkedRows.indexOf(rowId) != -1) {
        this.state.rows[position].check = true;
      } else {
        this.state.rows[position].check = false;
      }
    }
    this.setState({
      msg: (
        <div>
          GetCheckedRowsData：
          <br/>
          {rows
            .map(row => `[${row.map(v => v.toString()).join(',')}]`)
            .join(',')}
        </div>
      ),
    });
  };
  handleRowTrigerCHeckBox = () => {
    this.rowClickFlag = !this.rowClickFlag;
  };
  handleMouseMoveTrigerCHeckBox = () => {
    if (this.state.slidingMultipleSelected) {
      this.setState({slidingMultipleSelected: false});
    } else {
      this.setState({slidingMultipleSelected: true});
    }
    let checkedRows = this.table1.getCheckedRowsIndexes();
    let start = (this.state.currentPage - 1) * this.state.pageSize;
    //选中
    for (let position = start; position < start + this.state.pageSize; position++) {
      let rowId = position - start;
      if (checkedRows.indexOf(rowId) != -1) {
        this.state.rows[position].check = true;
      } else {
        this.state.rows[position].check = false;
      }
    }
  };
  onHeaderColumnSortFunc = (e, sort) => {
    console.log("sort type: " + sort);
  };

  render() {
    const [version, theme] = getDemoVersion();
    let buttonStyle = {marginRight: "5px"};
    const rowsdata = [];
    let toIndex = this.state.currentPage * this.state.pageSize;

    if (toIndex > this.state.recordCount) {
      toIndex = this.state.recordCount;
    }

    let start = (this.state.currentPage - 1) * this.state.pageSize;

    if (start > toIndex) {
      start = toIndex - this.state.pageSize;
      this.setState({currentPage: this.state.recordCount / this.state.pageSize});
    }

    let checkedRows = [];
    for (let i = start; i < toIndex; i++) {
      rowsdata.push(this.state.rows[i]);
      if (this.state.rows[i].check) {
        checkedRows.push(i - start);
      }
    }
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div>
          <Button onClick={this.handleGetCheckedRow} style={buttonStyle} text="Read Selected Checked Rows Data"/>
          <Button onClick={this.handleRowTrigerCHeckBox} style={buttonStyle} text="open rowClick trigger checkbox"/>
          <Button onClick={this.handleMouseMoveTrigerCHeckBox} style={buttonStyle} text="mouse move trigger checkbox"/>
        </div>
        <div>
          <Table
            maxHeight={700}
            columns={this.state.columns}
            dataset={rowsdata}
            pageSize={this.state.pageSize}
            currentPage={this.state.currentPage}
            recordCount={this.state.recordCount}
            onPageChange={this.handlePaging}
            onPageSizeChange={this.handlePageSize}
            enableCheckBox
            enablePagination
            enableColumnFilter
            itemOrderChanger
            mutiSelectEnable={true}
            selectedRowIndex={this.state.selectedRowIndex}
            splitPagination={true}
            onFilterOkClick={this.onFilterOkClick}
            onRowCheck={this.handleRowCHeckClick}
            onHeaderCheck={this.onHeaderClick}
            checkedRows={checkedRows}
            headerCheckBoxSortAllow={true}
            onRowClick={this.onrowClick}
            slidingMultipleSelected={this.state.slidingMultipleSelected}
            onMouseUpOnRowForDrag={this.handleOnMouseUpOnRowForDrag}
            onHeaderColumnSort={this.onHeaderColumnSortFunc}
            ref={table1 => {
              this.table1 = table1;
            }}
          />
        </div>

        <br/>
        <DivMessage text={this.state.msg} type="success" style={{marginTop: '10px', width: '100%'}}/>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableMultiCheck />, mountNode);

```
