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

import { render, act, vueReactive, RefType, unmountComponentAtNode } from '../../../../src';
import { Text, triggerClickEvent } from '../../jest/commonComponents';
import * as Inula from '../../../../src';
import { nextTick } from '../../../../src/inulax/proxy/Scheduler';

const { useReactive, useReference, useComputed, useWatch } = vueReactive;

describe('test reactive in FunctionComponent', () => {
  const { unmountComponentAtNode } = Inula;
  let container: HTMLElement | null = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    container?.remove();
    container = null;
  });

  it('should support useReactive in FunctionComponent', () => {
    const fn = jest.fn();

    function App(props) {
      fn();

      const reactiveObj = useReactive({
        persons: [
          { name: 'p1', age: 1 },
          { name: 'p2', age: 2 },
        ],
      });

      const newPerson = { name: 'p3', age: 3 };
      const addOnePerson = function () {
        reactiveObj.persons.push(newPerson);
      };
      const delOnePerson = function () {
        reactiveObj.persons.pop();
      };

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${reactiveObj.persons.length}`} />
          <button id={'addBtn'} onClick={addOnePerson}>
            add person
          </button>
          <button id={'delBtn'} onClick={delOnePerson}>
            delete person
          </button>
        </div>
      );
    }

    render(<App />, container);

    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');
    act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 3');

    act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should support ref object in FunctionComponent', () => {
    const fn = jest.fn();

    function App(props) {
      fn();
      const refObj = useReference({
        persons: [
          { name: 'p1', age: 1 },
          { name: 'p2', age: 2 },
        ],
      });

      const newPerson = { name: 'p3', age: 3 };
      const addOnePerson = function () {
        refObj.value.persons.push(newPerson);
      };
      const delOnePerson = function () {
        refObj.value.persons.pop();
      };

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${refObj.value.persons.length}`} />
          <button id={'addBtn'} onClick={addOnePerson}>
            add person
          </button>
          <button id={'delBtn'} onClick={delOnePerson}>
            delete person
          </button>
        </div>
      );
    }

    render(<App />, container);

    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');
    act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 3');

    act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should support ref primitive in FunctionComponent', () => {
    const fn = jest.fn();

    function App(props) {
      fn();
      const refObj = useReference(2);

      const add = function () {
        refObj.value++;
      };
      const del = function () {
        refObj.value--;
      };

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${refObj.value}`} />
          <button id={'addBtn'} onClick={add}>
            add person
          </button>
          <button id={'delBtn'} onClick={del}>
            delete person
          </button>
        </div>
      );
    }

    render(<App />, container);

    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');
    // 在Array中增加一个对象
    act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 3');

    act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should support useComputed in FunctionComponent', () => {
    const fn = jest.fn();

    function App(props) {
      const data = useReactive<{ bar?: string }>({});
      const computedData = useComputed(() => {
        fn();
        return data.bar;
      });

      const setText = function () {
        data.bar = 'bar';
      };

      return (
        <div>
          <Text id={'text'} text={computedData.value} />
          <button id={'setText'} onClick={setText}>
            set text
          </button>
        </div>
      );
    }

    render(<App />, container);

    expect(container?.querySelector('#text')?.innerHTML).toBe('');
    act(() => {
      triggerClickEvent(container, 'setText');
    });
    expect(container?.querySelector('#text')?.innerHTML).toBe('bar');

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should support useWatch in FunctionComponent', async () => {
    const fn = jest.fn();

    function App(props) {
      let dummy;
      const counter = useReactive({ num: 0 });
      useWatch(() => {
        fn();
        dummy = counter.num;
      });

      const updateCounter = function () {
        counter.num++;
      };

      return (
        <div>
          <Text id={'text'} text={counter.num} />
          <button id={'updateCounter'} onClick={updateCounter}>
            set text
          </button>
        </div>
      );
    }

    render(<App />, container);

    expect(container?.querySelector('#text')?.innerHTML).toBe('0');
    act(() => {
      triggerClickEvent(container, 'updateCounter');
    });
    expect(container?.querySelector('#text')?.innerHTML).toBe('1');

    await nextTick();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
