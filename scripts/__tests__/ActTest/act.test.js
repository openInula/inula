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

import Inula, { render, useState, act, useEffect } from '../../../libs/inula/index';

describe('Inula.act function Test', () => {
  it('The act can wait for the useEffect update to complete.', function () {
    const Parent = props => {
      const [buttonOptions, setBtn] = useState([]);
      const [checkedRows, setCheckedRows] = useState([]);

      useEffect(() => {
        setBtn([1, 2, 3]);
      }, [checkedRows.length]);

      return (
        <div>
          <Child buttonOptions={buttonOptions}></Child>
        </div>
      );
    };

    const Child = props => {
      const { buttonOptions } = props;
      const [btnList, setBtnList] = useState(0);

      useEffect(() => {
        setBtnList(buttonOptions.length);
      }, [buttonOptions]);

      return <div id="childDiv">{btnList}</div>;
    };

    act(() => {
      render(<Parent />, container);
    });

    // act能够等待useEffect触发的update完成
    expect(container.querySelector('#childDiv').innerHTML).toEqual('3');
  });
});
