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
import propsFormatPlugin from '../../src/sugarPlugins/propsFormatPlugin';

const mock = (code: string) => compile([propsFormatPlugin], code);

describe('analyze props', () => {
  describe('props in params', () => {
    it('should work', () => {
      expect(
        mock(`
      Component(({foo, bar}) => {
        const v = foo + bar;
      })
    `)
      ).toMatchInlineSnapshot(`
        "Component(() => {
          let foo_$$prop;
          let bar_$$prop;
          const v = foo_$$prop + bar_$$prop;
        });"
      `);
    });

    it('should support default value', () => {
      expect(
        mock(`
      Component(({foo = 'default', bar = 123}) => {})
    `)
      ).toMatchInlineSnapshot(`
      "Component(() => {
        let foo_$$prop = 'default';
        let bar_$$prop = 123;
      });"
    `);
    });

    it('should support alias', () => {
      expect(
        mock(/*js*/ `
      Component(({'foo': renamed, bar: anotherName}) => {})
    `)
      ).toMatchInlineSnapshot(`
      "Component(() => {
        let foo_$$prop;
        let renamed = foo_$$prop;
        let bar_$$prop;
        let anotherName = bar_$$prop;
      });"
    `);
    });

    it('should support nested props', () => {
      expect(
        mock(/*js*/ `
      Component(({foo: {nested1, nested2}, bar}) => {})
    `)
      ).toMatchInlineSnapshot(`
      "Component(() => {
        let foo_$$prop;
        let {
          nested1,
          nested2
        } = foo_$$prop;
        let bar_$$prop;
      });"
    `);
    });
    //
    it('should support complex nested props', () => {
      // language=js
      expect(
        mock(/*js*/ `
          Component(function ({
              prop1,
              prop2: {
                p2: [p20X = defaultVal, {p211, p212: p212X = defaultVal}, ...restArr],
                p3,
                ...restObj
              }
            }) {
          });
        `)
      ).toMatchInlineSnapshot(`
      "Component(function () {
        let prop1_$$prop;
        let prop2_$$prop;
        let {
          p2: [p20X = defaultVal, {
            p211,
            p212: p212X = defaultVal
          }, ...restArr],
          p3,
          ...restObj
        } = prop2_$$prop;
      });"
      `);
    });

    it('should support rest element', () => {
      expect(
        mock(/*js*/ `
      Component(({foo, ...rest}) => {})
    `)
      ).toMatchInlineSnapshot(`
      "Component(() => {
        let foo_$$prop;
        let rest_$$prop;
      });"
    `);
    });

    it('should support empty props', () => {
      expect(
        mock(/*js*/ `
      Component(() => {})
    `)
      ).toMatchInlineSnapshot(`"Component(() => {});"`);
    });
  });

  describe('props in variable declaration', () => {
    it('should work', () => {
      expect(
        mock(/*js*/ `
      Component((props) => {
        const {foo, bar} = props;
      })
    `)
      ).toMatchInlineSnapshot(`
        "Component(() => {
          let foo_$$prop;
          let bar_$$prop;
        });"
      `);
    });

    it('should support props renaming', () => {
      expect(
        mock(/*js*/ `
        Component((props) => {
          const newProps = props;
          const {foo: renamed, bar} = newProps;
        })
      `)
      ).toMatchInlineSnapshot(`
        "Component(() => {
          let foo_$$prop;
          let renamed = foo_$$prop;
          let bar_$$prop;
        });"
      `);
    });
  });
});
