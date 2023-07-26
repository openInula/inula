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

//@ts-ignore
import * as Inula from '../../../../libs/inula/index';
import { triggerClickEvent } from '../../jest/commonComponents';
import { useLogStore } from './store';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const { unmountComponentAtNode } = Inula;

describe('Dollar store access', () => {
  let container: HTMLElement | null = null;

  const BUTTON_ID = 'btn';
  const RESULT_ID = 'result';

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container?.remove();
    container = null;
  });

  it('Should use $s and $c', () => {
    function App() {
      const logStore = useLogStore();

      return <div id={RESULT_ID}>{logStore.$c.length()}</div>;
    }

    Inula.render(<App />, container);

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('1');
  });

  it('Should use $a and update components', () => {
    function App() {
      const logStore = useLogStore();

      return (
        <div>
          <button
            id={BUTTON_ID}
            onClick={() => {
              logStore.$a.addLog('data');
            }}
          >
            add
          </button>
          <p id={RESULT_ID}>{logStore.$c.length()}</p>
        </div>
      );
    }

    Inula.render(<App />, container);

    Inula.act(() => {
      triggerClickEvent(container, BUTTON_ID);
    });

    expect(document.getElementById(RESULT_ID)?.innerHTML).toBe('2');
  });
});
