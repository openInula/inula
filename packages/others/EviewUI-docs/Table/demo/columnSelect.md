---
order: 9
title:
  zh-CN: 列选择选项
  en-US: Column Select Options
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';

import img1 from '@images/table_1';
import img2 from '@images/table_2';
import img3 from '@images/expend';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableDoubleSelectOptions extends React.Component {

  handleRowExpend = (row) => {
    console.log("handleRowExpend callback row : ", row);
    return (<div style={{paddingLeft : "30px" , background : "#edeeef"}}>
            <img src={img3}/></div>);
  }

  validate = (value) => {
    let validationReturnMap = {};
    let validationResult = value.match(new RegExp("@", "g"));
    validationReturnMap['result'] = validationResult;
    validationReturnMap['message'] = "Incorrect input";
    return validationReturnMap;
  };


  render() {
    const [version, theme] = getDemoVersion();
    const columns = [
      {
        title: 'VPN Name',
        width: 300,
        isMovable: false,
        key: 'c_1',
      },
      {
        title: 'State',
        width: 300,
        key: 'c_2',
        // 自定义渲染
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
        allowSort: false // 禁用列排序
      },
      {
        title: 'Site',
        width: 300,
        isEditable: true,
        validator: this.validate,
        cid: "1",
        key: 'c_3',
        display: true // 隐藏列
      },
      {
        title: 'Alarm',
        width: 300,
        key: 'c_4',
      },
    ];
    const rows = [];
    rows.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo']);
    rows.push(['Shop Storage', 'Active', 3, 'ICMP Echo']);
    rows.push(['IT Link', 'Active', 7, 'ICMP Echo']);
    rows.push(['R&D VPN1', 'Active', 3, 'ICMP Echo']);
    rows.push(['R&D VPN6', 'TO BE', 5, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 7, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 7, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 2, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 5, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 1, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 9, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 9, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 4, 'ICMP Echo']);
    rows.push(['R&D VPN2', 'Active', 2, 'ICMP Echo']);

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Table
          columns={columns} // 行定义
          dataset={rows} // 数据数组
          enableRowExpand // 启用行展开
          onRowExpend={this.handleRowExpend} // 行展开事件回调
          pageSize={10} // 分页大小
          selectedRowIndex={2} // 默认选中行

          enableColumnFilter
          enableMulitiExpand
          itemOrderChanger={true}
          enableCheckBox
        />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableDoubleSelectOptions />, mountNode);

```
