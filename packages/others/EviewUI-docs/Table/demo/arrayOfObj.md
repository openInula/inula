---
order: 3
title:
  zh-CN: 数据作为对象数组
  en-US: Data as Array of Objects
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import img1 from "@images/table_1";
import img2 from "@images/table_2";
import expend from "@images/expend";
import Button from "eview-ui/Button";
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableDemo extends React.Component {

  onRowRightClick = (e, row) => {
    console.log(row);
  };

  handleRowClick = (event, row) => {
    console.log("RowClick event...", row);
  };

  render() {
    const [version, theme] = getDemoVersion();
    const columns = [
      {
        title: "VPN Name",
        width: 160,
        allowSort: false,
        key: "hideV"
      },
      {
        title: "State",
        render: cell => {
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
        },
        ellipsis: true,
        width: 230,
        sort: "asc",
        getCompareValue: v => v.age,
        key: "hideX"
      },
      {
        title: "Site",
        RenderType: Table.ColumnRenderType.TEXT,
        ellipsis: true,
        selected: true,
        key: "hideY"
      },
      {
        title: "Alarm",
        RenderType: Table.ColumnRenderType.TEXT,
        ellipsis: true,
        key: "hideZ"
      }
    ];
    const rows = [];
    rows.push({
      hideV: "R&D VPN2 YHHHHHHHHHHHHHHHHHHHHHHHHH",
      hideX: "TO BE",
      hideY: "3",
      hideZ: "ICMP Echo",
      hideM: "ICMP Echo"
    });
    rows.push({
      hideV: "Shop Storage",
      hideX: "Active",
      hideY: "3",
      hideZ: "ICMP Echo XXXXXXXXXXXXXkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"
    });
    rows.push({
      hideV: "IT Link XXXXXXXXXXXXXkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk bbb",
      hideX: "TO BE",
      hideY: "7",
      hideZ: "ICMP Echo"
    });
    rows.push({
      hideV: "R&D VPN1",
      hideX: "Active",
      hideY: "3",
      hideZ: "ICMP Echo"
    });
    rows.push({
      hideV: "R&D VPN6",
      hideX: "Active",
      hideY: "5",
      hideZ: "ICMP Echo"
    });
    rows.push({
      hideV: "R&D VPN2",
      hideX: "TO BE",
      hideY: "7",
      hideZ: "ICMP Echo"
    });

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>

        <p className='note'>
          This demo takes row data as an <code>array</code> of <code>object</code>s(against the above demo which takes <code>array</code> of <code>array</code>s).
          <br />
          Please note that each column <code>key</code> values should be unique for this data structure to work properly.
        </p>

        <Table
          onRowRightClick={this.onRowRightClick}
          columns={columns}
          dataset={rows}
          pageSize={10}
          hideColumns={["hide", "hideX"]}
          onRowClick={this.handleRowClick}
        />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableDemo />, mountNode);

```
