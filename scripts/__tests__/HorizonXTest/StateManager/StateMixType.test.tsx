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

describe('测试store中的混合类型变化', () => {
  const { unmountComponentAtNode } = Inula;
  let container: HTMLElement | null = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    const persons = new Set([{ name: 'p1', age: 1, love: new Map() }]);
    persons.add({
      name: 'p2',
      age: 2,
      love: new Map(),
    });
    persons
      .values()
      .next()
      .value.love.set('lanqiu', { moneny: 100, days: [1, 3, 5] });

    createStore({
      id: 'user',
      state: {
        type: 'bing dun dun',
        persons: persons,
      },
      actions: {
        addDay: (state, day) => {
          state.persons
            .values()
            .next()
            .value.love.get('lanqiu')
            .days.push(day);
        },
      },
    });
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    (container as HTMLElement).remove();
    container = null;
    LogUtils.clear();

    clearStore('user');
  });

  function Parent(props) {
    const userStore = useStore('user');
    const addDay = function() {
      userStore.addDay(7);
    };

    return (
      <div>
        <button id={'addBtn'} onClick={addDay}>
          add day
        </button>
        <div>{props.children}</div>
      </div>
    );
  }

  it('测试state -> set -> map -> array的数据变化', () => {
    function Child(props) {
      const userStore = useStore('user');

      const days = userStore.persons
        .values()
        .next()
        .value.love.get('lanqiu').days;

      return (
        <div>
          <Text id={'dayList'} text={`love: ${days.join(' ')}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#dayList')?.innerHTML).toBe('love: 1 3 5');
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#dayList')?.innerHTML).toBe('love: 1 3 5 7');
  });

  it('属性是个class实例', () => {
    class Person {
      name;
      age;
      loves = new Set();

      constructor(name, age) {
        this.name = name;
        this.age = age;
      }

      setName(name) {
        this.name = name;
      }
      getName() {
        return this.name;
      }

      setAge(age) {
        this.age = age;
      }
      getAge() {
        return this.age;
      }

      addLove(lv) {
        this.loves.add(lv);
      }
      getLoves() {
        return this.loves;
      }
    }

    let globalPerson;
    let globalStore;
    function Child(props) {
      const userStore = useStore('user');
      globalStore = userStore;

      const nameList: string[] = [];
      const valIterator = userStore.persons.values();
      let per = valIterator.next() as {
        value: {
          name: string;
          getName: () => string;
        };
        done: boolean;
      };
      while (!per.done) {
        nameList.push(per.value.name ?? per.value.getName());
        globalPerson = per.value;
        per = valIterator.next();
      }

      return (
        <div>
          <Text id={'nameList'} text={nameList.join(' ')} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('p1 p2');

    // 动态增加一个Person实例
    globalStore.$s.persons.add(new Person('ClassPerson', 5));

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('p1 p2 ClassPerson');

    globalPerson.setName('ClassPerson1');

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('p1 p2 ClassPerson1');
  });
});
