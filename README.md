# horizon

## 工程编译：
1、npm install
2、npm run build

全局单元测试  npm run test

发布包：
npm publish build/horizon --_auth=XXX

XXX是base64编码后的密码值，CMO保管。

## 不兼容：
1. input中的defaultValue值不支持改变，即：只有开始设置的值生效。
2. JSX里面不支持<!-- xxx -->注释。
