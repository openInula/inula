# inula-cli

## 一、安装使用

### 安装Node.js

inula-cli的运行需要依赖Node.js，使用前请确保您的电脑已安装Node.js，并且版本在16以上。您可以通过在控制台执行以下命令来确认您的版本。

```shell
>node -v

v16.4.0
```

如果您没有安装Node.js，或者Node.js版本不满足条件，推荐使用nvm工具安装和管理Node.js版本。

nvm最新版本下载: [https://github.com/coreybutler/nvm-windows/releases](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fcoreybutler%2Fnvm-windows%2Freleases)

安装nvm之后，可以通过如下命令安装Node.js:

```shell
>node install 16

>node use 16
```

执行完成后，可以通过node -v确认安装是否成功。

### 安装inula-cli

为了方便使用inula-cli的功能，推荐您全局安装inula-cli。Node.js安装会自带npm工具用于管理模块，您可以直接运行如下命令：

```shell
>npm install -g inula-cli
```

安装完成后，使用inula-cli version命令确认安装是否完成。

```shell
>inula-cli version
1.1.0
```



## 二、目录结构

inula-cli的推荐目录结构如下：

```
├── dist // 构建产物目录
├── node_modules // 项目依赖
│   └── @inula
│       └── inula-cli
│           ├── lib
├── mock // mock目录
│   └── mock.ts
├── src // 项目源码目录
│   ├── pages
│   │   ├── index.less
│   │   └── index.tsx
│   ├── utils
│   │   └── index.ts
│   ├── services
│   │   └── api.ts
│   ├── entry.(ts|tsx)
├── .env // 项目环境变量文件
├── plugin.ts // 插件文件
├── .inula.ts|js // inula-cli配置文件
├── package.json
├── tsconfig.json
```



## 三、环境变量

inula-cli支持开发者使用环境变量来定义一些配置。

### 环境变量配置方法

inula-cli默认将项目根路径下的.env文件视为环境变量配置文件。.env文件应遵循properties文件格式。

如果项目在本地开发时需要做一些自定义配置，支持同时配置.local.env文件，相同名称的环境变量会以.local.env中的生效。



## 四、配置文件

inula-cli支持用户通过项目根目录下的.inula.ts或者.inula.js文件进行自定义配置。当两个文件同时存在时，会优先选取.inula.ts作为项目配置。如果您对配置文件还需要额外定制，可以在环境变量中添加RUNNING_MODE字段，RUNNING_MODE允许额外再定制一份配置文件，例如RUNNING_MODE=cloud，inula-cli会寻找名称为.inula.cloud.ts/js的配置文件。

### 配置文件定义

在配置文件中，您需要默认导出一个配置，以下为一个简单的配置文件示例：

```typescript
// .inula.ts

export default {
    enableMock: true,
    buildConfig:[
      {
        path: './webpack.web.js',
        name: 'web'
      },
      {
        path: './webpack.server.js',
        name: 'server'
      }
    ]
}
```

对于TypeScript类型，我们也提供了类型定义以供开发时自动补全：

```typescript
// .inula.ts

import { defineConfig } from "inula-cli"

export default defineConfig({
    enableMock: true,
    buildConfig:[
      {
        path: "./webpack.web.js",
        name: "web"
      },
      {
        path: "./webpack.server.js",
        name: "server"
      }
    ]
})
```



### 配置文件参数

| 序号 | 参数          | 描述                   | 类型   |
| ---- | ------------- | ---------------------- | ------ |
| 1、  | enableMock    | 是否开启本地mock能力   | bool   |
| 2、  | mockPath      | 本地Mock文件目录       | string |
| 3、  | compileMode   | 构建方式               | string |
| 4、  | buildConfig   | 生产构建配置           | array  |
| 5、  | devBuildConfg | 本地构建配置           | object |
| 6、  | plugins       | 需要加载的插件路径列表 | array  |
| 7、  | remoteProxy   | 远端静态接口代理配置   | object |



## 五、插件

inula-cli的所有功能都围绕插件展开，插件可以很方便地让用户集成各式各样的功能，用户可以通过配置自由搭配组合各式各样的插件能力。

### 插件执行流程

所有插件的触发都从用户执行命令开始。当用户执行命令后，inula-cli会加载用户的配置文件.获取到插件列表后，会依次加载内部插件和用户自定义插件，通过inula-cli提供的api对象，向inula-cli注册命令以及hook。最后根据用户的命令选择最终执行的方法。


### 使用插件

#### 使用内置插件

内置插件在inula-cli运行时会自动加载，用户可以直接调用这些内置命令，当前支持的内置插件功能如下：

| 序号 | 插件功能                 | 触发命令          |
| ---- | :----------------------- | ----------------- |
| 1、  | 本地开发构建             | inula-cli dev     |
| 2、  | 生产构建                 | inula-cli build   |
| 3、  | 接口mock能力             | inula-cli dev     |
| 4、  | 远端服务器页面热更新能力 | inula-cli dev     |
| 5、  | 远端服务器页面代理能力   | inula-cli proxy   |
| 6、  | 显示版本                 | inula-cli version |
| 7、  | 显示帮助                 | inula-cli help    |

#### 使用其他开发者发布的插件

inula-cli支持用户集成已发布在npm仓库的插件，用户可以按需安装并运行这些插件。

安装可以通过npm安装，这里以插件@inula/add为例：

```shell
npm i --save-dev @inula/add
```

如果需要运行插件，需要在配置文件中配置对应的插件路径

```typescript
// .inula.ts

export default {
    ...
    plugins:["@inula/add"]
}
```

如果需要使用node_modules中的插件，可以只填写插件模块名，inula-cli会自动在node_modules里寻找模块并导入该模块。

### 开发自定义插件

#### inula-cli添加命令

我们可以通过api的registerCommand为inula-cli添加自定义命令，示例如下：

1、编写命令插件文件，这里我们自定义了一个conf命令用于展示当前项目的配置信息。

```typescript
// conf.ts

import { API } from "inula-cli";

export default (api: API) => {
    api.registerCommand({
        name: "conf",
        description: "show user config",
        initalState: api.userConfig,
        fn: async function (args: any, state: any) {
            console.log("current user config is: ", state);
        }
    })
}
```

2、在配置文件中加入对插件的引用

```typescript
// .inula.ts

export default  {
    plugins: ["./conf"]
}
```

3、在项目根目录下执行`inula-cli conf`即可触发插件运行。

```shell
> inula-cli conf
current user config is: {
  plugins: [ './conf', './showConf' ],
}
```

####  为插件添加hook

inula-cli提供了hook机制可以让开发者在执行命令时实现事件监听和触发能力，

1、使用插件注册hook

```typescript
// modifyConfig.ts

import { API } from "inula-cli";

export default (api: API) => {
	api.registerHook({
		name: "modifyConfig",
		fn: () => {
			api.userConfig.buildConfig = {
				path: "./webpack.config.js"
			};
			api.compileMode = "webpack"
		}
	})
}
```

2、在插件中触发hook

```typescript
// conf.ts

import { API } from "inula-cli";

export default (api: API) => {
    api.registerCommand({
        name: "conf",
        description: "show user config",
        initalState: api.userConfig,
        fn: async function (args: any, state: any) {
        	api.applyHook("modifyConfig");
            console.log("current user config is: ", state);
        }
    })
}
```

3、在配置文件中加入插件

```typescript
// .inula.ts

export default  {
    plugins: ["./conf", "./modifyConfig"]
}
```

4、触发命令

```shell
> inula-cli conf
current user config is: {
  plugins: [ './conf', './showConf' ],
  buildConfig: {path: './webpack.config.js'},
  compileMode: 'webpack'
}
```



### 插件属性

| 序号 | 属性名称       | 描述                                             |
| ---- | -------------- | ------------------------------------------------ |
| 1、  | compileMode    | 构建方式                                         |
| 2、  | userConfig     | 用户配置信息                                     |
| 3、  | buildConfig    | 用户生产构建配置                                 |
| 4、  | devBuildConfig | 用户本地开发构建配置                             |
| 5、  | packageJson    | 用户package.json信息                             |
| 6、  | logger         | 日志模块，支持debug、info、warn、error四个级别， |



### 插件核心API

1、registerCommand

registerCommand方法允许用户自定义inula-cli的执行命令，

```typescript
 api.registerCommand({
        name: string,
        description?: string,
        initialState?: any,
        fn: (args: yargsParser.Arguments, state: any): void;
    })
```

- name：命令名称。
- description：命令描述，用于help命令作展示。
- initialState：命令初始属性。
- fn：命令回调函数，参数args为调用inula-cli命令时传入的参数，已默认去除掉命令本身，结构同yargs-parser。state为执行时的命令属性。

使用示例：

```typescript
import { API } from "inula-cli";

export default (api: API) => {
    api.registerCommand({
        name: "conf",
        description: "show user config",
        initialState: api.userConfig,
        fn: async function (args: any, state: any) {
            console.log("current user config is: ", state);
        }
    })
}
```

2、registerHook

registerHook用于向inula-cli注册hook事件

```
api.registerHook({
    name: string,
    fn: (value?: any):void;
})
```

- name: 事件名称
- fn：事件回调函数，参数为value，由触发事件回调时提供。

使用示例：

```typescript
import { API } from "inula-cli";

export default (api: API) => {
	api.registerHook({
		name: "modifyConfig",
		fn: () => {
			api.userConfig.buildConfig = {
				path: "./webpack.config.js"
			};
			api.compileMode = "webpack"
		}
	})
}
```

3、applyHook

applyHook用于触发事件回调

```
applyHook(name: string, value?: any})
```

- name：待触发的事件名称
- value：事件参数。

使用示例：

```typescript
import { API } from "inula-cli";

export default (api: API) => {
    api.registerCommand({
        name: "conf",
        description: "show user config",
        initalState: api.userConfig,
        fn: async function (args: any, state: any) {
        	api.applyHook("modifyConfig");
            console.log("current user config is: ", state);
        }
    })
}
```



## 五、构建能力

### 生产构建

inula-cli默认集成生产构建能力，用户可以通过在.inula.ts中配置buildConfig字段启用功能。配置示例如下：

```typescript
// .inula.ts

// 使用webpack构建
export default {
  compileMode: 'webpack',
  buildConfig:[
      {
        path: './webpack.web.js',
        name: 'web'
      },
      {
        path: './webpack.server.js',
        name: 'server'
        }
      }
    ]
}

// 使用vite构建
export default {
  compileMode: 'vite',
  buildConfig:[
      {
        path: './vite.config.js',
        name: 'config'
      },
  ]
}
```

生产构建支持传入多个配置文件路径，使用webpack构建还支持配置文件以函数方式导出，inula-cli会将配置中的env和args作为参数传递到函数中执行以获取最后的构建配置。

```typescript
// webpack.config.js

module.exports = function (env, argv) {
 return {
  entry: './src/' + argv['output'] + '.js',
  output: {
   filename: 'bundle.js',
   path: path.resolve(__dirname, 'dist'),
  },
  devtool: env.production ? 'source-map' : 'eval'
 }
}

// .inula.ts

export default {
  compileMode: 'webpack',
  buildConfig:[
      {
        path: './webpack.config.js',
        name: 'config',
        args: {
          output: 'page',
        },
        env: {
          production: true
        }
      },
    ]
}
```

### 本地构建

inula-cli默认也支持项目本地构建，用户可以通过在.inula.ts中配置devBuildConfig字段启用功能。配置示例如下：

```typescript
// .inula.ts

// 使用webpack构建
export default: {
  compileMode: "webpack"
  devBuildConfig: {
    path: "./webpack.dev.js",
    name: "dev",
    env: {
      development: true
    }
  }
}

// 使用vite构建
export default: {
  compileMode: "vite"
  devBuildConfig: {
    path: "./vite.dev.js",
    name: "dev"
  }
}
```

本地构建只允许用于传入一份配置文件路径，如果使用webpack进行构建，同样支持配置文件导出函数。



## 六、Mock

Mock功能广泛应用于前端开发中，Mock能力可以模拟出后端服务的各种响应情况，比如成功、失败、超时等情况，以及不同的数据返回，从而帮助我们更好地进行前端开发和测试。 Mock功能可以使得前端开发人员可以独立进行开发和测试，不会受到后端开发的进度影响，从而提高开发效率。

### 如何使用Mock

inula-cli已经将Mock功能作为内置插件能力，当您无论使用webpack还是vite构建项目时都可以自动启用。如果您不想使用Mock功能，可以自行在配置文件中关闭。

inula-cli已经将Mock功能作为内置插件能力，当您无论使用webpack还是vite构建项目时都可以自动启用。如果您不想使用Mock功能，可以自行在配置文件中关闭。该目录下所有文件视为mock文件。例如：

### Mock目录

inula-cli自动将项目根路径里/Mock目录下所有文件视为mock文件。例如：

```
├── mock
    ├── todos.ts
    ├── items.ts
    └── users.ts
└── src
    └── pages
        └── index.tsx
```

如果您想修改Mock目录位置，可以在配置文件中修改mockPath。如果不配置该参数，默认使用"./mock"。

```typescript
// .inula.ts
export default {
    ...
    enableMock: true,
    mockPath："./mock",
}
```

### Mock文件

由于实现方式不同，webpack和vite构建的项目在mock文件的格式也略有不同，这里将分开说明。

#### webpack

Mock文件需要默认导出一个对象，key为"请求方式 接口名"，值为接口实现。示例如下：

```typescript
export default {
    "GET /api/user": (req, res) => {
        res.status(200).json("admin")
    }
}
```

如果想要一次mock多个接口，可以在导出对象中设置多个key，例如：

```typescript
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

Mock文件默认导出一个数组，数组每一个成员示例如下：

```typescript
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

## 七、**远端页面热更新能力**

远端页面热更新能力是指在不修改远端服务器文件的前提下，当开发者在本地调试、修改项目代码时，可以实时在远端页面生效，并且能够与远端其他接口正常完成交互，其实现原理如下：



用户在启动dev调试后，devServer会根据matcher中的判断逻辑决定该接口从本地项目获取还是从远端服务器获取，同时本地项目会根据用户修改代码实时编译，这样可以使得devServer拥有热更新能力。

### 使用方法

在框架配置文件中，开发者需要配置远端服务器地址以及编写自定义的matcher函数提供给框架：

```typescript
// .inula.ts

const matcher = (pathname, request) => {
  // 这里我们假设以"/user"开头的接口由本地项目提供，其余接口从远端获取
  if (!pathname.startsWith("/user")) {
    return true;
  }
  return false;
}

export default  {
  ...
  devBuildConfig: {
    devProxy: {
      target: "https://xx.xx.xx.xx:xxxx",
      matcher: matcher,
    }
  },
};

```

配置完成后，直接运行inula-cli dev，即可进行热调试。

## 八、**远端静态接口代理**能力

远端代理也是开发测试过程中常用能力之一，尤其是在开发大型项目时，需要修改其中的一个或多个接口时，可以使用远端代理将需要修改的客户端接口重定向到本地修改后的文件，快速进行问题分析和修改验证。



### 使用方法

用户可以在.inula.ts中配置remoteProxy字段开启远端静态接口代理能力，完成配置后，使用后执行inula-cli proxy启动该功能。

```typescript
// .inula.ts

export default {
  remoteProxy: {
    target: "https://xx.xx.xx.xx:xxxx",
    localPort: 3001,
    localStatic: [
      {
         url: "/api/page.js",
         local: "./dist/page.js"
      },
      {
         url: "api/page.css",
         local: "./dist/page.css"
      }
    ]
    forwardingURL: ["/"]
  }
}
```
