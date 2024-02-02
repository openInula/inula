---
order: 2
title:
  zh-CN: 提示功能
  en-US: Button Style with Title
---

## zh-CN

`tipData`设置提示信息

## en-US

```jsx
import Button from "eview-ui/Button";
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class IconButtonStyle extends React.Component {
  render() {
    const [version, theme] = getDemoVersion();
    let divStyle = { margin: "20px 0px 20px 20px" };
    let iconButtonStyle = { marginRight: "5px", width: "90px" };
    let labelStyle = {
      display: "block",
      fontSize: "14px",
      marginBottom: "10px",
      paddingLeft: "0px"
    };
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div id="evu_button_example">
          <div style={divStyle}>
            <Button
              text="带提示的按钮"
              tipData="Hello eViews!"
              tipShow="always"
              style={{width: '8rem', marginRight: "1rem", marginBottom: "20px"}}
            />
          </div>
        </div>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<IconButtonStyle />, mountNode);
```
