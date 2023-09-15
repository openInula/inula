module.exports = {
  'parser': 'babel-eslint',
  'env': {
    'amd': true,
    'es6': true,
    'browser': true,
    'node': false
  },
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true
    }
  },
  'ignorePatterns': [
    "src/template"
  ],
  'rules': {
    'indent': [
      'error',
      4,
      {
        SwitchCase: 1,
        flatTernaryExpressions: true
      }
    ],
    'no-unused-vars': 'off',  // 允许变量声明后未使用
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "no-underscore-dangle": ["off", "always"],  // 允许私有变量 _xxx的变量命名方式
    "react/jsx-indent-props": [2, 4], // 验证JSX中的props缩进
    "react/prop-types": 0,  // 防止在React组件定义中丢失props验证
    'react/jsx-indent': [ // 解决react里面的缩进问题
      'error',
      4
    ],
    'filenames/match-exported': 0,
    'react/jsx-one-expression-per-line': 0, //  关闭一个表达式必须换行设定
    'react/jsx-filename-extension': [1, { 'extensions': [".js", '.jsx'] }], // 允许在 .js 和 .jsx 文件中使用 jsx
    'consistent-return': 0,
    "comma-dangle": [2, "never"], //  组和对象键值对最后一个逗号， never参数：不能带末尾的逗号, always参数：必须带末尾的逗号
    'react/button-has-type': 0, //  button无需强制声明类型
    'react/no-array-index-key': 0,  //  允许使用数组index作为组件的key
    'global-require': 0, // 允许require语句不出现在顶层中
    'no-nested-ternary': 0, //  允许嵌套三元表达式
    'no-unused-expressions': 0, // 允许使用未执行的表达式。比如fn是一个函数，允许 fn && fn()
    'no-throw-literal': 0, // 允许throw抛出对象格式
    '@typescript-eslint/member-ordering': 0 // 禁用TypeScript声明规范
  }
}
