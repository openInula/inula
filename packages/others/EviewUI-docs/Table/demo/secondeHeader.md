---
order: 14
title:
  zh-CN: 二级表头
  en-US: Second Header
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableSecondHeader extends React.Component {

  handleItemClick1 = (item) => {
    this.setState({ isShow1: false, value: item.value })
  };

  render() {
    const [version, theme] = getDemoVersion();
    const columns = [
      {
        title: '制式',
        allowSort: false,
        freezeCol: false,
        key: 'rat',
        width: 240
      },
      {
        title: 'ESN',
        allowSort: false,
        freezeCol: false,
        key: 'esn',
        width: 240
      },
      {
        title: '时间',
        allowSort: false,
        freezeCol: false,
        key: 'time',
        width: 240
      },
      {
        title: '好',
        allowSort: false,
        key: 'good',
        width: 240
      },
      {
        title: '坏',
        allowSort: false,
        key: 'bad',
        width: 240
      },
      {
        title: '不可信',
        allowSort: false,
        freezeCol: false,
        key: 'untrusted',
        width: 240
      },
      {
        title: '未播放',
        allowSort: false,
        key: 'noPlaying',
        display: false,
        width: 240
      },
      {
        title: 'haha',
        allowSort: false,
        freezeCol: false,
        key: 'haha',
        width: 240
      },
    ];
    const groupHeader = [{
      // 配置属性读取KEY
      startColumnKey: 'esn',
      numberOfColumns: 2,
      title: 'ESN time'
    }, {
      startColumnKey: 'bad',
      numberOfColumns: 2,
      title: '状态'
    }];
    const rows = [];
    for(var i=0;i < 8; i++) {
      rows.push([
        'LTE',
        'abc',
        '2020-02-01',
        1,
        0,
        1,
        0,
        2
      ]);
    }

    let options = [{ text: "Select All Data", value: 1 },
      { text: "Select Odd Rows", value: 2 },
      { text: "Select Even Rows", value: 3 },];

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Table
          columns={columns}
          groupHeaders={groupHeader}
          enableColumnDrag={true}
          enableColumnFilter={true}
          enableRowExpand={false}
          enableCheckBox={true}
          //checkBoxOptions={options}
          dataset={rows}
          height={450}
          //checkBoxPopupData={{ data: options, optionStyle: { width: '15rem' }, onItemClick: this.handleItemClick1 }}
          //headerCheckBoxSortAllow={false}
        />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableSecondHeader />, mountNode);

```
