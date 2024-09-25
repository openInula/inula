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
import contextPlugin from '../../src/sugarPlugins/contextPlugin';
import autoNamingPlugin from '../../src/sugarPlugins/autoNamingPlugin';

const mock = (code: string) => compile([autoNamingPlugin, contextPlugin], code);

describe('useContext transform', () => {
  describe('object destructuring', () => {
    it('should transform object destructuring useContext call', () => {
      const code = `
        function App() {
          const { level, path } = useContext(UserContext);
          console.log(level, path);
        }
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const App = Component(() => {
          let path_$c$_ = useContext(UserContext, "path");
          let level_$c$_ = useContext(UserContext, "level");
          console.log(level_$c$_, path_$c$_);
        });"
      `);
    });

    it.fails('should transform nested object destructuring', () => {
      const code = `
        function App() {
          const { user: { name, age } } = useContext(UserContext);
          const { name, age } = user;
        }
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const App = Component(() => {
          let user_$c$_ = useContext(UserContext, "user");
        });"
      `);
    });
  });

  describe('direct assignment', () => {
    it('should transform direct assignment useContext call', () => {
      const code = `
        function App() {
          const user = useContext(UserContext);
          console.log(user);
        }
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const App = Component(() => {
          let user_$ctx$_ = useContext(UserContext);
          console.log(user_$ctx$_);
        });"
      `);
    });
  });

  describe('invalid usage', () => {
    it('should throw error for useContext not in variable declaration', () => {
      const code = `
        function App() {
          const a = true && useContext(UserContext);
        }
      `;
      expect(() => mock(code)).toThrow();
    });

    it('should throw error for useContext with computed context', () => {
      const code = `
        function App() {
          const value = useContext(getContext());
        }
      `;
      expect(() => mock(code)).toThrow();
    });
  });

  describe('multiple useContext calls', () => {
    it('should transform multiple useContext calls', () => {
      const code = `
        function App() {
          const { theme } = useContext(ThemeContext);
          const user = useContext(UserContext);
        }
      `;
      const transformedCode = mock(code);
      expect(transformedCode).toMatchInlineSnapshot(`
        "const App = Component(() => {
          let theme_$c$_ = useContext(ThemeContext, "theme");
          let user_$ctx$_ = useContext(UserContext);
        });"
      `);
    });
  });
});
