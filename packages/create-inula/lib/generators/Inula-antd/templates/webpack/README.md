[inula-antd](https://codehub-y.huawei.com/c00486778/horizon-antd/files?ref=master)项目是借鉴[AntD Admin](https://github.com/zuiidea/antd-admin)的一个中控台项目。主要特点是使用了[horizon](https://open.codehub.huawei.com/innersource/shanhai/wutong/horizon/horizon-core/wiki/view/doc/695491)框架，并且使用HorizonX实现状态管理。

界面如：

![inula-antd1](http://image.huawei.com/tiny-lts/v1/images/5b32eb56b2162b5e02f6306bf6f6e09d_1913x903.gif@900-0-90-f.gif)

## 代码特点：

1、使用了`horizon`开发框架，兼容React的所有接口。

2、使用`函数式组件`进行开发。

3、使用TS语言（待完成）。

4、使用了`horizonX的状态管理`能力，每个page都会有一个store，这样可以保证每个store体积较小，使用方便，性能也更好一些。

5、使用了`React-router-dom`作为路由，利用Lazy动态加载组件。

6、使用`less`书写css。

7、封装了request请求。

8、使用`react-intl`实现国际化。

9、支持换肤能力。

10、使用了antd 作为组件、使用了Echart、HighCharts、ReChart绘制多种图形。

11、提供简单易用的`数据mock`能力，并使用mockjs进行数据mock。

## 工程特点：

1、支持热部署。

2、支持source-map调试。

3、提供babel.config.js、.editorconfig、.prettierrc.js、.eslintrc.js 等常用配置。

## 使用方式：

1、克隆ssh://git@codehub-dg-y.huawei.com:2222/c00486778/horizon-antd.git

2、执行 `npm i -f` ， 如果@cloudsop/horizon无法下载，请在`.npmrc`配置 @cloudsop:registry=https://cmc.centralrepo.rnd.huawei.com/artifactory/api/npm/product_npm

3、执行 `npm run dev:admin`
