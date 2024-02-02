---
order: 0
title:
  zh-CN: 基本属性设置
  en-US: Basic Setting
---

## zh-CN



## en-US



```jsx
import Select from 'eview-ui/Select';
import navForm from "@images/nav_form";
import navFormActive from "@images/nav_form_active";
import navMsg from "@images/nav_msg";
import navMsgActive from "@images/nav_msg_active";
import navHeart from "@images/nav_heart";
import navHeartActive from "@images/nav_heart_active";
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';
export default class SelectExample extends React.Component {

    render() {
        let compStyle = { marginRight: "40px", marginLeft: "20px" };
        let style = { width: '250px' }
        let labelStyle = { display: "block", paddingLeft: "0px" };

        let options = [{ text: "China is big country", value: 1 },
                    { text: "UK is small country", value: 2 },
                    { text: "USA", value: 3 },
                    { text: "USAB", value: 4 },
                    { text: "USAC", value: 5 },
                    { text: "USAD", value: 6 },
                    { text: "USAE", value: 7 },
                    { text: "USAF", value: 8 },
                    { text: "USAG", value: 9 }];

        let optionsWithIcon = [{ text: "Create", value: 1, icon: navForm, iconActive: navFormActive },
                               { text: "Export", value: 2, icon: navMsg, iconActive: navMsgActive },
                               { text: "Delete", value: 3, icon: navHeart, iconActive: navHeartActive }];

        let options1 = [{ text: "Beijing", value: 1 },
                        { text: "London", value: 2 },
                        { text: "Washington DC", value: 3 }];

        let options2 = [{ text: "Label 1:", value: 1, label: true },
                        { text: "A quick brown fox jumps over the white lazy dog", value: 2 },
                        { text: "China", value: 3},
                        { text: "USA", value: 4 },
                        { text: "Label 2:", value: 5, label: true },
                        { text: "USAB", value: 6 },
                        { text: "USAC", value: 7 },
                        { text: "USAD", value: 8 },
                        { text: "USAE", value: 9 }];

        let options3 = [{ text: "China is big country", value: 1 },
                        { text: "UK is small country", value: 2 },
                        { text: "USA", value: 3 },
                        { text: "USAB", value: 4 },
                        { text: "USAC", value: 5 },
                        { text: "USAD", value: 6 },
                        { text: "USAE", value: 7 },
                        { text: "USAF", value: 8 },
                        { text: "USAG", value: 9 },
                        { text: "...", value: 10 ,tipData: 'options' }];

        let options4 = [{ text: "China is big country", value: 1 ,disabled:true },
                        { text: "UK is small country", value: 2 ,disabled:true},
                        { text: "USA", value: 3 , disabled:true},
                        { text: "USAB", value: 4 ,disabled:true},
                        { text: "USAC", value: 5 ,disabled:true },
                        { text: "USAD", value: 6 ,disabled:true},
                        { text: "USAE", value: 7 ,disabled:true},
                        { text: "USAF", value: 8 ,disabled:true},
                        { text: "USAG", value: 9 ,disabled:true}];

        let options5 = [{ text: "China is big country", value: 1 ,disabled:true },
                        { text: "UK is small country", value: 2 ,disabled:true},
                        { text: "Label 1:", value: 3 , label: true, disabled:true},
                        { text: "USAB", value: 4 ,disabled:true},
                        { text: "USAC", value: 5 ,disabled:true },
                        { text: "USAD", value: 6 ,disabled:true},
                        { text: "Label 2:", value: 7 ,label: true ,disabled:true},
                        { text: "USAF", value: 8 ,disabled:true},
                        { text: "USAG", value: 9 ,disabled:true}];
      const [version, theme] = getDemoVersion();
        return (
          // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
          <ConfigProvider version={version} theme={theme}>
            <div id="evu_Select_example" >
              <div>
                <Select options={options}  label="Default style" required={true} labelStyle={labelStyle} defaultLabel="请选择国家" style={compStyle} />
                <Select options={options} label="Popup Up" required={true} labelStyle={labelStyle} selectedIndex={3} style={compStyle} popupDirection="top" isScrollAlwaysDisplay={true}/>
                <Select options={optionsWithIcon} label="With Icon" labelStyle={labelStyle} style={compStyle} />
                <br /><br />
                <Select options={options1} label="Disabled style" popupDirection="top" labelStyle={labelStyle} value={1} disabled={true} style={compStyle} />
                <Select options={options2} label="Default style with Width and scrollbar" required={true} selectStyle={style} labelStyle={labelStyle} style={compStyle}
                        optionStyle={{ width: '250px' }} //for setting the width of the popup window
                        enablHorzScroll={true} //enabling the horizontal scroll for the popup window
                />
                <Select options={options3}  label="Default style with moreOptions"  labelStyle={labelStyle} style={compStyle} />
                <br /><br />
              </div>
              <div>
                <div style={{ color:"#999999",marginLeft: "20px" , marginBottom:"20px"}}>All Disable item Options </div>
                <Select options={options4} selectedIndex={3} style={compStyle} />
                <Select options={options5} style={compStyle} />
              </div>
            </div>
          </ConfigProvider>

        )
    }
}

ReactDOM.render(<SelectExample />, mountNode);

```
