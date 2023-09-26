# E2E 测试
本测试主要基于 `mocha`、`puppeteer`、`resemble` 等，主要用于开发之后的自验证，对比 `horizon` 与 `React` 渲染出来的界面是否存在偏差，及早发现问题。

## 安装 & 前期准备
### Step1 安装
在安装 `resemble` 的时候需要安装 `canvas` 这个包，内网里面无法直接安装成功，所以在安装时需要使先配置一下 `npm` 代理。

```sh
npm config set proxy http://域账号:密码@proxycn2.huawei.com:8080
npm config set https-proxy https://域账号:密码@proxycn2.huawei.com:8080
```

然后进行安装

```sh
# 单独安装 canvas
npm install canvas --canvas_binary_host_mirror=https://npm.taobao.org/mirrors/node-canvas-prebuilt/

# 或

# 在安装项目全部依赖的时候设置 canvas 包的获取路径
npm install --canvas_binary_host_mirror=https://npm.taobao.org/mirrors/node-canvas-prebuilt/
```

### Step2 打包构建
`e2e-test/src` 目录下是测试项目代码，该项目用到了 `eview-ui`、`React`、`React-Router` 和 `horizon` 等，需要先构建 `horizon` 项目，再进行打包构建，打包之后会在 `e2e-test` 目录下生成一个 `build` 目录。

```sh
# 构建 horizon 项目
npm install
# 构建 src 目录下的文件
npm run e2e-build

# 或者
# 构建 horizon + src 目录下的文件
npm run e2e-build:all
```


### Step3 标准用例生成
执行以下命令生成测试用例，项目启动之后，以 `react` 作为框架生成用例到 `e2e-test/test/test_cases_pic` 目录下。

```sh
npm run e2e-init
```

此过程只需要在第一次使用的时候执行一次即可，后续不需要多次执行。

## 使用方法
执行以下命令，可以直接执行测试用例。测试项目启动之后，以 `horizon` 作为框架执行，执行过程中生成的文件会放入 `e2e-test/test/new_test_pic` 目录下，执行结果可以在命令窗中看到。

如果执行失败，命令窗中会有报错，如果执行失败 `e2e-test/test/test_diff_pic` 目录下会生成差异对比图片。

```sh
npm run e2e-test
```

## 新用例添加
### Step1 测试项目修改
测试项目修改直接修改 `e2e-test/src/` 目录下的组件，代码的入口是 `components` 目录下的 `index.jsx`。修改完项目之后按照上面的方法重新构建即可。

如有想要调整构建脚本，可以修改 `e2e-test` 目录下的 `webpack.config.js`。

### Step2 测试用例添加
测试用例目前都在 `e2e-test/test/` 目录的 `index.test.js` 文件中，要添加用例，只需要添加形如下面这段代码：

```js
describe('Wizards', function () {
  it('#Previous', async () => {
    await page.goto(`${Config.baseUrl}#/wizards`);
    await page.waitForSelector('body > #root > div > .eui-btn:nth-child(4) > .eui-btn-content')
    await page.click('body > #root > div > .eui-btn:nth-child(4) > .eui-btn-content')
    await comparePicRes('Wizards-Previous');
  });
  it('#Next', async () => {
    await page.waitForSelector('body > #root > div > .eui-btn:nth-child(5) > .eui-btn-content')
    await page.click('body > #root > div > .eui-btn:nth-child(5) > .eui-btn-content')
    await comparePicRes('Wizards-Next');
  });
  it('#Disabled', async () => {
    await page.waitForSelector('body > #root > div > .eui-btn:nth-child(3)')
    await page.click('body > #root > div > .eui-btn:nth-child(3)')
    await comparePicRes('Wizards-Disabled');
  });
});
```
`describe` 块称为"测试套件"（test suite），表示一组相关的测试。它是一个函数，第一个参数是测试套件的名称（'Wizards'），第二个参数是一个实际执行的函数。

`it` 块称为"测试用例"（test case），表示一个单独的测试，是测试的最小单位。它也是一个函数，第一个参数是测试用例的名称（'#Previous'），第二个参数是一个实际执行的函数。

`it` 块中 `await page` 开头的代码是 `puppeteer` 提供的操作界面的相关函数。这些代码的生成有两种方式，一种是根据测试项目的代码结合着 `puppeteer` 提供 [API](http://puppeteerjs.com/) 自己去编写相关逻辑；另一种是使用 Chrome 插件 [headless-recorder](https://github.com/checkly/headless-recorder) 对操作进行录制。这两种方式在开发的时候都可以使用 `npm run e2e-start` 启动一个本地的 web server 用于分析页面结构或者录制操作。

`await comparePicRes` 是自定义的一个函数，参数是最终生成的测试图片的名称，函数中涵盖了，图片对比和断言的相关功能，无特殊需求一般不需要修改。
