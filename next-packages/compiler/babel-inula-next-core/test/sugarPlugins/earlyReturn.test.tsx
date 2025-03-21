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
import earlyReturnPlugin from '../../src/sugarPlugins/earlyReturnPlugin';

const mock = (code: string) => compile([earlyReturnPlugin], code);

describe('analyze early return', () => {
  it('should work', () => {
    expect(
      mock(/*js*/ `
    const App = Component(() => {
      if (count > 1) {
        return <div>1</div>
      }
      return <div>
        <if cond={count > 1}>{count} is bigger than is 1</if>
        <else>{count} is smaller than 1</else>
      </div>;
    })`)
    ).toMatchInlineSnapshot(/*js*/ `
      "const App = Component(() => {
        const Branch_1 = Component(() => {
          return <div>1</div>;
        });
        const Default_1 = Component(() => {
          return <div>
              <if cond={count > 1}>{count} is bigger than is 1</if>
              <else>{count} is smaller than 1</else>
            </div>;
        });
        return <><if cond={count > 1}><Branch_1 /></if><else><Default_1 /></else></>;
      });"
    `);
  });

  it('should work with multi if', () => {
    expect(
      mock(/*js*/ `
      const App = Component(() => {
        if (count > 1) {
          return <div>1</div>
        }
        if (count > 2) {
          return <div>2</div>
        }
        return <div></div>;
      })
    `)
    ).toMatchInlineSnapshot(/*js*/ `
      "const App = Component(() => {
        const Branch_1 = Component(() => {
          return <div>1</div>;
        });
        const Default_1 = Component(() => {
          const Branch_2 = Component(() => {
            return <div>2</div>;
          });
          const Default_2 = Component(() => {
            return <div></div>;
          });
          return <><if cond={count > 2}><Branch_2 /></if><else><Default_2 /></else></>;
        });
        return <><if cond={count > 1}><Branch_1 /></if><else><Default_1 /></else></>;
      });"
    `);
  });

  it('should work with nested if', () => {
    expect(
      mock(/*js*/ `
      const App = Component(() => {
        if (count > 1) {
          if (count > 2) {
            return <div>2</div>
          }
          return <div>1</div>
        }
        return <div></div>;
      })
    `)
    ).toMatchInlineSnapshot(/*js*/ `
      "const App = Component(() => {
        const Branch_1 = Component(() => {
          const Branch_2 = Component(() => {
            return <div>2</div>;
          });
          const Default_2 = Component(() => {
            return <div>1</div>;
          });
          return <><if cond={count > 2}><Branch_2 /></if><else><Default_2 /></else></>;
        });
        const Default_1 = Component(() => {
          return <div></div>;
        });
        return <><if cond={count > 1}><Branch_1 /></if><else><Default_1 /></else></>;
      });"
    `);
  });
});
