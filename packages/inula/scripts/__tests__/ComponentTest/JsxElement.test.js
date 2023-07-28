/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import * as Inula from '../../../libs/inula/index';

describe('JSX Element test', () => {
  it('symbol attribute prevent cloneDeep unlimited loop', function () {

    function cloneDeep(obj) {
      const result = {};
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
          result[key] = cloneDeep(obj[key]);
        } else {
          result[key] = obj[key];
        }
      })
      return result;
    }
    class Demo extends Inula.Component {
      render() {
        return (
          <div>
            hello
          </div>
        );
      }
    }

    const ele = Inula.createElement(Demo);
    const copy = cloneDeep(ele);
    expect(copy.vtype).toEqual(ele.vtype);
    expect(Object.getOwnPropertySymbols(copy).length).toEqual(0);
  });
});

