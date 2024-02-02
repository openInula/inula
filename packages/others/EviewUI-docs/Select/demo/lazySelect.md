---
order: 2
title:
  zh-CN: 懒加载选择
  en-US: Lazy Select
---

## zh-CN



## en-US



```jsx
import Select from 'eview-ui/Select';
import ConfigProvider from 'eview-ui/ConfigProvider';
import { getDemoVersion } from 'eview-ui/ThemeProvider';

export default class LazySelectExample extends React.Component {

    handleLoadOptions = (index) => {
        console.log("handleLoadOptions index: ", index);
        const newOptions = OPTIONS_DB.slice(index, index + 10);
        this.setState(() => ({
            options: newOptions,
        }));
        return 20;
    }

    state = {
        lazyOptions: { totalRecords: 119, onLoadRecords: this.handleLoadOptions },
        options: OPTIONS_DB.slice(0, 10),
    };

    render() {
        console.log("lazyOptions : ", this.state.lazyOptions);
        const [version, theme] = getDemoVersion();
        return (
          // 【重要】业务中使用当前组件不需要添加引用ConfigProvider组件的代码（ConfigProvider是全局组件,当前demo引用ConfigProvider仅用作ICT 3.0 组件样式演示使用）
          <ConfigProvider version={version} theme={theme}>
            <div id="evu_Select_example" >
              <Select
                options={this.state.options}
                label="Lazy Select"
                selectedIndex={0}
                lazySearch={this.state.lazyOptions}
              />
            </div>
          </ConfigProvider>
        )
    }
}

const OPTIONS_DB = [
    { text: "Afghanistan", value: 1 },
    { text: "Albania", value: 2 },
    { text: "Algeria", value: 3 },
    { text: "Andorra", value: 4 },
    { text: "Angola", value: 5 },
    { text: "Anguilla", value: 6 },
    { text: "Antigua & Barbuda", value: 7 },
    { text: "Argentina", value: 8 },
    { text: "Armenia", value: 9 },
    { text: "Australia", value: 10 },
    { text: "Austria", value: 11 },
    { text: "Azerbaijan", value: 12 },
    { text: "Bahamas", value: 13 },
    { text: "Bahrain", value: 14 },
    { text: "Bangladesh", value: 15 },
    { text: "Barbados", value: 16 },
    { text: "Belarus", value: 17 },
    { text: "Belgium", value: 18 },
    { text: "Belize", value: 19 },
    { text: "Benin", value: 20 },
    { text: "Bermuda", value: 21 },
    { text: "Bhutan", value: 22 },
    { text: "Bolivia", value: 23 },
    { text: "Bosnia & Herzegovina", value: 24 },
    { text: "Botswana", value: 25 },
    { text: "Brazil", value: 26 },
    { text: "Brunei Darussalam", value: 27 },
    { text: "Bulgaria", value: 28 },
    { text: "Burkina Faso", value: 29 },
    { text: "Myanmar/Burma", value: 30 },
    { text: "Burundi", value: 31 },
    { text: "Cambodia", value: 32 },
    { text: "Cameroon", value: 33 },
    { text: "Canada", value: 34 },
    { text: "Cape Verde", value: 35 },
    { text: "Cayman Islands", value: 36 },
    { text: "Central African Republic", value: 37 },
    { text: "Chad", value: 38 },
    { text: "Chile", value: 39 },
    { text: "China", value: 40 },
    { text: "Colombia", value: 41 },
    { text: "Comoros", value: 42 },
    { text: "Congo", value: 43 },
    { text: "Costa Rica", value: 44 },
    { text: "Croatia", value: 45 },
    { text: "Cuba", value: 46 },
    { text: "Cyprus", value: 47 },
    { text: "Czech Republic", value: 48 },
    { text: "Democratic Republic of the Congo", value: 49 },
    { text: "Denmark", value: 50 },
    { text: "Djibouti", value: 51 },
    { text: "Dominican Republic", value: 52 },
    { text: "Dominica", value: 53 },
    { text: "Ecuador", value: 54 },
    { text: "Egypt", value: 55 },
    { text: "El Salvador", value: 56 },
    { text: "Equatorial Guinea", value: 57 },
    { text: "Eritrea", value: 58 },
    { text: "Estonia", value: 59 },
    { text: "Ethiopia", value: 60 },
    { text: "Fiji", value: 61 },
    { text: "Finland", value: 62 },
    { text: "France", value: 63 },
    { text: "French Guiana", value: 64 },
    { text: "Gabon", value: 65 },
    { text: "Gambia", value: 66 },
    { text: "Georgia", value: 67 },
    { text: "Germany", value: 68 },
    { text: "Ghana", value: 69 },
    { text: "Great Britain", value: 70 },
    { text: "Greece", value: 71 },
    { text: "Grenada", value: 72 },
    { text: "Guadeloupe", value: 73 },
    { text: "Guatemala", value: 74 },
    { text: "Guinea", value: 75 },
    { text: "Guinea-Bissau", value: 76 },
    { text: "Guyana", value: 77 },
    { text: "Haiti", value: 78 },
    { text: "Honduras", value: 79 },
    { text: "Hungary", value: 80 },
    { text: "Iceland", value: 81 },
    { text: "India", value: 82 },
    { text: "Indonesia", value: 83 },
    { text: "Iran", value: 84 },
    { text: "Iraq", value: 85 },
    { text: "Israel and the Occupied Territories", value: 86 },
    { text: "Italy", value: 87 },
    { text: "Ivory Coast (Cote d'Ivoire)", value: 88 },
    { text: "Jamaica", value: 89 },
    { text: "Japan", value: 90 },
    { text: "Jordan", value: 91 },
    { text: "Kazakhstan", value: 92 },
    { text: "Kenya", value: 93 },
    { text: "Kosovo", value: 94 },
    { text: "Kuwait", value: 95 },
    { text: "Kyrgyz Republic (Kyrgyzstan)", value: 96 },
    { text: "Laos", value: 97 },
    { text: "Latvia", value: 98 },
    { text: "Lebanon", value: 99 },
    { text: "Lesotho", value: 100 },
    { text: "Liberia", value: 101 },
    { text: "Libya", value: 102 },
    { text: "Liechtenstein", value: 103 },
    { text: "Lithuania", value: 104 },
    { text: "Luxembourg", value: 105 },
    { text: "Republic of Macedonia", value: 106 },
    { text: "Madagascar", value: 107 },
    { text: "Malawi", value: 108 },
    { text: "Malaysia", value: 109 },
    { text: "Maldives", value: 110 },
    { text: "Mali", value: 111 },
    { text: "Malta", value: 112 },
    { text: "Martinique", value: 113 },
    { text: "Mauritania", value: 114 },
    { text: "Mauritius", value: 115 },
    { text: "Mayotte", value: 116 },
    { text: "Mexico", value: 117 },
    { text: "Moldova", value: 118 },
    { text: "Mongolia", value: 119 },

];

ReactDOM.render(<LazySelectExample />, mountNode);

```
