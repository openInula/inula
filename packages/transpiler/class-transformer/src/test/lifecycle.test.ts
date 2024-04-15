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
import { transform } from './transform';

describe('lifecycle', () => {
  it('should support willMount', () => {
    //language=JSX
    expect(
      transform(`
        function App() {
          willMount: {
            console.log('willMount')
          }
          return (
            <div/>
          );
        }`)
    ).toMatchInlineSnapshot(`
      "class App extends View {
        willMount() {
          console.log('willMount');
        }
        Body() {
          return <div />;
        }
      }"
    `);
  });
  it('should support didMount', () => {
    //language=JSX
    expect(
      transform(`
        function App() {
          didMount: {
            console.log('didMount');
          }
          return (
            <div/>
          );
        }`)
    ).toMatchInlineSnapshot(`
      "class App extends View {
        didMount() {
          console.log('didMount');
        }
        Body() {
          return <div />;
        }
      }"
    `);
  });

  it('should support willUnmount', () => {
    //language=JSX
    expect(
      transform(`
        function App() {
          willUnmount: {
            console.log('willUnmount');
          }
          return (
            <div/>
          );
        }`)
    ).toMatchInlineSnapshot(`
      "class App extends View {
        willUnmount() {
          console.log('willUnmount');
        }
        Body() {
          return <div />;
        }
      }"
    `);
  });

  it('should support didUnmount', () => {
    //language=JSX
    expect(
      transform(`
        function App() {
          didUnmount: {
            console.log('didUnmount');
          }
          return (
            <div/>
          );
        }`)
    ).toMatchInlineSnapshot(`
      "class App extends View {
        didUnmount() {
          console.log('didUnmount');
        }
        Body() {
          return <div />;
        }
      }"
    `);
  });
});
