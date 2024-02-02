---
order: 1
title:
  zh-CN: Tab切换基本属性设置
  en-US: Tab Basic Setting
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import Tab from 'eview-ui/Tab';
import TabItem from 'eview-ui/Tab';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableTabBasic extends React.Component {


  render() {
    let columns = [
      {
        title: 'VPN Name',
        key: 'col_1',
        id: "col_1",
      },
      {
        title: 'State',
        allowSort: false,
        key: 'col_2',
        id: "col_2",
      },
      {
        title: 'Site',
        display: true, // Hide column,
        id: "col_3",
        key: 'col_3',
      },
      {
        title: 'Alarm',
        key: 'col_4',
      },
      {
        title: 'Last',
        key: 'col_5',
      },

    ];
    let options = [{text: "Select All Data", value: 1},
      {text: "Select Odd Rows", value: 2},
      {text: "Select Even Rows", value: 3},];
    const rows = [];
    rows.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo', 1]);
    rows.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo', 1]);

    const rows_2 = [];
    rows_2.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo', 1]);
    rows_2.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo', 1]);
    rows_2.push(['R&D VPN2', 'TO BE', 3, 'ICMP Echo', 1]);
    const [version, theme] = getDemoVersion();
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Tab type="sub" selectedIndex={0} lazyLoad={true}>
          <TabItem title="Tab1" closable={true}>
            <div>
              <Table
                columns={columns}
                dataset={rows}
                selectedRowIndex={2}
                enableColumnFilter
                checkBoxOptions={options}
                enableCheckBox
                maxHeight={150}
              />
            </div>
          </TabItem>
          <TabItem title="Tab2" closable={true}>
            <div>
              <Table
                columns={columns}
                dataset={rows_2}
                selectedRowIndex={2}
                enableColumnFilter
                checkBoxOptions={options}
                enableCheckBox
                maxHeight={150}
              />
            </div>
          </TabItem>
        </Tab>

      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableTabBasic />, mountNode);

```
