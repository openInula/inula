---
order: 2
title:
  zh-CN: 按钮尺寸
  en-US: Button Style with Title
---

## zh-CN

按钮有大、默认两种尺寸。
通过设置 `size` 为 `large` `default` 分别把按钮设为大、默认尺寸。

## en-US

```jsx
import Button from "eview-ui/Button";
import LabelField from "eview-ui/LabelField";
import Radio from "eview-ui/Radio";
import create_default from "@images/create_default";
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class IconButtonStyle extends React.Component {
  state = {
    size: "default"
  };
  render() {
    const [version, theme] = getDemoVersion();
    const { size } = this.state;
    const btnStyle = {
      marginRight: "1rem",
      marginTop: "0.5rem",
     };
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div id="evu_button_example">
          <div style={{marginBottom: "1rem", display: "flex"}}>
            <LabelField text="尺寸:"/>
            <Radio
              value="large"
              label="large"
              checked={size === "large"}
              onChange={value => this.setState({size: value})}
              style={{marginRight: "0.5rem"}}
            />
            <Radio
              value="default"
              label="default"
              checked={size === "default"}
              onChange={value => this.setState({size: value})}
            />
          </div>
          <div>
            <Button
              text="Primary Button"
              status="primary"
              size={size}
              style={btnStyle}
            />
            <Button
              text="Default Button"
              tipShow="overflow"
              size={size}
              style={btnStyle}
            />
            <Button text="Risk Button" status="risk" size={size} style={btnStyle}/>
            <Button
              text="Default Button"
              leftIcon={create_default}
              size={size}
              style={btnStyle}
            />
          </div>
        </div>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<IconButtonStyle />, mountNode);
```
