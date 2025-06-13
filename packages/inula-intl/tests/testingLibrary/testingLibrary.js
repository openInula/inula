/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import Horizon, { render as hrender } from '@cloudsop/horizon';

// 简单的 render 函数
export function render(component) {
  const container = global.container;
  document.body.appendChild(container);

  hrender(component, container);

  return { container };
}

// 简单的 screen 对象
export const screen = {
  getByText: text => {
    const elements = Array.from(document.body.getElementsByTagName('*'));
    for (const element of elements) {
      if (element.textContent.includes(text)) {
        return element;
      }
    }
    throw new Error(`Unable to find an element with the text: ${text}`);
  },
  getByTestId: testId => {
    const element = document.querySelector(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`Unable to find an element with the data-testid: ${testId}`);
    }
    return element;
  },
};

// 添加自定义断言方法
expect.extend({
  toBeInTheDocument(received) {
    const pass = received && document.body.contains(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
  toHaveTextContent(received, expected) {
    const pass = received && received.textContent.includes(expected);
    if (pass) {
      return {
        message: () => `expected ${received} not to have text content "${expected}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have text content "${expected}"`,
        pass: false,
      };
    }
  },
});
