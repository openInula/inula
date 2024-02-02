---
order: 0
title:
  zh-CN: 按钮类型
  en-US: Basic Settings
---

## zh-CN

按钮有三种类型：主按钮`primary`、次按钮`default`、危险按钮`risk`

## en-US

Text Button


```jsx
import { Button } from 'eview-ui';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';


export default class ButtonExample extends React.Component {
  render() {
    const [version, theme] = getDemoVersion();

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div>
          <Button text="Primary Button" status="primary" style={{marginRight: "16px"}}/>
          <Button text="Default Button" tipShow='overflow' style={{marginRight: "16px"}}/>
          <Button text="Risk Button" status="risk"/>
        </div>
      </ConfigProvider>
    );
  }
}
ReactDOM.render(<ButtonExample />, mountNode);
```
