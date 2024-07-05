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

import { describe, expect, it } from 'vitest';
import { compile } from './mock';
import autoNamingPlugin from '../../src/sugarPlugins/autoNamingPlugin';
import hookPlugin from '../../src/sugarPlugins/hookPlugin';

const mock = (code: string) => compile([autoNamingPlugin, hookPlugin], code);

describe('use hook transform', () => {
  it('should transform a simple custom hook call', () => {
    const input = `
      function App() {
        const [x, y] = useMousePosition(0, 0);
      }
    `;
    const output = mock(input);
    expect(output).toMatchInlineSnapshot(`
      "const App = Component(() => {
        let _useMousePosition_$h$_ = createHook(useMousePosition, [0, 0]);
        const [x, y] = _useMousePosition_$h$_.return();
      });"
    `);
  });
});
