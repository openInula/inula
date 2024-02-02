---
order: 14
title:
  zh-CN: 滚动分页动态数据加载
  en-US: Scroll Table Dynamic Fetching Data
---


## zh-CN



## en-US

```tsx
import { VirtualizedTable } from 'eview-ui';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class VirtualizedTableLazyLoading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataset: [],
            columns: this.getColumns(),
            currentStart: 0,
            oldStartRow: 0,
            displayPerPage: 0,
            checkedRowSet: new Set()
        };
    }

    componentWillMount() {
        this.setState({
            dataset: this.getDataset(0, 30)
        });
    }

    componentDidMount() {
        window.console.log(this.table);
    }

    getColumns = () => {
        const columns = [
            {
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
    }

    onTurnPage = (currentStart, oldStartRow, displayPerPage, event) => {
        this.setState({
            currentStart,
            oldStartRow,
            displayPerPage
        });
    }

    getDataset = (start, end) => {
        const totalDataList = [];
        for(let i = start; i < end; i++) {
            totalDataList.push({
                id: i,
                name: `VPN Name${i}`,
                state: `State${i}`,
                site: `Site${i}`,
                alarm: `Alarm${i}`,
                warn: `Warn${i}`,
                info: `Info${i}`,
                error: `Error${i}`
            });
        }
        return totalDataList;
    }

    handleRowCheck = (row, checkedRows, e) => {
        console.log(`checked rows from table ${checkedRows}`);

        console.log(`sort type : ${this.table.getSortType()}`);
        console.log(`sort column : ${this.table.getSortColumn()}`);
        this.table.setCheckedRows(checkedRows);
    }

    handleHeaderCheck = (checkedRows) => {
        const { checkedRowSet, dataset } = this.state;
        const checked = checkedRows.length > 0;
        if (checked) {
            dataset.forEach(row => {
                checkedRowSet.add(row.id);
            });
        } else {
            checkedRowSet.clear();
        }
    }

    getCheckedIds = (dataset, checkedRowSet) => {
        const checkedIds = [];
        if (checkedRowSet.size > 0) {
            const { currentStart, displayPerPage } = this.state;
            const currentPageData = dataset.slice(currentStart, currentStart + 8);
            currentPageData.forEach((row, index) => {
                if (checkedRowSet.has(row.id)) {
                    checkedIds.push(index);
                }
            });
        }
        return checkedIds;
    }

    lazyLoading = (startIndex, endIndex) => {
        console.log(`loading page: ${startIndex}, end: ${endIndex}, items: ${endIndex - startIndex}`);
        let mockData = this.getDataset(startIndex,endIndex);
        this.setState({
            dataset : mockData,
            currentStart: startIndex
        });
    }

    render() {
        const { columns, dataset, checkedRowSet, currentStart} = this.state;
        const checkedIds = this.getCheckedIds(dataset, checkedRowSet);
      const [version, theme] = getDemoVersion();
        return (
          // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
            <ConfigProvider version={version} theme={theme}>
              <div style={{ height: '420px' }}>
                <VirtualizedTable
                    width="1400px"
                    height="400px"
                    dataset={dataset}
                    startIndex = {currentStart}
                    columns={columns}
                    totalCount={10000}
                    enableCheckBox={true}
                    enableShowLineNumber={true}
                    onRowCheck={this.handleRowCheck}
                    onHeaderCheck={this.handleHeaderCheck}
                    enableColumnFilter={true}
                    itemOrderChanger={true}
                    loadMore={this.lazyLoading}
                    ref={table => this.table = table}
                />
              </div>
            </ConfigProvider>

        );
    }
}

ReactDOM.render(<VirtualizedTableLazyLoading />, mountNode);

```
