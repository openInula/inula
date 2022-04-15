## 文件清单说明：
devtools_page: devtool主页面
default_popup: 拓展图标点击时弹窗页面
content_scripts: 内容脚本，在项目中负责在页面初始化时调用注入全局变量代码和消息传递

## 打开 panel 页面调试面板的方式

1. Open the developer tools.
1. Undock the developer tools if not already done (via the button in the bottom-left corner).
1. Press Ctrl + Shift + J to open the developer tools of the developer tools.
Optional: Feel free to dock the developer tools again if you had undocked it at step 2.
1. Switch from "<top frame>" to devtoolsBackground.html (or whatever name you have chosen for your devtools). (example)
1. Now you can use the Console tab to play with the chrome.devtools API.

## 全局变量注入
通过content_scripts在document初始化时给页面添加script脚本，在新添加的脚本中给window注入全局变量

## horizon页面判断
在页面完成渲染后往全局变量中添加信息，并传递 tabId 给 background 告知这是 horizon 页面

## 通信方式：
```mermaid
sequenceDiagram
    participant web_page
    participant script_content
    participant background
    participant panel

    Note over web_page: window.postMessage
    web_page ->> script_content : {}
    Note over script_content: window.addEventListener
    Note over script_content: chrome.runtime.sendMessage
    script_content ->> background : {}
    Note over background: chrome.runtime.onMessage
    Note over background: port.postMessage
    background ->> panel : {}
    Note over panel: connection.onMessage.addListener
    Note over panel: connection.postMessage
    panel ->> background : {}
    Note over background: port.onMessage.addListener
    Note over background: chrome.tabs.sendMessage
    background ->> script_content : {}
    Note over script_content: chrome.runtime.onMessage
    Note over script_content: window.postMessage
    script_content ->> web_page : {}
    Note over web_page: window.addEventListener
```

## 数据压缩
渲染组件树需要知道组件名和层次信息，如果把整个vNode树传递过来，传递对象太大，最好将数据进行压缩然后传递。
- 相同的组件名可以进行压缩
- 每个vNode有唯一的 path 属性，可以作为标识使用
- 通过解析 path 值可以分析出组件树的结构

## 组件props/state/hook等数据的传输和解析
将数据格式进行转换后进行传递。对于 props 和 类组件的 state，他们都是对象，可以将对象进行解析然后以 k-v 的形式，树的结构显示。函数组件的 Hooks 是以数组的形式存储在 vNode 的属性中的，每个 hook 的唯一标识符是 hIndex 属性值，在对象展示的时候不能展示该属性值，需要根据 hook 类型展示一个 state/ref/effect 等值。hook 中存储的值也可能不是对象，只是一个简单的字符串，他们的解析和 props/state 的解析同样存在差异。


## 滚动动态渲染 Tree
考虑到组件树可能很大，所以并不适合一次性全部渲染出来，可以通过滚动渲染的方式减少页面 dom 的数量。我们可以把树看成有不同缩进长度的列表，动态渲染滚动列表的实现可以参考谷歌的这篇文章：https://developers.google.com/web/updates/2016/07/infinite-scroller 这样，我们需要的组件树数据可以由树结构转变为数组，可以减少动态渲染时对树结构进行解析时的计算工作。

## 测试框架
jest测试框架不提供浏览器插件的相关 api，我们在封装好相关 api 后需要模拟这些 api 的行为从而展开测试工作。
