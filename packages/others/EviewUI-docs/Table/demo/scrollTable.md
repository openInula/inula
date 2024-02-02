---
order: 13
title:
  zh-CN: 滚动表格 + 显示行号
  en-US: Scroll Table + Show Line Number
---

## zh-CN



## en-US



```jsx
import ScrollTable from 'eview-ui/ScrollTable';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class ScrollTableExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataset: [],
            columns: this.getColumns(),
            currentStart: 0,
            oldStartRow: 0,
            displayPerPage: 0,
            checkedRowSet: new Set(),
            checkedRowIndexs: [],
            disableRowIds: [3, 7, 15]
        };
    }

    componentWillMount() {
        this.setState({
            dataset: this.getDataset()
        });
    }

    componentDidMount() {
        window.console.log(this.table);
    }

    getColumns = () => {
        const columns = [
            {
                title: 'id',
                key: 'id',
                id: 'col_0',
                display: false
            },
            {
                title: 'VPN Name',
                id: 'col_1',
                key: 'name'
            },
            {
                title: 'State',
                allowSort: false,
                id: 'col_2',
                key: 'state'
            },
            {
                title: 'Site',
                display: true,
                id: 'col_3',
                key: 'site'
            },
            {
                title: 'Alarm',
                display: true,
                id: 'col_4',
                key: 'alarm'
            },
            {
                title: 'Warn',
                display: true,
                id: 'col_5',
                key: 'warn'
            },
            {
                title: 'Info',
                display: true,
                id: 'col_6',
                key: 'info'
            },
            {
                title: 'Error',
                display: true,
                id: 'col_7',
                key: 'error'
            },
        ];
        return columns;
    };

    onTurnPage = (currentStart, oldStartRow, displayPerPage, event) => {
        this.setState({
            currentStart,
            oldStartRow,
            displayPerPage
        });
    };

    getDataset = () => {
        const totalDataList = [];
        for(let i = 0; i < 20000; i++) {
            totalDataList.push([
                i,
                `VPN Name${i}`,
                `State${i}`,
                `Site${i}`,
                `Alarm${i}`,
                `Warn${i}`,
                `Info${i}`,
                `Error${i}`,
              {key:"scrollRowIndex",value:i},
            ]);
        }
        return totalDataList;
    };

    handleRowCheck = (row, checkedRows, e) => {
        const { checkedRowSet } = this.state;
        if (row.checked) {
            checkedRowSet.add(row.id);
        } else {
            checkedRowSet.delete(row.id);
        }
        this.setState({ checkedRowSet, checkedRowIndexs: checkedRows });
    };

    handleHeaderCheck = (checkedRows) => {
        const { checkedRowSet, dataset } = this.state;
        const checkedDatas = [];
        if (checkedRows.length) {
            const { disableRowIds } = this.state;
            dataset.forEach((row, index) => {
                if (disableRowIds.length && disableRowIds.indexOf(index) !== -1) {
                    return;
                }
                checkedRowSet.add(row.id);
                checkedDatas.push(index);
            });
        } else {
            checkedRowSet.clear();
        }
        this.setState({ checkedRowSet, checkedRowIndexs: checkedDatas });
    };

    render() {
        const { columns, dataset, checkedRowSet } = this.state;
        let headerCheckStatus = 'empty';
        if (checkedRowSet.size === dataset.length) {
            headerCheckStatus = 'all';
        } else if (checkedRowSet.size && checkedRowSet.size < dataset.length) {
            headerCheckStatus = 'half';
        }
      const [version, theme] = getDemoVersion();
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
        return (
          <ConfigProvider version={version} theme={theme}>
            <div style={{ height: '420px' }}>
              <ScrollTable
                HeaderCheckedStatus={headerCheckStatus}
                dataset={dataset}
                columns={columns}
                totalCount={dataset.length}
                onTurnPage={this.onTurnPage}
                enableCheckBox={true}
                checkedRows={this.state.checkedRowIndexs}
                enableShowLineNumber={true}
                onRowCheck={this.handleRowCheck}
                onHeaderCheck={this.handleHeaderCheck}
                enableColumnFilter={true}
                itemOrderChanger={true}
                enableShiftCheck={true}
                disableRowIds={this.state.disableRowIds}
                ref={table => this.table = table}
              />
            </div>
          </ConfigProvider>
        );
    }
}

ReactDOM.render(<ScrollTableExample />, mountNode);

```
