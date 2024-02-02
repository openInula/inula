---
order: 2
title:
  zh-CN: 基本属性设置
  en-US: TableCell ClassName Update and set Focus to column
---

## zh-CN

TableCell ClassName Update and set Focus to column

## en-US



```jsx
import Table from 'eview-ui/Table';
import Dialog from 'eview-ui/Dialog';
import Select from 'eview-ui/Select';
import Button from 'eview-ui/Button';
import PopUpMenu from 'eview-ui/PopUpMenu';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

const events = {
  once(el, type, callback) {
    const typeArray = type ? type.split(' ') : [];
    const recursiveFunction = (event) => {
      event.target.removeEventListener(event.type, recursiveFunction);
      return callback(event);
    };

    for (let i = typeArray.length - 1; i >= 0; i--) {
      this.on(el, typeArray[i], recursiveFunction);
    }
  },

  on(el, type, callback) {
    if (el.addEventListener) {
      el.addEventListener(type, callback);
    } else {
      // IE8+ Support
      el.attachEvent(`on${type}`, () => {
        callback.call(el);
      });
    }
  },

  off(el, type, callback) {
    if (el.removeEventListener) {
      el.removeEventListener(type, callback);
    } else {
      // IE8+ Support
      el.detachEvent(`on${type}`, callback);
    }
  },

  isKeyboard(event) {
    return [
      'keydown',
      'keypress',
      'keyup',
    ].indexOf(event.type) !== -1;
  },
};


const isDescendant = (el, target) => {
  if (target !== null) {
    return el === target || isDescendant(el, target.parentNode);
  }
  return false;
};

const bind = (eventTypes, callback) => eventTypes.forEach((event) => events.on(document, event, callback));
const unbind = (eventTypes, callback) => eventTypes.forEach((event) => events.off(document, event, callback));

const bindOnwindow = (eventTypes, callback) => eventTypes.forEach((event) => events.on(window, event, callback));
const unbindOnwindow = (eventTypes, callback) => eventTypes.forEach((event) => events.off(window, event, callback));

class ClickAwayListener extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    onClickAway: PropTypes.func,
    eventTypes: PropTypes.array,
    eventTypesOnWindow: PropTypes.array,
  };

  static defaultProps = {
    eventTypes: ['mousedown'],
    eventTypesOnWindow: [],
  };


  componentDidMount() {
    this.isCurrentlyMounted = true;
    if (this.props.onClickAway) {
      bind(this.props.eventTypes, this.handleClickAway);
      bindOnwindow(this.props.eventTypesOnWindow, this.handleClickAway);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.onClickAway !== this.props.onClickAway) {
      unbind(this.props.eventTypes, this.handleClickAway);
      unbindOnwindow(this.props.eventTypesOnWindow, this.handleClickAway);
      if (this.props.onClickAway) {
        bind(this.props.eventTypes, this.handleClickAway);
        bindOnwindow(this.props.eventTypesOnWindow, this.handleClickAway);
      }
    }
  }

  componentWillUnmount() {
    this.isCurrentlyMounted = false;
    unbind(this.props.eventTypes, this.handleClickAway);
    unbindOnwindow(this.props.eventTypesOnWindow, this.handleClickAway);
  }

  isWindow(obj) {
    return typeof obj.closed !== 'undefined';
  }

  handleClickAway = (event) => {

    if (event.defaultPrevented) {
      return;
    }

    // IE11 support, which trigger the handleClickAway even after the unbind
    if (this.isCurrentlyMounted) {

      if (this.isWindow(event.target)) {
        this.props.onClickAway(event);
        return;
      }
      const el = ReactDOM.findDOMNode(this);
      if (document.documentElement.contains(event.target) && !isDescendant(el, event.target)) {
        this.props.onClickAway(event);
      }
    }
  };

  render() {
    return this.props.children;
  }
}

const columns = [
  {
    title: 'VPN Name',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'VPN_ID',
    width: '120',
    customSort: true,
    render: cell => {
      return <div>{cell.value}</div>;
    },
  },
  {
    title: 'Site',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'Site_ID',
    width: '120',
  },
  {
    title: 'Alarm',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'Alarm_ID',
    width: '120',
  },
  {
    title: 'Error',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'Error_ID',
    width: '120',
  },
  {
    title: 'Information',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'Information_ID',
    width: '120',
  },
  {
    title: 'Warn',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'Warn_ID',
    width: '120',
  },
  {
    title: 'CreateTime',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'CreateTime_ID',
    width: '120',
  },
  {
    title: 'DeleteTime',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'DeleteTime_ID',
    width: '220',
  },
  {
    title: 'ModifyTime',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'ModifyTime_ID',
    width: '220',
  },
  {
    title: 'MaxVal',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'MaxVal_ID',
    width: '240',
  },
  {
    title: 'MinVal',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'MinVal_ID',
    width: '240',
  },
  {
    title: 'ClearenceMaxval',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'ClearenceMaxval_ID',
    width: '240',
  },
  {
    title: 'ClearenceMinval',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'ClearenceMinval_ID',
    width: '240',
  },
  {
    title: 'ThresholdMaxVal',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'ThresholdMaxVal_ID',
    width: '240',
  },
  {
    title: 'ThresholdMinVal',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'ThresholdMinVal_ID',
    width: '240',
  },
  {
    title: 'Remark',
    dataType: Table.ColumnRenderType.TEXT_FIELD,
    key: 'Remark_ID',
    width: '200',
  },

];

export default class TableCellUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns:[],
    }
  }
  componentDidMount(){
    setTimeout(()=>{
      this.setState({columns:[...columns]}); // 模拟接口请求columns，初始值columns为空 ,渲染子table组件
    })
  }
  
  render() {
    return <MainTable columns={this.state.columns}/>
  }
}

class MainTable extends React.Component {
  constructor(props) {
    super(props);
    this.selectedName = '';
  }
  state = {
    isMenuOpen: false,
    X: 100,
    Y: 100,
    offset: {
      X: 100,
      Y: 100
    },
    parentId: "",
    selectOptions: [],
    columnName: '',
    isOpen: false,
    value: undefined,
  }

  handleCustomSort = (key, aValue, bValue) => {
    console.log("handleCustomSort: ", key, aValue, bValue);
    if(typeof(aValue) === "object") {
        aValue = aValue.value;
    }
    if(typeof(bValue) === "object") {
        bValue = bValue.value;
    }
    if (aValue > bValue) {
      return -1;
    } else if (aValue < bValue) {
      return 1;
    }
    return 0;
  };

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
      columnName: this.selectedName,
    })
  }

  handleMenuClick = (evt) => {
    console.log("Popup menu onClick : ", evt);
  }
  handleToSetFocus = (e) => {
    let columnsIfo = this.props.columns;
    let columnOptions = [];
    for (let i = 0; i < columnsIfo.length; i++) {
      columnOptions.push({ text: columnsIfo[i].title, value: i + 1, key: { i } })
    }
    this.setState({ iframeOpen: true, selectOptions: columnOptions, isMenuOpen: false });
  }
  hanleIframeClose = (e) => {
    this.setState({ iframeOpen: false, isMenuOpen: false });
  }
  handleSelectChange = (value, oldValue, text, oldText) => {
    this.selectedName = text;
  }
  handleClickOkButton = (e) => {

    if (this.table) {
      this.table.setScrollPositionToColumn(this.selectedName);
    }
    this.setState({ iframeOpen: false, isMenuOpen: false });

  }

  handleCellClick = (cell, row, e) => {
    const cellValue = cell.value;
    this.setState({ isOpen: true, value: cellValue instanceof Object ? cellValue.value : cellValue });
  }

  handleClick = ()=>{
    this.setState({isOpen:false});
  }

  render() {

    const [version, theme] = getDemoVersion();
    const rows = [];
    rows.push([{ value: "AV&Pn", cellClassName: 'eui_cell_table_bgColor0', key: '0' }, '3', 'ICMP Echo', '1', 'info', 'warn', '08/07/2019', '08/07/2019', '08/07/2019', 1000, 0, 100, 0, 50, 20, "Remark"]);
    rows.push([{ value: "Shop Storage", cellClassName: 'eui_cell_table_bgColor1', key: '1' }, '3', 'ICMP Echo ', '1', 'info', 'warn', '08/07/2019', '08/07/2019', '08/07/2019', 1000, 0, 100, 0, 50, 20, "Remark"]);
    rows.push([{ value: "ITLink", cellClassName: 'eui_cell_table_bgColor2', key: '2' }, '7', 'ICMP Echo', '1', 'info', 'warn', '08/07/2019', '08/07/2019', '08/07/2019', 1000, 0, 100, 0, 50, 20, "Remark"]);
    rows.push([{ value: "R&D VPN4", cellClassName: 'eui_cell_table_bgColor3', key: '3' }, '3', 'ICMP Echo', '1', 'info', 'warn', '08/07/2019', '08/07/2019', '08/07/2019', 1000, 0, 100, 0, 50, 20, "Remark"]);
    rows.push([{ value: "R&D VPN6", cellClassName: 'eui_cell_table_bgColor4', key: '4' }, '5', 'ICMP Echo', '1', 'info', 'warn', '08/07/2019', '08/07/2019', '08/07/2019', 1000, 0, 100, 0, 50, 20, "Remark"]);
    rows.push([{ value: "R&D VPN2", cellClassName: 'eui_cell_table_bgColor2', key: '5' }, '7', 'ICMP Echo', '1', 'info', 'warn', '08/07/2019', '08/07/2019', '08/07/2019', 1000, 0, 100, 0, 50, 20, "Remark"]);

    let PopUpMenuOptions = [
      {
        text: "FocusToSelectedColumn", serialno: 1, onClick: this.handleToSetFocus,
      },

    ];

    return (
      <ConfigProvider ConfigProvider version={version} theme={theme}>
        <Table onRowRightClick={this.onRowRightClick}
          columns={this.props.columns}
          dataset={rows}
          customSortFun={this.handleCustomSort}
          ref={table => { this.table = table; }}
          onCellClick={this.handleCellClick} 
          key={this.props.columns}
        />
        <PopUpMenu options={PopUpMenuOptions} parentId={this.state.parentId} isOpen={this.state.isMenuOpen} X={this.state.X} Y={this.state.Y} offset={this.state.offset}
          onClick={this.handleMenuClick}></PopUpMenu>
        <ClickAwayListener eventTypes={['mousewheel', 'mousedown']} eventTypesOnWindow={['resize']}>
          <Dialog
            title='Hello React'
            isOpen={this.state.iframeOpen}
            onClose={this.hanleIframeClose}
            modal={true}
            size={[300, 200]}
            style={{ minWidth: '400px', minHeight: '200px' }}
            children={<div><Select options={this.state.selectOptions} ref={(select) => this.select = select} onChange={this.handleSelectChange} />
              <Button text="ok" onClick={this.handleClickOkButton} /></div>}
          />
        </ClickAwayListener>
        <Dialog title={'Dialog'} isOpen={this.state.isOpen} onClose={this.handleClick} closeOnEscape
          children={<div>{this.state.value}</div>} />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableCellUpdate />, mountNode);
```
