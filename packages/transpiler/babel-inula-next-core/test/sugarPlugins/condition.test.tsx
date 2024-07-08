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
import conditionPlugin from '../../src/sugarPlugins/conditionPlugin';

const mock = (code: string) => compile([conditionPlugin], code);
describe('conditionPlugin', () => {
  it('should transform condition to if jsx element', () => {
    const code = `
        function MyComp() {
          const show = true;
          return <div>{show && <h1>hello world</h1>}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show = true;
  return <div><if cond={show}>{<h1>hello world</h1>}</if></div>;
}"`);
  });
  it('should not transform condition to if out of jsx expression container', () => {
    const code = `
        show && <h1>hello world</h1>;
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"show && <h1>hello world</h1>;"`);
  });
  it('should transform triple to if else jsx element', () => {
    const code = `
        function MyComp() {
          const show = true;
          return <div>{show ? <h1>hello world</h1> : 'Empty'}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show = true;
  return <div><if cond={show}>{<h1>hello world</h1>}</if><else>{'Empty'}</else></div>;
}"`);
  });
  it('should not transform triple to if else out of jsx expression container', () => {
    const code = `
        show ? <h1>hello world</h1> : 'Empty';
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"show ? <h1>hello world</h1> : 'Empty';"`);
  });
});
