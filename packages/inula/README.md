# 欢迎使用 InulaJS!

## 项目介绍：

InulaJS 是用于构建用户界面的Javascript库，与React保持一致API的特性，
同时可以无缝兼容到React的相关生态（react-redux、react-router、react-intl、axios等）。
InulaJS 提供响应式API、相比virtual dom方式，提升渲染效率30%以上。
提供5大常用核心组件：状态管理器、路由、国际化、请求组件、应用脚手架，帮助开发者高效、高质量的构筑基于 InulaJS 的前端产品。

## 安装指南

欢迎使用响应式前端框架 InulaJS！本指南将为您提供详细的安装步骤，以便您可以开始在前端项目中使用该框架。

### 步骤1：安装InulaJS

您可以通过以下几种方式安装InulaJS

#### 使用npm安装

首先，确保您已经安装了 Node.js。你可以在终端中运行以下命令来检查是否已经安装：

```shell
node -v
```

如果成功显示 Node.js 的版本号，则说明已经安装。

在命令行中运行以下命令来通过npm安装 InulaJS：

```shell
npm install inulaJS
```

#### 使用yarn安装

首先，确保您已经安装了 Node.js。具体操作可参考使用 npm 安装第一步

借来确保您已经安装了 yarn，您可以通过以下命令来安装 Yarn（全局安装）：

```shell
npm install -g yarn
```

安装完成后，你可以在终端中运行以下命令来验证 yarn 是否成功安装：

```shell
yarn --version
```

如果成功显示 yarn 的版本号，则说明安装成功。

最后，在命令行中运行以下命令来通过yarn安装InulaJS：

```shell
yarn add inulaJS
```

注意：yarn 和 npm 是两个独立的包管理器，您可以根据自己的喜好选择使用哪个。它们可以在同一个项目中共存，但建议在一个项目中只使用其中一个来管理依赖。

### 步骤2：开始使用InulaJS

恭喜！您已经成功安装了InulaJS。现在您可以根据您的项目需求自由使用InulaJS提供的组件和功能。

请查阅InulaJS的用户使用指南文档以了解更多关于如何使用和配置框架的详细信息。

## 用户使用指南

### 创建应用

#### 渲染入口

InulaJS提供一个render方法，将InulaJS根组件绑定到DOM节点进行渲染：

```JavaScript
import Inula from 'inulaJS';
import App from './components/App';

Inula.render(<App />, document.querySelector('#root'));
```

#### 根组件

InulaJS应用通常是一颗嵌套的、可重用的组件树组成。这里我们示例中根组件没有嵌套子组件，仅作为简单应用展示

```JavaScript
import Inula from 'inulaJS';
import Box from './Box';
const App = () => {
    return <p>Hello world!</p>;
};

export default App;
```

### jsx语法

#### 基本语法

jsx写法上和HTML类似，但是比HTML更加严格，标签必须闭合。组件返回的jsx标签必须包含在一个标签内。jsx中常量"greet"可以直接用双引号包裹赋值给className属性， style属性值则需要{{}}包裹，style属性名采用驼峰风格。

```JavaScript
<div className="greet" style={{ fontSize: '16px'}}>
  <p>你好</p>
</div>
```

#### 变量绑定

在jsx中，给一个属性绑定变量需要用{}包裹。将user的class和name字段绑定到dom节点上，如下所示

```JavaScript
<div className={ user.class } style={{ fontSize: '16px'}}>
  <p>{ user.name }</p>
</div>
```

#### 事件绑定

在jsx中，事件绑定需要在事件名前加'on‘，事件名采用驼峰风格，如onMouseMove。onClick事件绑定如下所示

```JavaScript
<button onClick={(e)=>{console.log('click')}}></button>
```

#### 在JSX中使用JavaScript

在 JSX 中，可以使用大括号 `{}` 来嵌入 JavaScript 表达式和代码。这允许我们在 JSX 中使用变量、函数调用、条件语句等 JavaScript 功能，以便动态地生成和渲染组件。

```jsx
const Greeting = () => {
  const name = '小明';
  const age = 18;
  const isLoggedIn = true;

  const getGreeting = (name) => {
    return `你好, ${name}!`;
  };

  return (
    <div>
      <h1>{getGreeting(name)}</h1>
      {
        if (isLoggedIn) {
          return <p>欢迎你, {name}! 你的年龄是 {age} 岁</p>;
        } else {
          return <p>请登陆后查看信息</p>;
    }}
    </div>
  );
};
```

#### map、&&、||在InulaJS中的使用

`map`、`&&` 和 `||` 是常用的 JavaScript 操作符和方法，它们也可以在 InulaJS组件中使用。下面是它们的使用方式：

**map**:`map` 是 JavaScript 中数组的原生方法，用于遍历数组并返回一个新的数组。在 InulaJS中，可以使用 `map` 来遍历数组并渲染多个组件或元素。通过 `map`，可以根据数组的每个元素生成相应的组件或元素，并将它们放置在 JSX 中。以下是在 InulaJS中使用 `map` 的简单示例：

```jsx
const numbers = [1, 2, 3, 4, 5];

const NumberList = () => {
  return (
    <ul>
      {numbers.map(number => (
        <li key={number}>{number}</li>
      ))}
    </ul>
  );
};
```

**&&**：`&&` 是 JavaScript 中的逻辑与操作符。在 InulaJS中，我们可以使用 `&&` 来进行条件渲染，即根据某个条件决定是否渲染某个组件或元素。以下是在 InulaJS中使用 `&&` 进行条件渲染的示例：

```jsx
const ShowExample = ({ isShow }) => {
  return <div>{isShow && <p>这是一个简单示例</p>}</div>;
};
```

在上述示例中，如果 `isShow` 属性的值为 `true`，则渲染 `<p>` 元素，否则不进行渲染。

**||**:`||` 是 JavaScript 中的逻辑或操作符。在 InulaJS中，我们可以使用 `||` 进行条件渲染或提供默认值。以下是在 InulaJS中使用 `||` 进行条件渲染或提供默认值的示例：

```jsx
const Greeting = ({ name }) => {
  return (
    <div>
      <p>Hello, {name || '小明'}!</p>
    </div>
  );
};
```

在上述示例中，如果 `name` 属性存在，则渲染 `name` 的值，否则渲染默认值 `'小明'`。

### 组件

InulaJS界面开发都是以组件为基础的。组件可以将界面分为若干独立的，可重用的部分。组件通过嵌套、排列组成一颗组件树，将内部逻辑进行隔离。InulaJS可以支持函数式组件和class组件，这里不再对class组件进行介绍。

#### props

InulaJS函数式组件是一种使用函数来定义的组件形式。函数式组件相对于传统的类组件更简洁和直观，它不依赖于类和组件状态，而是通过接收 props 参数并返回 JSX 元素来描述组件的外观和行为。 在`||`逻辑运算符的使用示例中 ，`Greeting`即为一个简单的函数式组件，通过函数传入的参数接收了props中的name属性，并在JSX标签中使用。

#### hooks

Hooks允许我们在函数式组件中使用状态（state）和其他 InulaJS特性，如生命周期方法和上下文（context），而无需使用类组件。通过 Hooks，我们可以在函数式组件中编写更具可读性和可维护性的代码，使组件逻辑更加灵活和可复用。

**useState** ：

`useState` 是最常用的 Hook，它允许在函数式组件中添加状态管理。通过 `useState`，我们可以声明一个状态变量，并返回一个包含当前状态和更新状态的数组。以下是useState的使用示例：

```jsx
const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
};
```

在上面的Counter组件示例中，声明了一个名为 `count` 的状态变量，并通过 `setCount` 函数更新它。每次点击按钮时，调用 `increment` 函数会将 `count` 的值加一。

**useEffect** ：

`useEffect` 允许在函数式组件中执行副作用操作，如数据订阅、DOM 操作、网络请求等。它接收一个副作用函数和一个依赖数组，并在组件渲染完成后执行副作用函数。以下是`useEffect` 的使用示例：

```jsx
const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('组件已经被渲染');
    return () => {
      console.log('组件已经被卸载');
    };
  }, []);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
};
```

在上面示例中，我们使用 `useEffect` 声明了一个副作用函数，在组件渲染完成后执行。`console.log` 语句会打印出组件渲染和组件卸载的消息。通过传递一个空数组作为依赖项，确保副作用函数只在组件挂载时执行一次。

**useContext** ：

`useContext` 允许在函数式组件中访问 InulaJS上下文。它接收一个上下文对象并返回当前上下文的值。以下是`useContext` 的使用示例：

```jsx
const ThemeContext = InulaJS.createContext('亮色主题');

const ThemeDisplay = () => {
  const theme = useContext(ThemeContext);

  return <p>当前主题: {theme}</p>;
};
```

在上面示例中，创建了一个上下文对象 `ThemeContext`，并在 `ThemeDisplay` 组件中使用了 `useContext`拿到当前上下文的主题值。

**useReducer** ：

`useReducer` 允许在函数式组件中使用复杂的状态逻辑。它接收一个状态管理函数和初始状态，并返回当前状态和派发动作的函数。以下是`useReducer` 的使用示例：

```jsx
const initialState = { count: 0 };

const reducer = (state, action) => {
  switch (action.type) {
    case '增加':
      return { count: state.count + 1 };
    case '减少':
      return { count: state.count - 1 };
    default:
      return state;
  }
};

const Counter = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const increment = () => {
    dispatch({ type: '增加' });
  };

  const decrement = () => {
    dispatch({ type: '减少' });
  };

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
};
```

在上面示例中，定义了一个状态管理函数 `reducer` 和初始状态 `initialState`。`useReducer` 返回当前状态和派发动作的函数，可以通过调用派发函数来更新状态。每次点击增加或减少按钮时，派发相应的动作，更新 `count` 的值。

**useRef** ：

`useRef` 允许在函数式组件中创建可变的引用。它返回一个可变的 ref 对象，可以在组件的整个生命周期内存储和访问值。以下是`useRef` 的使用示例：

```jsx
const TextInput = () => {
  const inputRef = useRef();

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
};
```

在上面示例中，创建了一个 `inputRef` 引用，并将其赋值给文本输入框的 `ref` 属性。在 `focusInput` 函数中，通过 `inputRef.current` 可以访问文本输入框的 DOM 节点。点击按钮时，调用 `focusInput` 函数会使文本输入框获取焦点。

### 响应式（规划）

## React项目迁移

### 场景一：项目不打包React

该情况是指项目没有将React源码打包，默认使用externals方式的配置 ，在该场景下可以通过如下步骤将React项目迁移至InulaJS：

**1、修改webpack配置文件中`externals`，名称修改为`inulajs`，如下：**

```js
	externals: {
	  react: 'inulajs',  // React 修改成 inulajs
	  'react-dom': 'inulajs', // ReactDOM 修改成 inulajs
	},
```

**2、修改.babelrc或webpack配置文件中`babel-loader`配置（解决编译后文件存留React.createElement的问题），如：**

如果你使用的是 `@babel/preset-react`，请确保版本号大于 `7.9.0`

```js
{
    "presets": [
        "@babel/preset-react"
    ]
}
```

修改为：

```js
{
    "presets": [
        [
            "@babel/preset-react",
            {
                "runtime": "automatic", // 新增
	            "importSource": "inulaJS" // 新增
	        }
        ]
    ]
}
```

如果你使用的是 `@babel/plugin-transform-react-jsx`，请确保版本号大于 `7.9.0`

```js
{
  "plugins": [
    "@babel/plugin-transform-react-jsx"
  ]
}
```

修改为：

```js
{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic", // 新增
        "importSource": "inulaJS" // 新增
      }
    ]
  ]
}
```

注意：**.babelrc** 和 **webpack配置文件** 不要重复配置。

**3、删除webpack配置文件中的`cacheDirectory: true`，因为缓存可能会导致修改不生效，如：（原本用到才需修改）**

```js
{
  test: /\.(js|jsx)$/,
  use: {
    loader: 'babel-loader',
    query: {
      cacheDirectory: true, // 删除这一句，否则由于缓存可能会导致修改不生效
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-syntax-dynamic-import'],
      ...
```

**4、在package.json中增加`"inulaJS": "0.0.x"`**

### 场景二：项目会打包React

该情况是指项目会将React源码打包，在该场景下可以通过如下步骤将React项目迁移至InulaJS：

**1、修改webpack配置文件中`alias`，新增react、react-dom别名，如下：**

```js
alias: {
  // 省略其它...
  'react': 'inulaJS', // 新增
  'react-dom': 'inulaJS', // 新增
}
```

**2、在package.json中增加`"inulaJS": "0.0.x"`**

## 贡献指南

本指南会指导你如何为InulaJS贡献自己的一份力量，请你在提出issue或pull request前花费几分钟来了解InulaJS社区的贡献指南。

### 行为准则

我们有一份**行为准则**，希望所有的贡献者都能遵守，请花时间阅读一遍全文以确保你能明白哪些是可以做的，哪些是不可以做的。

#### 我们的承诺

身为社区成员、贡献者和领袖，我们承诺使社区参与者不受骚扰，无论其年龄、体型、可见或不可见的缺陷、族裔、性征、性别认同和表达、经验水平、教育程度、社会与经济地位、国籍、相貌、种族、种姓、肤色、宗教信仰、性倾向或性取向如何。

我们承诺以有助于建立开放、友善、多样化、包容、健康社区的方式行事和互动。

#### 我们的准则

**有助于为我们的社区创造积极环境的行为例子包括但不限于：**

- 表现出对他人的同情和善意
- 尊重不同的主张、观点和感受
- 提出和大方接受建设性意见
- 承担责任并向受我们错误影响的人道歉
- 注重社区共同诉求，而非个人得失

**不当行为例子包括：**

- 使用情色化的语言或图像，及性引诱或挑逗
- 嘲弄、侮辱或诋毁性评论，以及人身或政治攻击
- 公开或私下的骚扰行为
- 未经他人明确许可，公布他人的私人信息，如物理或电子邮件地址
- 其他有理由认定为违反职业操守的不当行为

#### 责任和权力

社区领袖有责任解释和落实我们所认可的行为准则，并妥善公正地对他们认为不当、威胁、冒犯或有害的任何行为采取纠正措施。

社区领导有权力和责任删除、编辑或拒绝或拒绝与本行为准则不相符的评论（comment）、提交（commits）、代码、维基（wiki）编辑、议题（issues）或其他贡献，并在适当时机知采取措施的理由。

#### 适用范围

本行为准则适用于所有社区场合，也适用于在公共场所代表社区时的个人。

代表社区的情形包括使用官方电子邮件地址、通过官方社交媒体帐户发帖或在线上或线下活动中担任指定代表。

#### 监督

辱骂、骚扰或其他不可接受的行为可通过 XX@XXX.com 向负责监督的社区领袖报告。 所有投诉都将得到及时和公平的审查和调查。

所有社区领袖都有义务尊重任何事件报告者的隐私和安全。

#### 参见

本行为准则改编自 Contributor Covenant 2.1 版, 参见 https://www.contributor-covenant.org/version/2/1/code_of_conduct.html。

### 公正透明的开发流程

我们所有的工作都会放在 [Gitee](https://www.gitee.com) 上。不管是核心团队的成员还是外部贡献者的 pull request 都需要经过同样流程的 review。

### 分支管理

InulaJS长期维护XX分支。如果你要修复一个Bug或增加一个新的功能，那么请Pull Request到XX分支上

### Bug提交

我们使用 Gitee Issues来进行Bug跟踪。在你发现Bug后，请通过我们提供的模板来提Issue，以便你发现的Bug能被快速解决。
在你报告一个 bug 之前，请先确保不和已有Issue重复以及查阅了我们的用户使用指南。

### 新增功能

如果你有帮助我们改进API或者新增功能的想法，我们同样推荐你使用我们提供Issue模板来新建一个添加新功能的 Issue。

### 第一次贡献

如果你还不清楚怎么在 Gitee 上提交 Pull Request，你可以通过[这篇文章](https://oschina.gitee.io/opensource-guide/guide/%E7%AC%AC%E4%B8%89%E9%83%A8%E5%88%86%EF%BC%9A%E5%B0%9D%E8%AF%95%E5%8F%82%E4%B8%8E%E5%BC%80%E6%BA%90/%E7%AC%AC%207%20%E5%B0%8F%E8%8A%82%EF%BC%9A%E6%8F%90%E4%BA%A4%E7%AC%AC%E4%B8%80%E4%B8%AA%20Pull%20Request/#%E4%BB%80%E4%B9%88%E6%98%AF-pull-request)学习

当你想开始处理一个 issue 时，先检查一下 issue 下面的留言，确保没有其他人正在处理。如果没有，你可以留言告知其他人你将处理这个 issue，避免重复劳动。

### 开发指南

InulaJS团队会关注所有Pull Request，我们会review以及合入你的代码，也有可能要求你做一些修改或者告诉你我们我们为什么不能接受你的修改。

在你发送 Pull Request 之前，请确认你是按照下面的步骤来做的：

1. 确保基于正确的分支进行修改，详细信息请参考[这里](#分支管理)。
2. 在项目根目录下运行了 `npm install`。
3. 如果你修复了一个 bug 或者新增了一个功能，请确保新增或完善了相应的测试，这很重要。
4. 确认所有的测试都是通过的 `npm run test`
5. 确保你的代码通过了 lint 检查 `npm run lint`.

#### 常用命令介绍

1. `npm run build` 同时构建InulaJS UMD的prod版本和dev版本
2. `build-types` 单独构建InulaJS的类型提示@types目录

#### 配套开发工具

- [InulaJS-devtool](https://www.XXXX.com)： 可视化InulaJS项目页面的vDom树

## 开源许可协议

请查阅 License 获取开源许可协议的更多信息.

版权说明：

InulaJS 前端框架，版权所有 © 2023-，InulaJS开发团队。保留一切权利。

除非另有明示，本网站上的内容采用以下许可证进行许可：Creative Commons Attribution 4.0 International License。

如需了解更多信息，请查看完整的许可证协议：https://creativecommons.org/licenses/by/4.0/legalcode
