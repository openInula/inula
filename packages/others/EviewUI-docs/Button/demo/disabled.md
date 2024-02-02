---
order: 2
title:
  zh-CN: 不可用状态
  en-US: Button Style with Title
---

## zh-CN

添加 `disabled` 属性即可让按钮处于不可用状态，同时按钮样式也会改变。

## en-US

```jsx
import Button from "eview-ui/Button";
import LabelField from "eview-ui/LabelField";
import create_default from "@images/create_default";
import delete_disabled from "@images/delete_disabled";
import collecte_disabled from "@images/collecte_disabled";
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
              text="Primary"
              status="primary"
              style={{marginRight: "1rem", marginBottom: "20px"}}
            />
            <Button
              text="Disable Primary"
              status="primary"
              disabled={true}
              style={{marginBottom: "20px"}}
            />
            <br/>
            <Button
              text="Default"
              tipShow="overflow"
              style={{marginRight: "1rem", marginBottom: "20px"}}
            />
            <Button
              text="Disable Default"
              disabled={true}
              style={{marginBottom: "20px"}}
            />
            <br/>
            <Button
              text="Risk"
              status="risk"
              style={{marginRight: "1rem", marginBottom: "20px"}}
            />
            <Button
              text="Disable Risk"
              status="risk"
              disabled={true}
              style={{marginBottom: "20px"}}
            />
          </div>
        </div>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<IconButtonStyle />, mountNode);
```
