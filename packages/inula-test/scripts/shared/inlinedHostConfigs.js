/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

module.exports = [
  {
    shortName: 'dom',
    entryPoints: [
      'horizon',
    ],
    paths: [
      'horizon',
      'react-interactions',
    ],
    isFlowTyped: true,
    isServerSupported: true,
  },
  {
    shortName: 'dom-browser',
    entryPoints: [
      'horizon',
    ],
    paths: [
      'horizon',
    ],
    isFlowTyped: true,
    isServerSupported: true,
  },
  {
    shortName: 'test',
    entryPoints: ['react-test-renderer'],
    paths: ['react-test-renderer'],
    isFlowTyped: true,
    isServerSupported: false,
  },
];
