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

import { unmountComponentAtNode } from '../../../libs/inula/src/dom/DOMExternal';
import { getLogUtils } from './testUtils';

const LogUtils = getLogUtils();
global.isDev = process.env.NODE_ENV === 'development';
global.isTest = true;
global.container = null;
global.beforeEach(() => {
  LogUtils.clear();
  // 创建一个 DOM 元素作为渲染目标
  global.container = document.createElement('div');
  document.body.appendChild(global.container);
});

global.afterEach(() => {
  unmountComponentAtNode(global.container);
  global.container.remove();
  global.container = null;
  LogUtils.clear();
});


function runAssertion(fn) {
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: () => error.message,
    };
  }
  return { pass: true };
}

function toMatchValue(LogUtils, expectedValues) {
  return runAssertion(() => {
    const actualValues = LogUtils.getAndClear();
    expect(actualValues).toEqual(expectedValues);
  });
}

// 使Jest感知自定义匹配器
expect.extend({
  toMatchValue,
});
