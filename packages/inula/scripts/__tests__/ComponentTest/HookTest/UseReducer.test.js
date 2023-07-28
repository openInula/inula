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

import * as Inula from '../../../../libs/inula/index';

describe('useReducer Hook Test', () => {
  const { useReducer } = Inula;

  it('简单使用useReducer', () => {
    const intlCar = { logo: '', price: 0 };
    let dispatch;
    const App = () => {
      const carReducer = (state, action) => {
        switch (action.logo) {
          case 'ford':
            return {
              ...intlCar,
              logo: 'ford',
              price: 76,
            };
          case 'bmw':
            return {
              ...intlCar,
              logo: 'bmw',
              price: 100,
            };
          case 'benz':
            return {
              ...intlCar,
              logo: 'benz',
              price: 80,
            };
          default:
            return {
              ...intlCar,
              logo: 'audi',
              price: 88,
            };
        }
      };
      const [car, carDispatch] = useReducer(carReducer, intlCar);
      dispatch = carDispatch;
      return (
        <div>
          <p>{car.logo}</p>
          <p id={'senP'}>{car.price}</p>
        </div>
      );
    };
    Inula.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('');
    expect(container.querySelector('#senP').innerHTML).toBe('0');
    // 触发bmw
    dispatch({ logo: 'bmw' });
    expect(container.querySelector('p').innerHTML).toBe('bmw');
    expect(container.querySelector('#senP').innerHTML).toBe('100');
    // 触发carReducer里的switch的default项
    dispatch({ logo: 'wrong logo' });
    expect(container.querySelector('p').innerHTML).toBe('audi');
    expect(container.querySelector('#senP').innerHTML).toBe('88');
  });

  it('dispatch只触发一次', () => {
    let nextId = 1;
    const reducer = () => {
      return { data: nextId++ };
    };
    const btnRef = Inula.createRef();
    const Main = () => {
      const [{ data }, dispatch] = useReducer(reducer, { data: 0 });
      const dispatchLogging = () => {
        console.log('dispatch is called once');
        dispatch();
      };

      return (
        <div>
          <button ref={btnRef} onClick={() => dispatchLogging()}>
            increment
          </button>
          <div>{data}</div>
        </div>
      );
    };

    Inula.render(<Main />, container);
    Inula.act(() => {
      btnRef.current.click();
    });
    expect(nextId).toBe(2);
  });
});
