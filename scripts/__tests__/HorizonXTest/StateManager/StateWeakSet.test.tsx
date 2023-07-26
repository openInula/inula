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
import * as LogUtils from '../../jest/logUtils';
import { clearStore, createStore, useStore } from '../../../../libs/inula/src/inulax/store/StoreHandler';
import { App, Text, triggerClickEvent } from '../../jest/commonComponents';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const useUserStore = createStore({
  id: 'user',
  state: {
    type: 'bing dun dun',
    persons: new WeakSet([
      { name: 'p1', age: 1 },
      { name: 'p2', age: 2 },
    ]),
  },
  actions: {
    addOnePerson: (state, person) => {
      state.persons.add(person);
    },
    delOnePerson: (state, person) => {
      state.persons.delete(person);
    },
    clearPersons: state => {
      state.persons = new WeakSet([]);
    },
    reset: state => {
      state.persons = new WeakSet([
        { name: 'p1', age: 1 },
        { name: 'p2', age: 2 },
      ]);
    },
  },
});

describe('测试store中的WeakSet', () => {
  const { unmountComponentAtNode } = Inula;
  let container: HTMLElement | null = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    useUserStore().reset();
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    container?.remove();
    container = null;
    LogUtils.clear();

    clearStore('user');
  });

  const newPerson = { name: 'p3', age: 3 };
  function Parent(props) {
    const userStore = useUserStore();
    const addOnePerson = function() {
      userStore.addOnePerson(newPerson);
    };
    const delOnePerson = function() {
      userStore.delOnePerson(newPerson);
    };
    return (
      <div>
        <button id={'addBtn'} onClick={addOnePerson}>
          add person
        </button>
        <button id={'delBtn'} onClick={delOnePerson}>
          delete person
        </button>
        <div>{props.children}</div>
      </div>
    );
  }

  it('测试WeakSet方法: add()、delete()、has()', () => {
    function Child(props) {
      const userStore = useUserStore();

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${userStore.$s.persons.has(newPerson)}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: false');
    // 在WeakSet中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: true');

    // 在WeakSet中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: false');
  });
});
