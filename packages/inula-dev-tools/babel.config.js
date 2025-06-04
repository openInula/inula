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

module.exports = api => {
  const isTest = api.env('test');
  console.log('isTest', isTest);

  const plugins = [['@babel/plugin-transform-class-properties', { loose: false }]];

  if (process.env.NODE_ENV !== 'production') {
    plugins.push(['@babel/plugin-transform-react-jsx-source']);
  }

  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript',
      [
        '@babel/preset-react',
        {
          runtime: 'automatic', // 新增
          importSource: 'openinula', // 新增
        },
      ],
    ],
    plugins,
  };
};
