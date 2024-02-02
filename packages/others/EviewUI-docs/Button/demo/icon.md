---
order: 2
title:
  zh-CN: 带图标的按钮
  en-US: Button Style with Title
---

## zh-CN
`leftIcon` `leftIconProps`可以设置左图标<br/>
`rightIcon` `rightIconProps`可以设置右图标

## en-US

```jsx
import Button from "eview-ui/Button";
import LabelField from "eview-ui/LabelField";
import create_default from "@images/create_default";
import delete_disabled from "@images/delete_disabled";
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class IconButtonStyle extends React.Component {
  render() {
    const [version, theme] = getDemoVersion();
    let divStyle = { display: "flex" };
    let iconButtonStyle = { flex: "1", marginRight: "0.5rem" };
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
              leftIcon={create_default}
              leftIconProps={{
                leftHoverIcon: delete_disabled,
                leftIconClass: 'my-icon-class',
              }}
              onClick={() => {
                alert(123);
              }}
              style={{padding: 0, border: 0, height: '100%', marginRight: '1rem'}}
            />
            <Button
              text="Primary Button"
              tipShow="overflow"
              tipData={"Hello React"}
              status="primary"
              rightIcon={create_default}
              style={iconButtonStyle}
            />
            <Button
              text="Default Button"
              tipShow="overflow"
              leftIcon={create_default}
              style={iconButtonStyle}
            />
            <Button
              text="Risk Button"
              tipShow="overflow"
              tipData={"Hello React"}
              status="risk"
              style={iconButtonStyle}
              leftIcon={delete_disabled}
            />
          </div>
        </div>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<IconButtonStyle />, mountNode);
```
