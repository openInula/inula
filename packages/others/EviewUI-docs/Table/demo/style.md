---
order: 8
title:
  zh-CN: 样式自定义（行样式）
  en-US: Style Custom(row style)
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableCustomStyle extends React.Component {

  handleHeaderCheck = (row, checkedRows, e) => {
    console.log("header checked...")
  };

  handleItemClick1 = (item) => {
    this.setState({ isShow1: false, value: item.value })
  };

  render() {
    const columns = [
      {
        title: 'VPN Name',
        id: "col_1",
        width: '28rem',
        key: 'col_1',
      },
      {
        title: 'State',
        render: cell => <div>{cell}</div>,
        id: "col_2",
        width: '30rem',
        key: 'col_2',
      },
      {
        title: 'Alarm',
        width: '30rem',
        key: 'col_3',
      },
    ];

    const rows = [];
    rows.push(['R&D VPN2', 'TO BE', 'ICMP Echo']);
    rows.push(['Shop Storage', 'Active', 'ICMP Echo']);
    rows.push(['IT Link', 'Active', 'Critical']);
    rows.push(['R&D VPN1', 'Active', 'Major']);
    rows.push(['R&D VPN6', 'TO BE', 'ICMP Echo']);
    rows.push(['R&D VPN7', 'TO BE', 'ICMP Echo']);
    rows.push(['R&D VPN8', 'TO BE', 'ICMP Echo']);
    rows.push(['R&D VPN9', 'TO BE', 'ICMP Echo']);
    rows.push(['R&D VPN10', 'TO BE', 'ICMP Echo']);

    const customStyleRows = {
      0: { backgroundColor: '#aaf3bc' },
      3: { backgroundColor: '#fef7b4' }
    }
    const [version, theme] = getDemoVersion();

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Table
          columns={columns} // Column Details
          dataset={rows} // Data Set
          mutiSelectEnable={true}
          pagingType="select"
          height={'300px'}
          width={'100%'}
          enableCheckBox={true}
          customStyleRows={customStyleRows}
          onRowCheck={this.handleHeaderCheck}
          disableRowIds={[0,2]}
          disableHeaderCheckbox={true}
        />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableCustomStyle />, mountNode);

```
