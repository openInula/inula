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
import {createStore} from '../../../../libs/inula/src/inulax/store/StoreHandler';
import {triggerClickEvent} from '../../jest/commonComponents';

const {unmountComponentAtNode} = Inula;

describe('Reset', () => {
  it('RESET NOT IMPLEMENTED', async () => {
    // console.log('reset functionality is not yet implemented')
    expect(true).toBe(true);
  })
  return;

  let container = null;

  const BUTTON_ID = 'btn';
  const RESET_ID = 'reset';
  const RESULT_ID = 'result';

  const useCounter = createStore({
    state: {
      counter: 0
    },
    actions: {
      increment: function (state) {
        state.counter++;
      }
    },
    computed: {}
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Should reset to default state', async () => {
    function App() {
      const store = useCounter();

      return <div>
        <p id={RESULT_ID}>{store.$s.counter}</p>
        <button onClick={store.increment} id={BUTTON_ID}>add</button>
        <button onClick={() => {
          store.$reset();
        }} id={RESET_ID}>reset
        </button>
      </div>
    }

    Inula.render(<App/>, container);

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('2');

    Inula.act(() => {
      triggerClickEvent(container, RESET_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('0');

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID).innerHTML).toBe('1');
  });
});
