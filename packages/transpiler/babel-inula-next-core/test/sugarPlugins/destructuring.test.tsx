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
import stateDeconstructingPlugin from '../../src/sugarPlugins/stateDestructuringPlugin';

const mock = (code: string) => compile([stateDeconstructingPlugin], code);

describe('state deconstructing', () => {
  it('should work with object deconstructing', () => {
    expect(
      mock(`
      Component(() => {
        const { a, b } = c_$$props;
        const { e, f } = g();
      })
    `)
    ).toMatchInlineSnapshot(`
      "Component(() => {
        let a, b;
        watch(() => {
          ({
            a,
            b
          } = c_$$props);
        });
        let e, f;
        watch(() => {
          ({
            e,
            f
          } = g());
        });
      });"
    `);
  });

  it('should work with array deconstructing', () => {
    expect(
      mock(`
      Component(() => {
        const [a, b] = c_$$props
      })
    `)
    ).toMatchInlineSnapshot(`
      "Component(() => {
        let a, b;
        watch(() => {
          [a, b] = c_$$props;
        });
      });"
    `);
  });

  it('should support nested deconstructing', () => {
    // language=js
    expect(
      mock(/*js*/ `
          Component(() => {
            const  {
              p2: [p20X = defaultVal, {p211, p212: p212X = defaultVal}, ...restArr],
                p3,
              ...restObj
            } = prop2_$$prop;
          });
        `)
    ).toMatchInlineSnapshot(`
        "Component(() => {
          let p20X, p211, p212X, restArr, p3, restObj;
          watch(() => {
            ({
              p2: [p20X = defaultVal, {
                p211,
                p212: p212X = defaultVal
              }, ...restArr],
              p3,
              ...restObj
            } = prop2_$$prop);
          });
        });"
      `);
  });
});
