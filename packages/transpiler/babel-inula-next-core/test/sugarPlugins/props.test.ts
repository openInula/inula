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
        "Component(({
          foo,
          bar
        }) => {
          let foo_$p$ = foo;
          let bar_$p$ = bar;
          const v = foo_$p$ + bar_$p$;
        });"
      `);
    });

    it('should support default value', () => {
      expect(
        mock(`
      Component(({foo = 'default', bar = 123}) => {})
    `)
      ).toMatchInlineSnapshot(`
        "Component(({
          foo = 'default',
          bar = 123
        }) => {
          let foo_$p$ = foo;
          let bar_$p$ = bar;
        });"
      `);
    });

    it('should support alias', () => {
      expect(
        mock(/*js*/ `
      Component(({'foo': renamed, bar: anotherName}) => {})
    `)
      ).toMatchInlineSnapshot(`
        "Component(({
          foo,
          bar
        }) => {
          let foo_$p$ = foo;
          let renamed = foo_$p$;
          let bar_$p$ = bar;
          let anotherName = bar_$p$;
        });"
      `);
    });

    it('should support nested props', () => {
      expect(
        mock(/*js*/ `
      Component(({foo: {nested1, nested2}, bar}) => {})
    `)
      ).toMatchInlineSnapshot(`
        "Component(({
          foo,
          bar
        }) => {
          let foo_$p$ = foo;
          let {
            nested1,
            nested2
          } = foofoo_$p$;
          let bar_$p$ = bar;
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
        "Component(function ({
          prop1,
          prop2
        }) {
          let prop1_$p$ = prop1;
          let prop2_$p$ = prop2;
          let p20X;
          let p211;
          let p212X;
          let restArr;
          let p3;
          let restObj;
          watch(() => {
            ({
              p2: [p20X = defaultVal, {
                p211,
                p212: p212X = defaultVal
              }, ...restArr],
              p3,
              ...restObj
            } = prop2_$p$);
          });
        });"
      `);
    });

    it('should support rest element', () => {
      expect(
        mock(/*js*/ `
      Component(({foo, ...rest}) => {})
    `)
      ).toMatchInlineSnapshot(`
        "Component(function ({
          prop1,
          prop2
        }) {
          let prop1_$p$ = prop1;
          let prop2_$p$ = prop2;
          let {
            p2: [p20X = defaultVal, {
              p211,
              p212: p212X = defaultVal
            }, ...restArr],
            p3,
            ...restObj
          } = prop2prop2_$p$;
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
        "Component(({
          foo,
          bar
        }) => {
          let foo_$p$ = foo;
          let bar_$p$ = bar;
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
        "Component(({
          foo,
          bar
        }) => {
          let foo_$p$ = foo;
          let renamed = foo_$p$;
          let bar_$p$ = bar;
        });"
      `);
    });
  });
});
