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

import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from '../jest/testUtils';

describe('ForwardRef', () => {
  const LogUtils = getLogUtils();
  it('ForwardRef包裹的函数组件应该正常触发effect', () => {
    function App(props, ref) {
      Horizon.useEffect(() => {
        LogUtils.log('effect');
        return () => {
          LogUtils.log('effect remove');
        };
      });
      return <button ref={ref}></button>;
    }

    const Wrapper = Horizon.forwardRef(App);

    Horizon.act(() => {
      Horizon.render(<Wrapper />, container);
    });
    expect(LogUtils.getAndClear()).toEqual(['effect']);
    Horizon.act(() => {
      Horizon.render(<Wrapper />, container);
    });
    expect(LogUtils.getAndClear()).toEqual(['effect remove', 'effect']);
  });

  it('memo组件包裹的类组件', () => {
   class Component extends Horizon.Component {
     render() {
       return <button>123</button>;
     }
   }

    const Wrapper = Horizon.memo(Component);

    Horizon.act(() => {
      Horizon.render(<Wrapper />, container);
    });
    Horizon.act(() => {
      Horizon.render(<Wrapper />, container);
    });
  });
});
