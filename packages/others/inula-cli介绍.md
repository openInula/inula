
### 安装inula-cli

---

为了方便使用inula-cli的功能，推荐您全局安装inula-cli。Nodejs安装会自带npm工具用于管理模块，您可以直接运行如下命令：

>npm install -g inula-cli

## 二、目录结构

├── dist  
├── mock  
│   └── app.ts｜tsx  
├── src  
│   ├── layouts  
│   │   ├── BasicLayout.tsx  
│   │   ├── index.less  
│   ├── models  
│   │   ├── global.ts  
│   │   └── index.ts  
│   ├── pages  
│   │   ├── index.less  
│   │   └── index.tsx  
│   ├── utils // 推荐目录  
│   │   └── index.ts  
│   ├── services // 推荐目录  
│   │   └── api.ts  
│   ├── app.(ts|tsx)  
│   ├── global.ts  
│   ├── global.(css|less|sass|scss)  
│   ├── overrides.(css|less|sass|scss)  
│   ├── favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)  
│   └── loading.(tsx|jsx)  
├── .env  
├── plugin.ts  
├── .horizon.ts|js  
├── package.json  
├── tsconfig.json  
└── typings.d.ts

## 三、使用插件

插件机制的引入，可以让开发者轻松地实现对前端各类配置文件的修改，不必再去记忆各种各样繁琐地配置项，通过插件可以完成一键配置。

插件主要区分为两类：命令行插件以及功能插件。

命令行插件用于为inula-cli提供扩展命令，而功能插件可以按照特定的事件触发对应的回调函数以实现各类功能。

### 使用已有插件

---

1、使用内置插件。

内置插件在inula-cli运行时会自动加载，用户可以直接调用这些内置命令或内置功能，关于内置插件的详细功能及使用方法，请参考第十章节。

2、使用在线插件。

在线插件指由其他开发者开发并发布于npm仓库的插件。用户可以按需安装并运行这些插件。

安装可以通过npm安装，这里以插件@cloudsop/add为例

npm i --save-dev @cloudsop/add

如果需要运行插件，需要在配置文件中配置对应的插件路径
```js
// .horizon.ts  
export default {  
    ...  
    plugins:["@cloudsop/add"]  
}

```

node_modules中依赖的插件，可以只需要填写插件模块名，inula-cli会自动在node_modules里寻找模块并导入该模块。

### 开发自定义插件

---

以下以一个简单的自定义插件为例:

1、编写命令插件，这里我们自定义了一个conf命令用于展示当前项目的配置信息。

```js
// conf.ts  

export default (api: any) => {  
    api.registerCommand({  
        name: "conf",  
        description: "show user config",  
        fn: async function (args: any, config: any) {  
            api.applyHook("showConf");  
        }   
    })  
}

```


2、编写功能命令插件，

```js
// showConf.ts  
export default (api: any) => {  
    api.registerHook({  
        name: "showConf",  
        fn: async (args: any) => {  
            const config = api.userConfig;  
            console.log(config)  
        }  
    })  
}
```

3、在配置文件中加入对上述两个插件的引用

```js
// .inula.ts  
export default  {  
    enableMock: true,  
    mockPath: "./mock",  
    plugins: ["./conf", "./showConf"]  
}

```

4、在项目根目录下执行inula-cli conf即可触发插件运行。
```js
{  
  enableMock: true,  
  mockPath: './mock',  
  plugins: [ './conf', './showConf' ],  
}

```

## 四、Mock

Mock功能广泛应用于前端开发中，Mock能力可以模拟出后端服务的各种响应情况，比如成功、失败、超时等情况，以及不同的数据返回，从而帮助我们更好地进行前端开发和测试。 Mock功能可以使得前端开发人员可以独立进行开发和测试，不会受到后端开发的进度影响，从而提高开发效率。

### 如何使用Mock

---

inula-cli已经将Mock功能作为内置插件能力，当您无论使用webpack还是vite构建项目时都可以自动启用。如果您不想使用Mock功能，可以自行在配置文件中关闭。

如果您选择开启了Mock功能，当您在执行inula-cli dev时，本地调试时将触发接口Mock。

### Mock目录

---

inula-cli自动将项目根路径里/Mock目录下所有文件视为mock文件。例如：

```js
├── mock  
    ├── todos.ts  
    ├── items.ts  
    └── users.ts  
└── src  
    └── pages  
        └── index.tsx
```


如果您想修改Mock目录位置，可以在配置文件中修改mockPath。如果不配置该参数，默认使用"./mock"。
```js
// .inula.ts  
export default {  
    ...  
    enableMock: true,  
    mockPath："./mock",  
}

```

### Mock文件

---

由于实现方式不同，webpack和vite构建的项目在mock文件的格式也略有不同，这里将分开说明。

#### webpack

Mock文件需要默认导出一个对象，key为"请求方式 接口名"，值为接口实现。示例如下：
```js
export default {  
    "GET /api/user": (req, res) => {  
        res.status(200).json("admin")  
    }  
}
```


如果想要一次mock多个接口，可以在导出对象中设置多个key，例如：

```js
export default {  
    "GET /api/user": (req, res) => {  
        res.status(200).json("admin");  
    },  
    "GET /api/user/id/admin ": (req, res) => {  
        res.status(200).json(1);  
    },  
    ...  
}
```

关于接口实现中的req和res的API，可以参考express文档获取更多的信息。

#### Vite

---
Mock文件默认导出一个数组，数组每一个成员示例如下：

```js
export default [  
  {  
    url: '/api/get',  
    method: 'get',  
    response: ({ query }) => {  
      return {  
        code: 0,  
        data: {  
          name: 'vben',  
        },  
      }  
    },  
  },  
  {  
    url: '/api/post',  
    method: 'post',  
    timeout: 2000,  
    response: {  
      code: 0,  
      data: {  
        name: 'vben',  
      },  
    },  
  },  
  {  
    url: '/api/text',  
    method: 'post',  
    rawResponse: async (req, res) => {  
      let reqbody = ''  
      await new Promise((resolve) => {  
        req.on('data', (chunk) => {  
          reqbody += chunk  
        })  
        req.on('end', () => resolve(undefined))  
      })  
      res.setHeader('Content-Type', 'text/plain')  
      res.statusCode = 200  
      res.end(`hello, ${reqbody}`)  
    },  
  },  
]  

```

​

## 五、远程代理

远程代理是指将某个客户端请求代理到另一个服务器上，并返回该服务器的响应结果给客户端。在这个过程中，代理服务器会扮演一个中间人的角色，接收客户端请求并将其转发到目标服务器上，然后将响应结果返回给客户端。

远程代理也是开发测试过程中常用能力之一，尤其是在开发大型项目时，需要修改其中的一个或多个接口时，可以使用远程代理将需要修改的客户端接口重定向到本地修改后的文件，快速进行问题分析和修改验证。

inula-cli默认集成了远程代理功能。开发者可以通过配置快速使用。

### 如何使用远程代理能力

---

在框架配置文件中，开发者可以选择配置proxy字段。proxy示例如下：

```js
export default  {  
  ...  
  proxy: {  
    target:'https://xx.xx.xx.xx',  
    homepage: '/homepage',  
    localPort: 3001,  
    localStatic: [  
      {  
        url: '/api/index.js',  
        local: './dist/user.js',  
      },  
    ],  
    fowardingURL: ['/'],  
  },  
};  
```

其中，各字段含义如下：

|序号|字段名|描述|
|---|---|---|
|1、|protocol|协议名，支持http/https|
|2、|remoteHost|远端主机地址|
|3、|remotePort|远端主机端口|
|4、|homepage|首页URL|
|5、|localPort|本地代理端口|
|6、|localStatic|本地代理配置|
|7、|localStatic.url|转到到本地的URL|
|8、|localStatic.local|本地URL映射文件|
|9、|fowardingURL|转发到远端的URL|

配置完成后，直接运行inula-cli proxy，在本地浏览器输入[http://localhost:](http://localhost:){本地代理端口}即可访问。如果您没有配置本地代理端口，将默认使用3001作为本地端口。

## 六、环境变量

inula-cli支持开发者使用环境变量来定义一些配置。

### 环境变量配置方法

---

inula-cli默认将项目根路径下的.env文件视为环境变量配置文件。.env文件应遵循properties文件格式。

如果项目在本地开发时（NODE_ENV为development）需要做一些额外配置，支持同时配置.local.env文件，相同名称的环境变量会以.local.env中的生效。

### 环境变量支持选项

|序号|参数|描述|默认值|
|---|---|---|---|
|1、|PROJECT_NAME|项目名称|app|
|2、|WORKING_DIR|项目根路径|process.cwd()|
|5、|DEBUG|开启框架debug日志|false|
|6、|RUNNING_MODE|配置文件运行模式|none|

## 七、配置

inula-cli支持用户通过项目根目录下的.inula.ts或者.inula.js文件进行自定义配置。当两个文件同时存在时，会优先选取.horizon.ts作为项目配置。如果您对配置文件还需要额外定制，可以在环境变量中添加RUNNING_MODE字段，RUNNING_MODE允许额外再定制一份配置文件，例如RUNNING_MODE=cloud，inula-cli会寻找名称为.inula.cloud.ts/js的配置文件。

### 配置文件定义
---
在配置文件中，您需要默认导出一个配置，以下为一个简单的配置文件示例：
```js
// .inula.ts  
​  
export default {  
    enableMock: true  
}
```

对于TypeScript类型，我们也提供了类型定义以供开发时自动补全：


```js
// .inula.ts  
​  
import {defineConfig} from "inula-cli"  
​  
export default defineConfig({  
    enableMock: true  
})
```


### 配置文件参数

---

|序号|参数|描述|默认值|
|---|---|---|---|
|1、|enableMock|是否开启本地mock接口|true|
|2、|mockPath|本地Mock接口路径|"./mock"|
|3、|compileMode|构建方式|webpack|
|4、|buildConfigPath|构建配置文件|webpack.config.js|
|5、|plugins|需要开启的插件|[]|
|6、|proxy|远端代理配置|{}|
|7、|proxy.remoteHost|远端代理地址|""|
|8、|proxy.remoteHost|远端代理端口|""|
|9、|proxy.homepage|远端代理首页|""|
|10、|proxy.localPort|本地代理端口|3001|
|||||

## 八、脚手架

提供了create-horizon，可以快速搭建一个基于inula以及inula-cli的项目。

### 使用脚手架

---

脚手架可以通过npx命令快速安装并启动：

npx @cloudsop/create-horizon app

其中第二个参数app为项目名称，如果用户输入了这个参数，会在命令执行目录下新建一个目录，否则项目代码会平铺在当前目录。

## 九、开发插件

### 插件介绍
---
当我们设计和开发前端项目时，插件机制是一种非常有用的工具。插件是一些可以被动态添加或移除的代码模块，它们能够在不改变主要应用程序代码的情况下增强应用程序功能。 inula-cli中引入插件机制，可以更好地帮助您进行项目开发：

1、更简单，更快速地扩展应用能力。

2、动态修改模块，项目更易维护。

3、公共能力可复制，实现跨项目快速分享。

### 插件定义
---
inula-cli默认对外导出了插件对象的定义，您可以通过以下方式引用：
import { API } from "inula-cli"

### 插件属性

---

1、compileMode
构建工具类型，通过.env文件中的COMPILE_MODE字段设置，当前支持webpack以及vite两类，用户也可以自定义，默认值为webpack。

2、userConfig
用户配置，主要来源于用户配置文件。

3、buildConfig
构建配置，来源于用户构建配置文件。

4、logger
插件自带日志对象，提供{debug，info，warn，error}四个级别的日志输出。

5、ServiceStage
运行阶段

### 核心API
---
1、registerCommand
注册命令
```js
 api.registerCommand({  
	name: string,  
	description?: string,  
	initialValue?: any,  
	fn: (args: yargsParser.Arguments, value: any): void;  
})
```
- name：命令名称。
- description：命令描述，用于help命令作展示。
- initialValue：插件初始值，默认会存储到该命令的store中。
- fn：命令回调函数，参数args为调用inula-cli命令时传入的参数，已默认去除掉命令本身，结构同yargs-parser。参数value为

2、registerHook
注册事件回调
```js
api.registerHook({  
	name: string,  
	fn: （value?:any):void;  
})
```
- name: 事件名称
- fn：事件回调函数，参数为value，触发事件回调时提供，配合applyHook使用。

3、applyHook
触发事件回调
```js
applyHook({  
	name: string;  
	value?: any;  
})

```
- name：待触发的事件名称
- value：事件参数。
一个事件可以在命令中触发，或者在其他事件中触发。

## 十、内置插件

inula-cli集成了一些常用的命令插件以提供便捷的使用，同时还开放了一系列事件可以供开发者进行定制，具体内容如下：

---

1、build

build主要用于编译项目代码，当前build支持webpack和vite两种主流编译方式。build命令将会根据环境变量中的COMPILE_MODE识别当前项目的编译方式，如果不配置会使用webpack做为默认编译方式。开发者还可以通过环境变量中的BUILD_PATH指定编译配置文件，如果不指定，默认会寻找项目根目录下的"webpack.config.js"或"vite.config.js"作为编译配置文件。

build命令执行中提供了多个事件供开发者定制，名称如下：

|序号|事件名称|描述|
|---|---|---|
|1、|beforeCompile|构建编译前|
|2、|afterCompile|构建编译后|

2、dev

dev主要用于项目的本地调测，dev同样支持webpack和vite两种编译方式。

dev命令事件名称如下

|序号|事件名称|描述|
|---|---|---|
|1、|beforeDevCompile|dev构建编译前|
|2、|beforeStartDevServer|启动dev服务器前|
|3、|afterStartDevServer|启动dev服务器后|

3、help

help命令用于展示当前框架内置和用户手动加载的所有插件命令，用户可以通过registerCommand中的description属性自定义help展示时该命令的描述信息。

4、proxy

proxy命令用于触发远程代理功能。

5、version

显示当前inula-cli版本号。