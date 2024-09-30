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
import mapping2ForPlugin from '../../src/sugarPlugins/mapping2ForPlugin';

const mock = (code: string) => compile([mapping2ForPlugin], code);
describe('mapping2ForPlugin', () => {
  it('should transform map to for jsxelement', () => {
    const code = `
        function MyComp() {
          let arr = [1, 2, 3];
          return (
            <>
            {arr.map((item) => (<div>{item}</div>))}
            </>
          )
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  let arr = [1, 2, 3];
  return <>
            <for each={arr}>{item => <div>{item}</div>}</for>
            </>;
}"`);
  });
  it('should transform map to for jsxelement inside div', () => {
    const code = `
        function MyComp() {
          let arr = [1, 2, 3];
          return (
            <div>
            {arr.map((item) => (<div>{item}</div>))}
            </div>
          )
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  let arr = [1, 2, 3];
  return <div>
            <for each={arr}>{item => <div>{item}</div>}</for>
            </div>;
}"`);
  });
  it('should transform last map to for" ', () => {
    const code = `
        function MyComp() {
          let arr = [1, 2, 3];
          return (
            <div>
            {arr.map(item => <h1>{item}</h1>).map((item) => (<div>{item}</div>))}
            </div>
          )
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  let arr = [1, 2, 3];
  return <div>
            <for each={arr.map(item => <h1>{item}</h1>)}>{item => <div>{item}</div>}</for>
            </div>;
}"`);
  });
  it('should transform map in map to for" ', () => {
    const code = `
        function MyComp() {
          let matrix = [[1, 2], [3, 4]];
          return (
            <div>
              {matrix.map(arr => arr.map(item => <div>{item}</div>))}
            </div>
          )
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`
      "function MyComp() {
        let matrix = [[1, 2], [3, 4]];
        return <div>
                    <for each={matrix}>{arr => <for each={arr}>{item => <div>{item}</div>}</for>}</for>
                  </div>;
      }"
    `);
  });
  it('should not transform map not in jsx expression container ', () => {
    const code = `
      const a = arr.map(i => i+ 1) `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"const a = arr.map(i => i + 1);"`);
  });
});
