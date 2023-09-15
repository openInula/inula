// babelrc 只会影响本项目中的代码
// babel.config.js会影响整个项目中的代码，包含node_modules中的代码
// 推荐使用babel.config.js
module.exports = {
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-export-default-from',
  ],
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic', // 新增
        importSource: 'inulajs', // 新增
      },
    ],
  ],
};
