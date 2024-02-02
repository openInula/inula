---
order: 6
title:
  zh-CN: 自动聚焦
  en-US: Button Style with Title
---

## zh-CN

`focused`属性可以让页面渲染完成后进行自动聚焦到按钮上

## en-US

```jsx
import Button from "eview-ui/Button";
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class IconButtonStyle extends React.Component {
  render() {
    const [version, theme] = getDemoVersion();
    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <Button text="自动聚焦按钮" focused={true}/>;
      </ConfigProvider>
    )
  }
}

ReactDOM.render(<IconButtonStyle />, mountNode);
```
