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

describe('component-composition', () => {
  describe('props destructuring', () => {
    it('should support default values', () => {
      //language=JSX
      expect(
        transform(`
          function UserProfile({
           name = '',
           age = null,
           favouriteColors = [],
           isAvailable = false,
         }) {
            return (
              <>
                <p>My name is {name}!</p>
                <p>My age is {age}!</p>
                <p>My favourite colors are {favouriteColors.join(', ')}!</p>
                <p>I am {isAvailable ? 'available' : 'not available'}</p>
              </>
            );
          }`),
        `
          class UserProfile {
            @Prop name = ''
            @Prop age = null
            @Prop favouriteColors = []
            @Prop isAvailable = false

            Body() {
              p(\`My name is \${this.name}!\`)
              p(\`My age is \${this.age}!\`)
              p(\`My favourite colors are \${this.favouriteColors.join(', ')}!\`)
              p(\`I am \${this.isAvailable ? 'available' : 'not available'}\`)
            }
          }
        `
      );
    });

    it('should support nested destruing', () => {
      //language=JSX
      expect(
        transform(`
      function UserProfile({
       name = '',
       age = null,
       favouriteColors : [{r,g,b}, color2],
       isAvailable = false,
     }) {
        return (
          <>
            <p>My name is {name}!</p >
            <p>My age is {age}!</p >
            <p>My favourite colors are {favouriteColors.join(', ')}!</p >
            <p>I am {isAvailable ? 'available' : 'not available'}</p >
          </>
        );
      }`),
        `
          class UserProfile {
            @Prop name = '';
            @Prop age = null;
            @Prop favouriteColors = [];
            @Prop isAvailable = false;
            color1;
            color2;
            r;
            g;
            b;
            xx = (() => {
              const [{r, g, b},color2] = this.favouriteColors;
              this.r = r
              this.g = g
              this.b = b
              this.color2 = color2
            });

            Body() {
              p(\`My name is \${this.name}!\`);
              p(\`My age is \${this.age}!\`);
              p(\`My favourite colors are \${this.favouriteColors.join(', ')}!\`);
              p(\`I am \${this.isAvailable ? 'available' : 'not available'}\`);
            }
          }
        `
      );
    });

    it('should support children prop', () => {
      //language=JSX
      expect(
        transform(`
            function Card({ children }) {
              return (
                <div className="card">
                  {children}
                </div>
              );
            }`),
        `
            class Card {
              @Children children

              Body() {
                div(\`card\`, this.children)
              }
            }
          `
      );
    });
  });

  it('should support children prop with alias', () => {
    //language=JSX
    expect(
      transform(`
        function Card({ children: content }) {
          return (
            <div className="card">
              {children}
            </div>
          );
        }`),
      `
        class Card {
          @Children content

          Body() {
            div(\`card\`, this.children)
          }
        }
      `
    );
  });
});
