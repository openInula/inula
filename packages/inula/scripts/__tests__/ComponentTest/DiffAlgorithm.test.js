/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

describe('Diff Algorithm', () => {
  it('null should diff correctly', () => {
    const fn = jest.fn();

    class C extends Inula.Component {
      constructor() {
        super();
        fn();
      }

      render() {
        return 1;
      }
    }

    let update;

    function App() {
      const [current, setCurrent] = Inula.useState(1);
      update = setCurrent;
      return (
        <>
          {current === 1 ? <C /> : null}
          {current === 2 ? <C /> : null}
          {current === 3 ? <C /> : null}
        </>
      );
    }

    Inula.render(<App text="app" />, container);
    expect(fn).toHaveBeenCalledTimes(1);

    update(2);
    expect(fn).toHaveBeenCalledTimes(2);

    update(3);
    expect(fn).toHaveBeenCalledTimes(3);

    update(1);
    expect(fn).toHaveBeenCalledTimes(4);
  });
});
