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

const mock = (code: string) => compile([autoNamingPlugin], code);

describe('auto naming', () => {
  describe('component', () => {
    it('should transform FunctionDeclaration into Component macro', () => {
      const code = `
        function MyComponent() {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const MyComponent = Component(() => {});"
      `);
    });

    it('should transform VariableDeclaration with function expression into Component macro', () => {
      const code = `
        const MyComponent = function() {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const MyComponent = Component(() => {});"
      `);
    });

    it('should transform VariableDeclaration with arrow function into Component macro', () => {
      const code = `
        const MyComponent = () => {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const MyComponent = Component(() => {});"
      `);
    });

    it('should transform inner function into Component macro', () => {
      const code = `
        function MyComponent() {
          function Inner() {}
        }
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const MyComponent = Component(() => {
          const Inner = Component(() => {});
        });"
      `);
    });
  });

  describe('hook', () => {
    it('should transform FunctionDeclaration into Hook macro', () => {
      const code = `
        function useMyHook() {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const useMyHook = Hook(() => {});"
      `);
    });

    it('should transform VariableDeclaration with function expression into Hook macro', () => {
      const code = `
        const useMyHook = function() {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const useMyHook = Hook(() => {});"
      `);
    });

    it('should transform VariableDeclaration with arrow function into Hook macro', () => {
      const code = `
        const useMyHook = () => {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const useMyHook = Hook(() => {});"
      `);
    });
  });

  describe('invalid case', () => {
    it('should not transform FunctionDeclaration with invalid name', () => {
      const code = `
        function myComponent() {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "function myComponent() {}"
      `);
    });

    it('should not transform VariableDeclaration with invalid name', () => {
      const code = `
        const myComponent = function() {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`"const myComponent = function () {};"`);
    });

    it('should not transform VariableDeclaration with invalid arrow function', () => {
      const code = `
        const myComponent = () => {}
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`"const myComponent = () => {};"`);
    });
  });
});
