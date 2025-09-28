import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Table } from 'antd';
import { SmartComponentProps, ComponentTool, SmartComponentConfig } from '../../types';
import { registerComponent } from '../../utils/SmartComponentExecutor';

export interface TableColumn {
  title: string;
  dataIndex: string;
  key?: string;
  width?: number;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export interface TableComponentRef {
  setData: (data: any[]) => void;
  getData: () => any[];
  addRow: (row: any) => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, row: any) => void;
  getRow: (index: number) => any;
  setColumns: (columns: TableColumn[]) => void;
  getColumns: () => TableColumn[];
  addColumn: (column: TableColumn) => void;
  removeColumn: (dataIndex: string) => void;
  clearData: () => void;
  sortByColumn: (dataIndex: string, order: 'ascend' | 'descend') => void;
  filterData: (filters: Record<string, any>) => void;
  selectRow: (index: number) => void;
  selectAllRows: () => void;
  clearSelection: () => void;
  getSmartConfig: () => SmartComponentConfig;
}

interface TableComponentProps extends SmartComponentProps {
  columns?: TableColumn[];
  dataSource?: any[];
  rowSelection?: any;
  pagination?: any;
  loading?: boolean;
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  scroll?: { x?: number; y?: number };
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  tools?: ('setData' | 'getData' | 'addRow' | 'removeRow' | 'updateRow' | 'getRow' | 'setColumns' | 'getColumns' | 'addColumn' | 'removeColumn' | 'clearData' | 'sortByColumn' | 'filterData' | 'selectRow' | 'selectAllRows' | 'clearSelection')[];
  onSmartRegister?: (config: SmartComponentConfig, instance: TableComponentRef) => void;
}

const TableComponent = forwardRef<TableComponentRef, TableComponentProps>((props, ref) => {
  const {
    columns: initialColumns = [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '年龄', dataIndex: 'age', key: 'age' },
      { title: '地址', dataIndex: 'address', key: 'address' }
    ],
    dataSource: initialDataSource = [
      { key: '1', name: '张三', age: 32, address: '北京市西城区' },
      { key: '2', name: '李四', age: 42, address: '上海市黄浦区' }
    ],
    rowSelection,
    pagination = true,
    loading = false,
    size = 'middle',
    bordered = false,
    scroll,
    onChange,
    tools = ['setData', 'addRow', 'removeRow'],
    onSmartRegister,
    ...restProps
  } = props;

  const [columns, setColumns] = useState<TableColumn[]>(initialColumns);
  const [dataSource, setDataSource] = useState<any[]>(initialDataSource);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>(initialDataSource);

  // 定义所有可用的工具
  const availableTools: Record<string, ComponentTool> = {
    setData: {
      name: 'setData',
      description: '设置表格数据',
      paramsSchema: {
        type: 'object',
        properties: {
          data: { type: 'array', description: '表格数据数组' }
        },
        required: ['data']
      },
      cb: (instance: TableComponentRef, params: any) => instance.setData(params.data)
    },
    getData: {
      name: 'getData',
      description: '获取表格数据',
      paramsSchema: {},
      cb: (instance: TableComponentRef) => instance.getData()
    },
    addRow: {
      name: 'addRow',
      description: '添加表格行',
      paramsSchema: {
        type: 'object',
        properties: {
          row: { type: 'object', description: '要添加的行数据' }
        },
        required: ['row']
      },
      cb: (instance: TableComponentRef, params: any) => instance.addRow(params.row)
    },
    removeRow: {
      name: 'removeRow',
      description: '删除表格行',
      paramsSchema: {
        type: 'object',
        properties: {
          index: { type: 'number', description: '要删除的行索引' }
        },
        required: ['index']
      },
      cb: (instance: TableComponentRef, params: any) => instance.removeRow(params.index)
    },
    updateRow: {
      name: 'updateRow',
      description: '更新表格行',
      paramsSchema: {
        type: 'object',
        properties: {
          index: { type: 'number', description: '要更新的行索引' },
          row: { type: 'object', description: '新的行数据' }
        },
        required: ['index', 'row']
      },
      cb: (instance: TableComponentRef, params: any) => instance.updateRow(params.index, params.row)
    },
    getRow: {
      name: 'getRow',
      description: '获取指定行数据',
      paramsSchema: {
        type: 'object',
        properties: {
          index: { type: 'number', description: '行索引' }
        },
        required: ['index']
      },
      cb: (instance: TableComponentRef, params: any) => instance.getRow(params.index)
    },
    setColumns: {
      name: 'setColumns',
      description: '设置表格列配置',
      paramsSchema: {
        type: 'object',
        properties: {
          columns: { type: 'array', description: '列配置数组' }
        },
        required: ['columns']
      },
      cb: (instance: TableComponentRef, params: any) => instance.setColumns(params.columns)
    },
    getColumns: {
      name: 'getColumns',
      description: '获取表格列配置',
      paramsSchema: {},
      cb: (instance: TableComponentRef) => instance.getColumns()
    },
    addColumn: {
      name: 'addColumn',
      description: '添加表格列',
      paramsSchema: {
        type: 'object',
        properties: {
          column: { type: 'object', description: '列配置' }
        },
        required: ['column']
      },
      cb: (instance: TableComponentRef, params: any) => instance.addColumn(params.column)
    },
    removeColumn: {
      name: 'removeColumn',
      description: '删除表格列',
      paramsSchema: {
        type: 'object',
        properties: {
          dataIndex: { type: 'string', description: '列的dataIndex' }
        },
        required: ['dataIndex']
      },
      cb: (instance: TableComponentRef, params: any) => instance.removeColumn(params.dataIndex)
    },
    clearData: {
      name: 'clearData',
      description: '清空表格数据',
      paramsSchema: {},
      cb: (instance: TableComponentRef) => instance.clearData()
    },
    sortByColumn: {
      name: 'sortByColumn',
      description: '按列排序',
      paramsSchema: {
        type: 'object',
        properties: {
          dataIndex: { type: 'string', description: '排序列' },
          order: { type: 'string', enum: ['ascend', 'descend'], description: '排序方向' }
        },
        required: ['dataIndex', 'order']
      },
      cb: (instance: TableComponentRef, params: any) => instance.sortByColumn(params.dataIndex, params.order)
    },
    selectRow: {
      name: 'selectRow',
      description: '选择指定行',
      paramsSchema: {
        type: 'object',
        properties: {
          index: { type: 'number', description: '行索引' }
        },
        required: ['index']
      },
      cb: (instance: TableComponentRef, params: any) => instance.selectRow(params.index)
    },
    selectAllRows: {
      name: 'selectAllRows',
      description: '选择所有行',
      paramsSchema: {},
      cb: (instance: TableComponentRef) => instance.selectAllRows()
    },
    clearSelection: {
      name: 'clearSelection',
      description: '清空选择',
      paramsSchema: {},
      cb: (instance: TableComponentRef) => instance.clearSelection()
    }
  };

  const refObject = React.useRef<TableComponentRef | null>(null);

  useImperativeHandle(ref, () => {
    const instance: TableComponentRef = {
      setData: (data: any[]) => {
        setDataSource(data);
        setFilteredData(data);
      },
      getData: () => {
        return dataSource;
      },
      addRow: (row: any) => {
        const newData = [...dataSource, { ...row, key: Date.now().toString() }];
        setDataSource(newData);
        setFilteredData(newData);
      },
      removeRow: (index: number) => {
        const newData = dataSource.filter((_, i) => i !== index);
        setDataSource(newData);
        setFilteredData(newData);
      },
      updateRow: (index: number, row: any) => {
        const newData = [...dataSource];
        if (newData[index]) {
          newData[index] = { ...newData[index], ...row };
          setDataSource(newData);
          setFilteredData(newData);
        }
      },
      getRow: (index: number) => {
        return dataSource[index];
      },
      setColumns: (newColumns: TableColumn[]) => {
        setColumns(newColumns);
      },
      getColumns: () => {
        return columns;
      },
      addColumn: (column: TableColumn) => {
        setColumns(prev => [...prev, column]);
      },
      removeColumn: (dataIndex: string) => {
        setColumns(prev => prev.filter(col => col.dataIndex !== dataIndex));
      },
      clearData: () => {
        setDataSource([]);
        setFilteredData([]);
      },
      sortByColumn: (dataIndex: string, order: 'ascend' | 'descend') => {
        const sortedData = [...dataSource].sort((a, b) => {
          const aVal = a[dataIndex];
          const bVal = b[dataIndex];
          if (order === 'ascend') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
        setDataSource(sortedData);
        setFilteredData(sortedData);
      },
      filterData: (filters: Record<string, any>) => {
        let filtered = [...dataSource];
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            filtered = filtered.filter(item => 
              item[key] && item[key].toString().includes(filters[key].toString())
            );
          }
        });
        setFilteredData(filtered);
      },
      selectRow: (index: number) => {
        const row = dataSource[index];
        if (row && !selectedRows.includes(row)) {
          setSelectedRows([...selectedRows, row]);
        }
      },
      selectAllRows: () => {
        setSelectedRows([...dataSource]);
      },
      clearSelection: () => {
        setSelectedRows([]);
      },
      getSmartConfig: (): SmartComponentConfig => {
        const selectedTools: Record<string, ComponentTool> = {};
        tools.forEach(toolName => {
          if (availableTools[toolName]) {
            selectedTools[toolName] = availableTools[toolName];
          }
        });

        return {
          meta: {
            name: 'table',
            description: '智能表格组件',
            category: 'display',
            aiPrompts: ['添加数据', '删除行', '更新表格', '排序数据'],
            capabilities: tools,
            version: '1.0.0'
          },
          tools: selectedTools
        };
      }
    };

    refObject.current = instance;
    return instance;
  });

  // 当组件挂载时，自动注册到全局系统
  useEffect(() => {
    if (refObject.current) {
      registerComponent('Table', refObject.current, tools);
      
      if (onSmartRegister) {
        const config = refObject.current.getSmartConfig();
        onSmartRegister(config, refObject.current);
      }
    }
  }, [tools, onSmartRegister]);

  const handleChange = (pagination: any, filters: any, sorter: any) => {
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  const rowSelectionConfig = rowSelection ? {
    ...rowSelection,
    selectedRowKeys: selectedRows.map(row => row.key),
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if (selected) {
        setSelectedRows([...dataSource]);
      } else {
        setSelectedRows([]);
      }
    },
    onSelect: (record: any, selected: boolean, selectedRows: any[], nativeEvent: Event) => {
      if (selected) {
        setSelectedRows(prev => [...prev, record]);
      } else {
        setSelectedRows(prev => prev.filter(row => row.key !== record.key));
      }
    }
  } : undefined;

  return (
    <Table
      columns={columns}
      dataSource={filteredData}
      rowSelection={rowSelectionConfig}
      pagination={pagination}
      loading={loading}
      size={size}
      bordered={bordered}
      scroll={scroll}
      onChange={handleChange}
      data-smart-component="table"
      {...restProps}
    />
  );
});

TableComponent.displayName = 'TableComponent';

export default TableComponent;