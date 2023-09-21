/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
    'filenames/match-exported': 0,
    'consistent-return': 0,
    "comma-dangle": [2, "never"], //  组和对象键值对最后一个逗号， never参数：不能带末尾的逗号, always参数：必须带末尾的逗号
    'global-require': 0, // 允许require语句不出现在顶层中
    'no-nested-ternary': 0, //  允许嵌套三元表达式
    'no-unused-expressions': 0, // 允许使用未执行的表达式。比如fn是一个函数，允许 fn && fn()
    'no-throw-literal': 0, // 允许throw抛出对象格式
    '@typescript-eslint/member-ordering': 0 // 禁用TypeScript声明规范
  }
}
