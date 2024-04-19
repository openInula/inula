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
import { genCode, mockAnalyze } from './mock';
import generate from '@babel/generator';

describe('propertiesAnalyze', () => {
  describe('state', () => {
    it('should work with jsx slice', () => {
      const root = mockAnalyze(`
        function App() {
          const a = <div></div>
        }
      `);

      expect(root.state[0].name).toBe('a');
      expect(genCode(root.state[0].value)).toMatchInlineSnapshot(`"<$$div-Sub0 />"`);
    });

    it('should work with jsx slice in ternary operator', () => {
      const root = mockAnalyze(`
        function App() {
          const a = true ? <div></div> : <h1></h1>
        }
      `);

      expect(root.state[0].name).toBe('a');
      expect(root.subComponents[0].name).toBe('$$div-Sub0');
      expect(genCode(root.subComponents[0].child)).toMatchInlineSnapshot(`"<div></div>"`);
      expect(root.subComponents[1].name).toBe('$$h1-Sub1');
      expect(genCode(root.subComponents[1].child)).toMatchInlineSnapshot(`"<h1></h1>"`);
      expect(genCode(root.state[0].value)).toMatchInlineSnapshot(`"true ? <$$div-Sub0 /> : <$$h1-Sub1 />"`);
    });

    it('should work with jsx slice in arr', () => {
      const root = mockAnalyze(`
        function App() {
          const arr = [<div></div>,<h1></h1>]
        }
      `);

      expect(root.state[0].name).toBe('a');
      expect(root.subComponents[0].name).toBe('$$div-Sub0');
      expect(genCode(root.subComponents[0].child)).toMatchInlineSnapshot(`"<div></div>"`);
      expect(root.subComponents[1].name).toBe('$$h1-Sub1');
      expect(genCode(root.subComponents[1].child)).toMatchInlineSnapshot(`"<h1></h1>"`);
      expect(genCode(root.state[0].value)).toMatchInlineSnapshot(`"true ? <$$div-Sub0 /> : <$$h1-Sub1 />"`);
    });
  });
});
