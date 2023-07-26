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
    persons: new Set([
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
      state.persons.clear();
    },
    reset: state => {
      state.persons = new Set([
        { name: 'p1', age: 1 },
        { name: 'p2', age: 2 },
      ]);
    },
  },
});

describe('测试store中的Set', () => {
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
    const clearPersons = function() {
      userStore.clearPersons();
    };

    return (
      <div>
        <button id={'addBtn'} onClick={addOnePerson}>
          add person
        </button>
        <button id={'delBtn'} onClick={delOnePerson}>
          delete person
        </button>
        <button id={'clearBtn'} onClick={clearPersons}>
          clear persons
        </button>
        <div>{props.children}</div>
      </div>
    );
  }

  it('测试Set方法: add()、delete()、clear()', () => {
    function Child(props) {
      const userStore = useUserStore();
      const personArr = Array.from(userStore.$s.persons);
      const nameList: string[] = [];
      const keys = userStore.$s.persons.keys();
      for (const key of keys) {
        nameList.push(key.name);
      }

      return (
        <div>
          <Text id={'size'} text={`persons number: ${userStore.$s.persons.size}`} />
          <Text id={'lastAge'} text={`last person age: ${personArr[personArr.length - 1]?.age ?? 0}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 2');
    expect(container?.querySelector('#lastAge')?.innerHTML).toBe('last person age: 2');
    // 在set中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 3');

    // 在set中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 2');

    // clear set
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 0');
    expect(container?.querySelector('#lastAge')?.innerHTML).toBe('last person age: 0');
  });

  it('测试Set方法: keys()、values()', () => {
    function Child(props) {
      const userStore = useUserStore();

      const nameList: string[] = [];
      const keys = userStore.$s.persons.keys();
      // const keys = userStore.$s.persons.values();
      for (const key of keys) {
        nameList.push(key.name);
      }

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear set
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });

  it('测试Set方法: entries()', () => {
    function Child(props) {
      const userStore = useUserStore();

      const nameList: string[] = [];
      const entries = userStore.$s.persons.entries();
      for (const entry of entries) {
        nameList.push(entry[0].name);
      }

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear set
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });

  it('测试Set方法: forEach()', () => {
    function Child(props) {
      const userStore = useUserStore();

      const nameList: string[] = [];
      userStore.$s.persons.forEach(per => {
        nameList.push(per.name);
      });

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear set
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });

  it('测试Set方法: has()', () => {
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
    // 在set中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: true');
  });

  it('测试Set方法: for of()', () => {
    function Child(props) {
      const userStore = useUserStore();

      const nameList: string[] = [];
      for (const per of userStore.$s.persons) {
        nameList.push(per.name);
      }

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear set
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });
});
