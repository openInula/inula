### 使用脚手架创建lnulaJS项目

##### 步骤一： 启动Inula脚手架

在您需要创建项目的目录下执行以下命令：

```bash
npx create-inula <项目名>
```



##### 步骤二： 选择需要项目模板

执行启动命令后，您将收到以下回显信息询问，可根据回显信息进行相应的输入：

```
Need to install the following packages:create-inula@1.0.0
Ok to proceed? (y) y
? Please select the template (Use arrow keys)
> Simple-app

```



在创建项目过程中脚手架提供了 Simple-app 模板供开发者选择(后续会加入更多模板)。

- Simple-app已默认安装Inula，开发者可以直接在项目中专注于核心代码的开发。

基于上述模板的创建的项目特性，我们更建议您使用InulaJS-antd的方法构建项目。

##### 步骤三：选择打包方式

在创建项目过程中有两种打包方式供选择，您可以根据自己使用习惯选择

```
? Please select the build type (Use arrow keys)
 > webpack
   vite
```



如果您不知如何选择可分别参考[Vite 文档](https://cn.vitejs.dev/)以及[webpack文档](https://webpack.js.org/)。

至此，可以使用Inula框架，通过以下命令`npm run start`命令运行项目，你会看到简单的inula的示例。当然，你也可以基于inula框架构建您的web项目。
