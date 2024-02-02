---
order: 9
title:
  zh-CN: 表右键单击菜单
  en-US: Column Select Menu
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import PopUpMenu from 'eview-ui/PopUpMenu';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TablePopUpMenu extends React.Component {

  state = {
    isMenuOpen: false,
    X: 100,
    Y: 100,
    offset: {
      X: 100,
      Y: 100
    },
    parentId: "",

  }
  onRowRightClick = (e, cbData) => {
    console.log("Table onRowRightClick cbData : ", cbData, e);

    this.setState({
      isMenuOpen: true,
      X: e.pageX,
      Y: e.pageY,
      offset: {
        X: e.offsetX, Y: e.offsetY
      },
      parentId: cbData.id,
    })
  }

  handleMenuClick = (evt) => {
    console.log("Popup menu onClick : ", evt);
  }

  render() {
    const columns = [
      {
        title: 'VPN Name',
        dataType: Table.ColumnRenderType.TEXT_FIELD,
        key: 'VPN_ID',
      },
      {
        title: 'Site',
        dataType: Table.ColumnRenderType.TEXT_FIELD,
        key: 'Site_ID',
      },
      {
        title: 'Alarm',
        dataType: Table.ColumnRenderType.TEXT_FIELD,
        key: 'Alarm_ID',
      },
    ];

    const rows = [];
    rows.push(['R&D VPN2 ', '3', 'ICMP Echo',]);
    rows.push(['Shop Storage', '3', 'ICMP Echo ',]);
    rows.push(['IT Link', '7', 'ICMP Echo',]);
    rows.push(['R&D VPN1', '3', 'ICMP Echo',]);
    rows.push(['R&D VPN6', '5', 'ICMP Echo',]);
    rows.push(['R&D VPN2', '7', 'ICMP Echo',]);


    let PopUpMenuOptions = [
      {
        text: "Item1", serialno: 1, submenus: [
          {
            text: "Item11Item11Item11Item11Item11Item11", serialno: 11, submenus: [
              {
                text: "Item111Item111", serialno: 111, disable: true, submenus: [
                  { text: "Item1111Item111", serialno: 1111, submenus: [] }
                ]
              },
              { text: "Item111112121Item111112121Item111112121", serialno: 12111, submenus: [] },
              { text: "Item121", serialno: 121, submenus: [] }
            ]
          }
        ]
      },
      { text: "Item2", serialno: 2, submenus: [] },
      {
        text: "Item 3", serialno: 3, submenus: [
          { text: "Item1111121", serialno: 1211, submenus: [] },
          { text: "Item121", serialno: 1221, submenus: [] }
        ]
      },
      { text: "Item 4", serialno: 4, submenus: [] }
    ];
    const [version, theme] = getDemoVersion();
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Table onRowRightClick={this.onRowRightClick}
          columns={columns}
          dataset={rows}
          ref={table => { this.table = table; }}
        />
        <PopUpMenu options={PopUpMenuOptions} parentId={this.state.parentId} isOpen={this.state.isMenuOpen} X={this.state.X} Y={this.state.Y} offset={this.state.offset}
          onClick={this.handleMenuClick}></PopUpMenu>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TablePopUpMenu />, mountNode);

```
