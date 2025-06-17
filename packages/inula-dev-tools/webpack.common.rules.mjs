/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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

/** @type import('webpack').Configuration.module.rules */
const webpackRules = [
  {
    test: /\.(ts|tsx)$/,
    exclude: function (path) {
      return /node_modules/.test(path) && !/inula/.test(path);
    },
    use: [
      {
        loader: 'babel-loader',
      },
    ],
  },
  {
    test: /\.less/i,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[local]-[hash:base64:5]',
          },
        },
      },
      'less-loader',
    ],
  },
  {
    test: /.svg$/,
    use: ['@svgr/webpack'],
    resourceQuery: /inline/,
  },
  {
    test: /\.(jpeg|jpg|png|gif|woff|woff2|eot|ttf|svg)$/,
    type: 'asset/resource',
    generator: {
      filename: 'assets/[name]_[hash:5][ext]',
    },
    resourceQuery: { not: [/inline/] },
  },
];

const webpackAlias = {
  react: 'openinula',
  'react-dom/client': 'openinula',
  'react-dom': 'openinula',
};

export { webpackRules, webpackAlias };
