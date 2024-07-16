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
import { transform } from '../mock';

describe('for sub component', () => {
  it('should transform for loop', () => {
    const code = `
        function MyComp() {
          let name = 'test';
          let arr = [{x:1, y:1}, {x:2, y:2}, {x:3, y:3}]
          return (
            <for each={arr}> {({x, y}, index) => {
              let name1 = 'test'
              const onClick = () => {
                name1 = 'test2'
              }

	          return <div className={name} onClick={onClick} style={{x: index}}>{name1}</div>
            }}</for>
          )
        }
      `;
    const transformedCode = transform(code);
    expect(transformedCode).toMatchInlineSnapshot(`"function MyComp() {
  let name = 'test';
  let arr = [{
    x: 1,
    y: 1
  }, {
    x: 2,
    y: 2
  }, {
    x: 3,
    y: 3
  }];
  function Comp_$id$({
    x,
    y,
    index
  }) {
    let name1 = 'test';
    const onClick = () => {
      name1 = 'test2';
    };
    return <div className={name} onClick={onClick} style={{
      x: index
    }}>{name1}</div>;
  }
  return <for each={arr}> {({
      x,
      y
    }, index) => <Comp_$id$ x={x} y={y} index={index} />}</for>;
}"`);
  });
});
