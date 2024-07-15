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
  it('should transform and expression to if jsx element', () => {
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
  it('should not transform and expression to if out of jsx expression container', () => {
    const code = `
        show && <h1>hello world</h1>;
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"show && <h1>hello world</h1>;"`);
  });
  it('should transform condition expression to if else jsx element', () => {
    const code = `
        function MyComp() {
          const show = true;
          return <div>{show ? <h1>hello world</h1> : 'Empty'}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show = true;
  return <div><if cond={show}><h1>hello world</h1></if><else>{'Empty'}</else></div>;
}"`);
  });
  it('should not transform condition expression to if else out of jsx expression container', () => {
    const code = `
        show ? <h1>hello world</h1> : 'Empty';
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"show ? <h1>hello world</h1> : 'Empty';"`);
  });
  it('should transform "condition expression in and expression" to "if else tag in if tag"', () => {
    const code = `
        function MyComp() {
          const show1 = true;
          const show2 = true;
          return <div>{show1 && (show2 ? <h1>hello world</h1> : 'Empty')}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show1 = true;
  const show2 = true;
  return <div><if cond={show1}><if cond={show2}><h1>hello world</h1></if><else>{'Empty'}</else></if></div>;
}"`);
  });
  it('should not transform "and expression" whose right is identifier', () => {
    const code = `
        function MyComp() {
          const show1 = true;
          const show2 = true;
          return <div>{show1 && show2 ? <h1>hello world</h1> : 'Empty'}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show1 = true;
  const show2 = true;
  return <div><if cond={show1 && show2}><h1>hello world</h1></if><else>{'Empty'}</else></div>;
}"`);
  });
  it('should transform "and expression in and expression" to "if tag in if tag"', () => {
    const code = `
        function MyComp() {
          const show1 = true;
          const show2 = true;
          return <div>{show1 && (show2 && <h1>hello world</h1>)}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show1 = true;
  const show2 = true;
  return <div><if cond={show1}><if cond={show2}>{<h1>hello world</h1>}</if></if></div>;
}"`);
  });
  it('should transform "and expression in condition expression" to "if tag in if else tag"', () => {
    const code = `
        function MyComp() {
          const show1 = true;
          const show2 = true;
          return <div>{show1 ? (show2 && <h1>hello world</h1>) : 'Empty'}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show1 = true;
  const show2 = true;
  return <div><if cond={show1}><if cond={show2}>{<h1>hello world</h1>}</if></if><else>{'Empty'}</else></div>;
}"`);
  });
  it('should transform "condition expression in condition expression" to "if else tag in if else tag"', () => {
    const code = `
        function MyComp() {
          const show1 = true;
          const show2 = true;
          return <div>{show1 ? (show2 ? <h1>hello world</h1> : 'Empty2') : 'Empty1'}</div>
        }
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  const show1 = true;
  const show2 = true;
  return <div><if cond={show1}><if cond={show2}><h1>hello world</h1></if><else>{'Empty2'}</else></if><else>{'Empty1'}</else></div>;
}"`);
  });
  it('should not transform condition expression in attribute', () => {
    const code = `
        <tr className={selected === id ? 'danger' : ''}></tr>
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"<tr className={selected === id ? 'danger' : ''}></tr>;"`);
  });
  it('should not transform end expression in attribute', () => {
    const code = `
        <tr className={a && b}></tr>;
      `;
    const transformedCode = mock(code);
    expect(transformedCode).toMatchInlineSnapshot(`"<tr className={a && b}></tr>;"`);
  });
});
