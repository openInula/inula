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

describe('Class refs Test', () => {
  it('Parent can get Child instance by refs', function () {
    let pInst;

    class Parent extends Inula.Component {
      componentDidMount() {
        pInst = this;
      }

      render() {
        return (
          <div>
            <Child ref="child">
              <div ref="childDiv">childDiv</div>
            </Child>
          </div>
        );
      }
    }

    class Child extends Inula.Component {
      state = { y: 0 };

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    Inula.render(<Parent />, container);

    expect(pInst.refs['child'].state.y).toEqual(0);
    expect(pInst.refs['childDiv'].innerHTML).toEqual('childDiv');
  });
});
