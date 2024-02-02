---
order: 4
title:
  zh-CN: Resize & Percentage width
  en-US: Resize & Percentage width
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import Button from 'eview-ui/Button';
import img1 from '@images/table_1';
import img2 from '@images/table_2';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TablePercentageResize extends React.Component {

  state = {
    divTableStyle: { margin: "10px 20px", display: "inline-block", borderStyle: 'solid', borderColor: 'red', height: 250, width: 1200,overflow:'auto' },
    ColumnSize: ["40%", '20%', '20%', '20%'],
    tableSize: [null, null]
  }

  handleChangeColumnSize = () => {
    this.setState({
      ColumnSize: ["20%", '20%', '30%', '30%'],
    })
  };

  handleFixedColumnSize = () => {
    this.setState({
      ColumnSize: [300, 450, 400, 450],
    })
  };

  handlePartialPxColumnSize = () => {
    this.setState({
      ColumnSize: [300, null, null, null],
    })
  };

  handlePartialPercentageColumnSize = () => {
    this.setState({
      ColumnSize: ["40%", null, null, null],
    })
  };

  handleMixColumnSize = () => {
    this.setState({
      ColumnSize: ["20%", null, 400, null],
    })
  };

  handleClearColumnSize = () => {
    this.setState({
      ColumnSize: [null, null, null, null],
    })
  };

  handleSetTableSize = () => {
    this.setState({
      tableSize: [1000, 400],
    })
  };

  handleUnSetTableSize = () => {
    this.setState({
      tableSize: [null, null],
    })
  };

  handleIncreaseSize = () => {
    this.setState({
      divTableStyle: { margin: "10px 20px", display: "inline-block", borderStyle: 'solid', borderColor: 'red', height: 300, width: 1300, overflow:'auto' },
    })

    this.triggerTableResize();
  };

  handleDecreaseSize = () => {
    this.setState({
      divTableStyle: { margin: "10px 20px", display: "inline-block", borderStyle: 'solid', borderColor: 'red', height: 200, width: 1000, overflow:'auto' },
    })

    this.triggerTableResize();
  };

  triggerTableResize() {
    var custEvent = new CustomEvent('parentResize');
    document.dispatchEvent(custEvent);
  }

  render() {
    const columns = [
      {
        title: 'VPN Name',
        width: this.state.ColumnSize[0],
        key: 'col_1',
      },
      {
        title: 'State',
        allowSort: false,
        width: this.state.ColumnSize[1],
        key: 'col_2',
      },
      {
        title: 'Site',
        width: this.state.ColumnSize[2],
        key: 'col_3',
      },
      {
        title: 'Alarm',
        width: this.state.ColumnSize[3],
        key: 'col_4',
      },
    ];

    const rows = [];
    rows.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo']);
    rows.push(['Shop Storage', 'Active', 3, 'ICMP Echo']);
    rows.push(['IT Link', 'Active', 7, 'Critical']);
    rows.push(['R&D VPN1', 'Active', 3, 'Major']);
    rows.push(['R&D VPN6', 'TO BE', 5, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 7, 'Critical']);

    let buttonStyle = { marginRight: "5px", marginTop: "3px" };
    const [version, theme] = getDemoVersion();
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div id="TableBasicDiv" style={this.state.divTableStyle}>
          <Table
            columns={columns} // Column Details
            dataset={rows} // Data Set
            width={this.state.tableSize[0]}
            height={this.state.tableSize[1]}
            selectedRowIndex={2} // Row ID 2 is selected.
            enableColumnFilter //Allow column to be selected.
          />
        </div>
        <br />
        <Button text="Increase Div Size" style={buttonStyle} onClick={this.handleIncreaseSize} />
        <Button text="Decrease Div Size" style={buttonStyle} onClick={this.handleDecreaseSize} />
        <Button text="Set table size" style={buttonStyle} onClick={this.handleSetTableSize} />
        <Button text="unSet table size" style={buttonStyle} onClick={this.handleUnSetTableSize} />
        <br />
        <Button text="Change Col Size %" style={buttonStyle} onClick={this.handleChangeColumnSize} />
        <Button text="Fixed Col Size px" style={buttonStyle} onClick={this.handleFixedColumnSize} />
        <Button text="Clear Col Size" style={buttonStyle} onClick={this.handleClearColumnSize} />
        <Button text="Partial Col Size px" style={buttonStyle} onClick={this.handlePartialPxColumnSize} />
        <Button text="Partial Col Size %" style={buttonStyle} onClick={this.handlePartialPercentageColumnSize} />
        <Button text="Mix Col Size" style={buttonStyle} onClick={this.handleMixColumnSize} />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TablePercentageResize />, mountNode);

```
