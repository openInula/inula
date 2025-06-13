/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import * as Inula from '../../../src/index';
import { getLogUtils } from '../jest/testUtils';

describe('StrictMode Component test', () => {
  const LogUtils = getLogUtils();
  const { useState, useEffect, useRef, render, act } = Inula;

  it('StrictMode is same to Fragment', () => {
    const Parent = () => {
      const [, setS] = useState('1');

      return (
        <Inula.StrictMode>
          <button id="btn" onClick={() => setS(prevState => prevState + '!')}>
            Click
          </button>
          <Child />
        </Inula.StrictMode>
      );
    };

    const Child = () => {
      const isMount = useRef(false);

      useEffect(() => {
        if (!isMount.current) {
          LogUtils.log('didMount');
          isMount.current = true;
        } else {
          LogUtils.log('didUpdate');
        }
      });

      return null;
    };

    act(() => render(<Parent />, container));
    // 子组件初始化，会挂载一次
    expect(LogUtils.getAndClear()).toStrictEqual(['didMount']);
    const button = container.querySelector('#btn');
    // 父组件State更新，子组件也会更新一次
    act(() => button.click());
    expect(LogUtils.getAndClear()).toStrictEqual(['didUpdate']);
  });
});
