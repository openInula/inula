---
order: 1
title:
  zh-CN: 事件处理
  en-US: Event Handling
---

## zh-CN



## en-US



```jsx
import Select from 'eview-ui/Select';
import Button from 'eview-ui/Button';
import DivMessage from 'eview-ui/DivMessage';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class SelectEventExample extends React.Component {

    state = {
        msg: '',
        selectedValue: undefined,
    };

    handleChange = (value) => {
        this.setState({ msg: "OnChange Event Callback, Selected Value: " + value, selectedValue: value });
    };

    handleInputChange = (value) => {
        this.setState({ msg: "OnChange Event Callback, Selected Value: " + value.value, selectedValue: value });
    };

    handleClick = () => {
        this.setState({ msg: "getValue API: current Value:" + this.select.getValue() });
    };

    handleClickValidate = (result) => {
        if (this.select.validate()) {
            this.setState({ msg: "Validate API Passed", selectedValue: this.select.getValue() });
        }
    };

    handleClickFocus = () => {
        this.select.focus();
    };

    render() {
        const [version, theme] = getDemoVersion();
        let options = [{ text: "China", value: 1 }, { text: "UK", value: 2 }, { text: "USA", value: 3 }];
        let options1 = [{ text: "China", value: { value: 'China' } }, { text: "UK", value: { timeDim: "custom", value: 'UK' } },
        { text: "USA", value: { interval: "message", value: 'USA' } }];
        let buttonStyle = { marginLeft: "20px" };
        return (
          // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
          <ConfigProvider version={version} theme={theme}>
            <div id="evu_Select_example" style={{ marginLeft: "20px", minHeight: '80px' }}>
              <Select label="Event callback" value={this.state.selectedValue} required
                      options={options} ref={(select) => this.select = select} onChange={this.handleChange} />&nbsp;&nbsp;
              <Button text="Value" onClick={this.handleClick} style={buttonStyle}></Button>
              <Button text="Validate" onClick={this.handleClickValidate} style={buttonStyle}></Button>
              <Button text="Focusing" onClick={this.handleClickFocus} style={buttonStyle}></Button>
              <br /><br />
              <Select label="Event callback passing value as object" value={this.state.selectedValue} required
                      options={options1} onChange={this.handleInputChange} />
              {this.state.msg ? <DivMessage text={this.state.msg} type="success" style={{ marginTop: "10px", width: "560px" }} /> : ''}
            </div>
          </ConfigProvider>
        )
    }
}

ReactDOM.render(<SelectEventExample />, mountNode);

```
