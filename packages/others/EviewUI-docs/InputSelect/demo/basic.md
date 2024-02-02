---
order: 0
title:
  zh-CN: 基本属性设置
  en-US: Basic Setting
---

## zh-CN



## en-US



```jsx
import InputSelect from 'eview-ui/InputSelect';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class InputSelectExample extends React.Component {

  render() {
    const [version, theme] = getDemoVersion();
    let style = { marginRight: "30px", marginLeft: "5px" }
    let labelStyle = { display: "block", paddingLeft: "0px" };
    let options = [{ text: "China is very very big country", value: 1 }, { text: "UK is small country & in Europe", value: 2 }, { text: "USA", value: 3 }, { text: "USAB", value: 4 }, { text: "USAC", value: 5 }, { text: "USAD", value: 6 }, { text: "USAE", value: 7 }, { text: "USAF", value: 8 }, { text: "USAG", value: 9 }];
    let options1 = [{ text: "BeiJIng", value: 1 }, { text: "UK", value: 2 }, { text: "USA hjnm ghyh ", value: 3 }];
    let options2 = [{ text: "China", value: 1 }, { text: "A quick brown fox jumps over the white lazy dog", value: 2 }, { text: "USA", value: 3 }, { text: "USAB", value: 4 }, { text: "USAC", value: 5 }, { text: "USAD", value: 6 }, { text: "USAE", value: 7 }, { text: "USAF", value: 8 }, { text: "USAG", value: 9 }];

    return (
      // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
      <ConfigProvider version={version} theme={theme}>
        <div id="evu_InputSelect_example" style={{ marginLeft: "20px" }}>
            <InputSelect options={options} label="Default style" labelStyle={labelStyle} selectStyle={{width: '150px'}} selectedIndex={0} style={style}/>
            <InputSelect options={options1}   label="Disabled style" labelStyle={labelStyle} value={1} disabled={true} />
            <InputSelect options={options2} label="Default with Width and Scrollbar" labelStyle={labelStyle} selectedIndex={0} style={style}  optionStyle={{width: '300px'}} enablHorzScroll={true} maxLength={15}/>
        </div>
      </ConfigProvider>
    )
  }
}

ReactDOM.render(<InputSelectExample />, mountNode);

```
