---
order: 11
title:
  zh-CN: 列依赖性
  en-US: Column Dependency
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import Button from 'eview-ui/Button';
import DivMessage from 'eview-ui/DivMessage';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';
const columns = [
  {
    title: 'VPN data Name',
    renderType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'vpndata',
    options: { isFocus: true }
  },
  {
    title: 'Select Site',
    renderType: Table.ColumnRenderType.SELECT,
    key: 'selectSite',
    options: [
      { text: 'China', value: 1 },
      { text: 'UK', value: 2 },
      { text: 'USA', value: 3 },
    ],
    render: (v, row, options, rowdata) => {
      if (options) {
        if (options[v - 1]) {
          return options[v - 1].text;
        } else {
          return options[0]
        }
      }
    },
  },
  {
    title: 'Select Data',
    renderType: Table.ColumnRenderType.SELECT,
    key: 'DataSite',
    options: [
      { text: 'CM Data', value: 1 },
      { text: 'Vm data', value: 2 },
      { text: 'OS Data', value: 3 },
    ],
    render: (v, row, options, rowdata) => {
      if (options) {
        if (options[v - 1]) {
          return options[v - 1].text;
        } else {
          return options[0];
        }
      }
    },
  },
];

const rows = [];
rows.push(['R&D VPN2', 1, 1]);
rows.push(['Shop Storage', 2, 1]);
rows.push(['IT Link', 3, 3]);
rows.push(['R&D VPN1', 3, 2]);
rows.push(['R&D VPN6', 1, 1]);
rows.push(['R&D VPN2', 2, 2]);

//Override the options
const rows2 = [];
//1st Row
rows2.push({
  selectSite: {
    options: [
      { text: 'Site A ', value: 1 },
      { text: 'Site B ', value: 2 },
      { text: 'Site C ', value: 3 },
      { text: 'Site D ', value: 4 },
    ]
  },
  DataSite: {
    options: [
      { text: 'CM data ', value: 1 },
      { text: 'junk  data ', value: 2 },
      { text: 'OS data ', value: 3 },
      { text: 'VM data  ', value: 4 },
    ]
  },
});

//2nd Row.. Nothing pushed, so default options will be considered
rows2.push({});

//3rd Row.
rows2.push({
  selectSite: {
    options: [
      { text: 'NonEdit-1 ', value: 1 },
      { text: 'NonEdit-2', value: 2 },
      { text: 'NonEdit-3', value: 3 },
      { text: 'NonEdit-4', value: 4 },
    ],
    isEditable: false
  }
});

export default class TableColumnDependency extends React.Component {

  state = {
    rows2: rows2,
    rows: rows
  };

  handleCellEdit = (old, newVal, cell, row, e) => {
    console.log(`Editing the cell value ...  Old Value:- ${old}, New Value:- ${newVal}, Edited Cell:- ${cell}, Edited Row:- ${row}`);
    let id = 0;
    let editData = this.state.rows2;

    const rowsData = this.state.rows.map(rows => {

      if (row.id == id) {  //This example only control the first row(0). Based on "Select Site" column, option of "Select Data" will be changed.
        rows[cell.cid] = newVal;
        if (cell.cid == 1) {
          if (newVal == 2) {
            editData[row.id] = {
              selectSite: {
                options: [
                  { text: 'Site A ', value: 1 },
                  { text: 'Site B ', value: 2 },
                  { text: 'Site C ', value: 3 },
                  { text: 'Site D ', value: 4 },
                ]
              },
              DataSite: {
                options: [
                  { text: 'OS Data ', value: 1 },
                  { text: 'Cloud Data ', value: 2 },
                ],
                isEditable: false
              },
            }

          } else if (newVal == 3) {
            editData[row.id] = {
              selectSite: {
                options: [
                  { text: 'Site A ', value: 1 },
                  { text: 'Site B ', value: 2 },
                  { text: 'Site C ', value: 3 },
                  { text: 'Site D ', value: 4 },
                ]
              },
              DataSite: {
                options: [
                  { text: 'Cloud Data ', value: 1 },
                ],
                isEditable: false
              },
            }
          } else if (newVal == 4) {
            editData[row.id] = {
              selectSite: {
                options: [
                  { text: 'Site A ', value: 1 },
                  { text: 'Site B ', value: 2 },
                  { text: 'Site C ', value: 3 },
                  { text: 'Site D ', value: 4 },
                ]
              },
              DataSite: {
                options: [
                  { text: 'Junk Data ', value: 1 },
                ]
              },
            }

          } else {
            editData[row.id] = {
              selectSite: {
                options: [
                  { text: 'Site A ', value: 1 },
                  { text: 'Site B ', value: 2 },
                  { text: 'Site C ', value: 3 },
                  { text: 'Site D ', value: 4 },
                ]
              },
              DataSite: {
                options: [
                  { text: 'Site data ', value: 1 },
                  { text: 'junk  data ', value: 2 },
                  { text: 'OS data ', value: 3 },
                  { text: 'VM data  ', value: 4 },
                ]
              },
            }
          }
        }
      }
      id++;
      return rows;
    })

    this.setState({
      rows2: editData,
      rows: rowsData
    });
  };

  handleEditingCellBlur = (cell, row) => {
    console.log('handleEditingCellBlur: ', cell, row);
  }

  render() {
    const [version, theme] = getDemoVersion();
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Table
          columns={columns}
          dataset={this.state.rows}
          onRowExpend={this.handleRowExpend}
          onEdit={this.handleCellEdit}
          onEditingCellBlur={this.handleEditingCellBlur}
          editOptions={this.state.rows2}
          ref={table => { this.table = table; }}
        />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableColumnDependency />, mountNode);

```
