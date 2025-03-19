/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { test } from 'vitest';

interface DomTestContext {
  container: HTMLDivElement;
}

// Define a new test type that extends the default test type and adds the container fixture.
export const domTest = test.extend<DomTestContext>({
  container: async ({ task }, use) => {
    const container = document.createHTMLNode('div');
    document.body.appendChild(container);
    await use(container);
    container.remove();
  },
});
