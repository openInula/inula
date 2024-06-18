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

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render, View } from '../src';

describe('props', () => {
  describe('normal props', () => {
    it('should support prop', ({ container }) => {
      function Child({ name }) {
        return <h1>{name}</h1>;
      }

      function App() {
        return <Child name={'hello world!!!'} />;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          hello world!!!
        </h1>
      </div>
    `);
    });

    it('should support prop alias', ({ container }) => {
      function Child({ name: alias }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child name={'prop alias'} />;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          prop alias
        </h1>
      </div>
    `);
    });

    it('should support prop alias with default value', ({ container }) => {
      function Child({ name: alias = 'default' }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child />;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          default
        </h1>
      </div>
    `);
    });
  });

  describe('children', () => {
    it('should support children', ({ container }) => {
      function Child({ children }) {
        return <h1>{children}</h1>;
      }

      function App() {
        return <Child>child content</Child>;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          child content
        </h1>
      </div>
    `);
    });

    it('should support children alias', ({ container }) => {
      function Child({ children: alias }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child>children alias</Child>;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          children alias
        </h1>
      </div>
    `);
    });

    it('should support children alias with default value', ({ container }) => {
      function Child({ children: alias = 'default child' }) {
        return <h1>{alias}</h1>;
      }

      function App() {
        return <Child />;
      }

      render(App, container);
      expect(container).toMatchInlineSnapshot(`
      <div>
        <h1>
          default child
        </h1>
      </div>
    `);
    });
  });
});
