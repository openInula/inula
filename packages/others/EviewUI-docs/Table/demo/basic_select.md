---
order: 6
title:
  zh-CN: 基本属性设置(select)
  en-US: Table Paging (select)
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import img1 from '@images/table_1';
import img2 from '@images/table_2';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';
export default class TablePaging extends React.Component {
  state = {
    currentPage: 1,
    pageSize: 10,
    recordCount: 100,
  };

  handlePaging = (currentPage) => {
    this.setState({ currentPage });
  };

  handlePageSize = (pageSize) => {
    this.setState({ pageSize });
  };

  render() {
    const [version, theme] = getDemoVersion();
    const columns = [
      {
        title: 'VPN Name',
        width: '25%',
        enableRowMoveUpDown: true,
        key: 'col_1',
      },
      {
        title: 'State',
        width: '25%',
        key: 'col_2',
        render: cell => {
          if (cell === 'TO BE') {
            return (
              <div>
                <img
                  src={img1}
                  style={{ verticalAlign: 'bottom' }}
                  alt="TO BE"
                />
                {' '}
                TO BE
              </div>
            );
          }
          return (
            <div>
              <img
                src={img2}
                style={{ verticalAlign: 'bottom' }}
                alt="Active"
              />
              {' '}
              Active
            </div>
          );
        },
        allowSort: false,
      },
      {
        title: 'Site',
        width: '25%',
        key: 'col_3',
      },
      {
        title: 'Alarm',
        width: '25%',
        key: 'col_4',
      },
    ];
    const rows = [];
    let toIndex = this.state.currentPage * this.state.pageSize;
    if (toIndex > this.state.recordCount) {
      toIndex = this.state.recordCount;
    }
    for (let i = (this.state.currentPage - 1) * this.state.pageSize; i < toIndex; i++) {
      rows.push([`R&D VPN2${i}`, 'Active', i, 'ICMP Echo']);
    }
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
    <ConfigProvider version={version} theme={theme} locale='zh'>
      <div>
        <Table
          columns={columns}
          dataset={rows}
          enablePagination
          pageSize={this.state.pageSize}
          currentPage={this.state.currentPage}
          recordCount={this.state.recordCount}
          onPageChange={this.handlePaging}
          onPageSizeChange={this.handlePageSize}
          pagingType="select"
        />
      </div>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TablePaging />, mountNode);
```
