---
order: 12
title:
  zh-CN: 列自定义
  en-US: Custom Columns
---

## zh-CN



## en-US



```jsx
import Table from 'eview-ui/Table';
import { TextField, Button, Radio, Select, Checkbox, ButtonMenu, DatePicker, FileUpload, ProgressBar, SearchInput, LinkField, TextArea } from 'eview-ui';
import createDefaultImg from '@images/create_default';
import deleteDefaultImg from '@images/delete_default';
import exportDefaultImg from '@images/export_default';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class TableMultiComponents extends React.Component {
  state = {
    msg: null,
    checkedRows: [],
    enableProgress: false,
    fileUploadStatus: 'loading',
  };
  constructor(props) {
    super(props);
    this.state = { value: {}, fileUploadStatus: {}, disable: false };
  }

  handleRowCheck = (row, data) => {
    this.setState({ checkedRows: data })
  };

  handleEditClick = () => {
    this.table.setRowEditable(2);
  };

  handleEditOtherOneClick = () => {
    this.table.setRowEditable(4);
  };

  uploadCallback = (obj) => {
    console.log(this.fileupload.getValue());
    if (obj) {
      let fileName = obj.data[0].name
      setTimeout(() => this.setState(this.getNameAndVal(fileName, 10)), 500);
      setTimeout(() => this.setState(this.getNameAndVal(fileName, 40)), 2000);
      setTimeout(() => this.setState(this.getNameAndVal(fileName, 100)), 6000);
    }
  }

  getNameAndVal = (fileName, progress, loadingStatus) => {

    let createVal = { value: {}, fileUploadStatus: {} };
    createVal.value[fileName] = progress;
    if (progress < 100 && loadingStatus != 'fail' && this.state.fileUploadStatus[fileName] != 'fail') {
      createVal.fileUploadStatus[fileName] = "loading";
    }
    else if (progress == 100 && this.state.fileUploadStatus[fileName] != "fail") {
      createVal.fileUploadStatus[fileName] = "success";
    }
    else if (progress != 100 || this.state.fileUploadStatus[fileName] == 'fail') {
      createVal.fileUploadStatus[fileName] = "fail";
      createVal.value[fileName] = 100;
    }
    return createVal;
  }
  handleCancelUpload = (event) => {
    console.log('cancel CallBack');
  }

  onRowRightClick = (e, row) => {
    console.log(row);
  }

  render() {
    const [version, theme] = getDemoVersion();
    const progressBarParam = {
      format: "percent",
      current: 10
    };
    const columns = [
      {
        title: 'TextField',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 200,
        key: 'key_1',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },

      {
        title: 'Button',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 200,
        key: 'key_2',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: (cellValue) => {
          // ???title??????
          return cellValue.props && cellValue.props.text
            ? cellValue.props.text
            : '';
        },
      },
      {
        title: 'Radio',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 100,
        key: 'key_3',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'CheckBox',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 100,
        key: 'key_4',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'ButtonMenu',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 200,
        key: 'key_5',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'DatePicker',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 300,
        key: 'key_6',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'Select',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 250,
        key: 'key_7',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'Upload Single',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 600,
        key: 'key_8',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'ProgressBar',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 400,
        key: 'key_9',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'Search Input',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 300,
        key: 'key_10',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'Link',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 300,
        key: 'key_11',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },
      {
        title: 'TextArea',
        renderType: Table.ColumnRenderType.CUSTOM,
        width: 300,
        key: 'key_12',
        align: 'center',
        allowSort: true,
        display: true,
        isMovable: true,
        tipFormatter: 'custom_NO_TIP',
      },

    ];

    let dateStyle = { position: "absolute", margin: "-18px 0px 0px -100px" };

    const rows = [];
    rows.push([
      <TextField value="Input Value" />,
      <Button type="button" text="Primary" />,
      <Radio value="1" checked={true} />,
      <Checkbox value="1" checked={true} />,
      <ButtonMenu text="Operation" iconUrl={createDefaultImg} options={[{ text: "Create", value: 1, iconUrl: createDefaultImg }, { text: "Export", value: 2, iconUrl: exportDefaultImg }, { text: "Delete", value: 3, iconUrl: deleteDefaultImg }]} selectedIndex={0} />,
      <DatePicker value={new Date()} type='datetime' time={[10, 10, 10]} format='yyyy-MM-dd HH:mm:ss' style={dateStyle} required />,
      <Select options={[{ text: "BeiJIng", value: 1 }, { text: "UK", value: 2 }, { text: "USA", value: 3 }]} required={true} selectedIndex={0} />,
      <FileUpload type='single' width={'450px'} buttonText='Upload' enableProgress={true} disable={false} fileUploadStatus={this.state.fileUploadStatus} accept=".png"
        updateProgressStatus={this.state.value} buttonText='Upload File' ref={fileupload => { this.fileupload = fileupload }}
        placeHolder='please select' handleSubmit={this.uploadCallback} onCancelUpload={this.handleCancelUpload} />,
      <ProgressBar {...progressBarParam} />,
      <SearchInput placeholder="search" />,
      <LinkField text={"LinkTarget: blank"} target="_blank" href={'http://rnd-iemp.huawei.com/node/rest/component/preview/start.html'} disabled={false} />,
      <TextArea placeholder="Please Enter" rows={4} cols={40} maxLength={100} />,

    ]);
    rows.push([
      <TextField value="Input Value" />,
      <Button type="button" text="Primary" />,
      <Radio value="1" checked={false} />,
      <Checkbox value="1" checked={false} />,
      <ButtonMenu text="Operation" iconUrl={createDefaultImg} options={[{ text: "Create", value: 1, iconUrl: createDefaultImg }, { text: "Export", value: 2, iconUrl: exportDefaultImg }, { text: "Delete", value: 3, iconUrl: deleteDefaultImg }]} selectedIndex={0} />,
      <DatePicker value={new Date()} type='datetime' time={[10, 10, 10]} format='yyyy-MM-dd HH:mm:ss' required style={dateStyle} />,
      <Select options={[{ text: "BeiJIng", value: 1 }, { text: "UK", value: 2 }, { text: "USA", value: 3 }]} required={true} selectedIndex={0} />,
      <FileUpload type='single' width={'450px'} buttonText='Upload' enableProgress={true} disable={false} fileUploadStatus={this.state.fileUploadStatus} accept=".png"
        updateProgressStatus={this.state.value} buttonText='Upload File' ref={fileupload => { this.fileupload = fileupload }}
        placeHolder='please select' handleSubmit={this.uploadCallback} onCancelUpload={this.handleCancelUpload} />,
      <ProgressBar {...progressBarParam} />,
      <SearchInput placeholder="search" />,
      <LinkField text={"LinkTarget: self"} target="_self" href={'http://rnd-iemp.huawei.com/node/rest/component/preview/start.html'} disabled={false} />,
      <TextArea placeholder="Please Enter" rows={4} cols={40} maxLength={100} />,

    ]);
    let optionsDown = [{ text: "Create", value: 1, iconUrl: createDefaultImg }, { text: "Export", value: 2, iconUrl: exportDefaultImg }, { text: "Delete", value: 3, iconUrl: deleteDefaultImg },
    { text: "Create1", value: 1, iconUrl: createDefaultImg }, { text: "Export1", value: 2, iconUrl: exportDefaultImg }, { text: "Delete1", value: 3, iconUrl: deleteDefaultImg },
    { text: "Create2", value: 1, iconUrl: createDefaultImg }, { text: "Export2", value: 2, iconUrl: exportDefaultImg }, { text: "Delete2", value: 3, iconUrl: deleteDefaultImg },
    { text: "Create3", value: 1, iconUrl: createDefaultImg }, { text: "Export3", value: 2, iconUrl: exportDefaultImg }, { text: "Delete3", value: 3, iconUrl: deleteDefaultImg }];


    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div style={{ width: "100%", overflow: "auto" }}>
          <Table onRowRightClick={this.onRowRightClick}
            headerCheckBoxSortAllow={true}
            columns={columns}
            dataset={rows}
            pageSize={10}
            ref={table => { this.table = table; }}
            enableenableColumnDrag
            enableCheckBox
            selectedRowIndex={2}
          />
        </div>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<TableMultiComponents />, mountNode);

```
