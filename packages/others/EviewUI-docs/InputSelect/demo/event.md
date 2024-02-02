---
order: 0
title:
  zh-CN: API使用
  en-US: API Usage
---

## zh-CN



## en-US



```jsx
import InputSelect from 'eview-ui/InputSelect';
import Button from 'eview-ui/Button';
import DivMessage from 'eview-ui/DivMessage';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class InputSelectEvent extends React.Component {

  state = {
    msg: '',
    selectedValue: ''
  };

  handleChange = (value) => {
    this.setState({msg: "onChange event callback, Selected value : " + value, selectedValue: value});
  };
  handleKeyUp = (value) => {
    console.log(value);
  }

  handleClick = () => {
    this.setState({msg: "getValue API, Current value : " + this.select.getValue()});
  };

  handleClickValidate = (result) => {
    if (this.select.validate()) {
      this.setState({
        msg: "Validated, Current value : " + this.select.getValue(),
        selectedValue: this.select.getValue()
      });
    }
  };

  handleClickFocus = () => {
    this.select.focus();
  };

  render() {
    const [version, theme] = getDemoVersion();
    let options = [{text: "All", value: -1},
      {text: "Shelf0-12-53ND2-1(IN1/OUT1)", value: 0},
      {text: "Shelf0-12-53ND2-2(IN2/OUT2)", value: 1},
      {text: "Shelf0-13-11LEM24-3(IN3/OUT3)", value: 2},
      {text: "USA", value: 3},
      {text: "a1", value: 4},
      {text: "a2", value: 5},
      {text: "a3", value: 6},
      {text: "a4", value: 7},
      {text: "a5", value: 8},
      {text: "a6", value: 9},
      {text: "a7", value: 10},
      {text: "a8", value: 11},
      {text: "a9", value: 12},
      {text: "a10", value: 13},
      {text: "a11", value: 14},
      {text: "a12", value: 15},];

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div id="evu_InputSelect_example">
          <div style={{marginLeft: "20px"}}>
            <InputSelect id={"ID_InputSelect"} label="Event callback function" options={options}  required
                         value={this.state.selectedValue} onChange={this.handleChange} onInputKeyUp={this.handleKeyUp}  ref={(select) => this.select = select}/>&nbsp;&nbsp;
            <Button text="Value" onClick={this.handleClick} style={{marginRight: "5px"}}></Button>
            <Button text="Verification" onClick={this.handleClickValidate} style={{marginRight: "5px"}}></Button>
            <Button text="Focusing" onClick={this.handleClickFocus} style={{marginRight: "5px"}}></Button>
            {this.state.msg ?
              <DivMessage text={this.state.msg} type="success" style={{marginTop: '10px', width: '500px',}}/> : ''}
          </div>
        </div>
      </ConfigProvider>
    )
  }
}

ReactDOM.render(<InputSelectEvent />, mountNode);

```
