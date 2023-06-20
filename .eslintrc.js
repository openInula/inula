/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  root: true,

  plugins: ['jest', 'no-for-of-loops', 'no-function-declare-after-return', 'react', '@typescript-eslint'],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },
  env: {
    browser: true,
    jest: true,
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    semi: ['warn', 'always'],
    quotes: ['warn', 'single'],
    'accessor-pairs': 'off',
    'brace-style': ['error', '1tbs'],
    'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
    'max-lines-per-function': 'off',
    'object-curly-newline': 'off',
    // 尾随逗号
    'comma-dangle': ['error', 'only-multiline'],

    'no-constant-condition': 'off',
    'no-for-of-loops/no-for-of-loops': 'error',
    'no-function-declare-after-return/no-function-declare-after-return': 'error',
  },
  globals: {
    isDev: true,
    isTest: true,
  },
  overrides: [
    {
      files: ['scripts/__tests__/**/*.js'],
      globals: {
        container: true,
      },
    },
  ],
};
