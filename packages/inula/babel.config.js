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
  presets: ['@babel/preset-typescript', ['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    '@babel/plugin-syntax-jsx',
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'Inula.createElement',
        pragmaFrag: 'Inula.Fragment',
      },
    ],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-transform-object-super',
    ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
    ['@babel/plugin-transform-template-literals', { loose: true }],
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-literals',
    '@babel/plugin-transform-for-of',
    '@babel/plugin-transform-block-scoped-functions',
    '@babel/plugin-transform-classes',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-computed-properties',
    '@babel/plugin-transform-parameters',
    ['@babel/plugin-transform-spread', { loose: true, useBuiltIns: true }],
    ['@babel/plugin-transform-block-scoping', { throwIfClosureRequired: false }],
    ['@babel/plugin-transform-destructuring', { loose: true, useBuiltIns: true }],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
  ],
};
