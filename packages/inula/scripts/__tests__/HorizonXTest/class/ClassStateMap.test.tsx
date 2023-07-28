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
import * as LogUtils from '../../jest/logUtils';
import {clearStore, createStore, useStore} from '../../../../libs/inula/src/inulax/store/StoreHandler';
import {App, Text, triggerClickEvent} from '../../jest/commonComponents';
import {describe, beforeEach, afterEach, it, expect} from '@jest/globals';

const useUserStore = createStore({
  id: 'user',
  state: {
    type: 'bing dun dun',
    persons: new Map([['p1', 1], ['p2', 2]]),
  },
  actions: {
    addOnePerson: (state, person) => {
      state.persons.set(person.name, person.age);
    },
    delOnePerson: (state, person) => {
      state.persons.delete(person.name);
    },
    clearPersons: (state) => {
      state.persons.clear();
    },
    reset: (state)=>{
      state.persons=new Map([['p1', 1], ['p2', 2]]);
    }
  },
});

describe('在Class组件中，测试store中的Map', () => {
  const { unmountComponentAtNode } = Inula;
  let container:HTMLElement|null = null;
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

  class Parent extends Inula.Component {
    userStore = useUserStore();
    props = {children:[]}

    constructor(props){
      super(props);
      this.props = props;
    }

    addOnePerson = () => {
      this.userStore.addOnePerson(newPerson);
    }
    delOnePerson = () => {
      this.userStore.delOnePerson(newPerson);
    }
    clearPersons = () => {
      this.userStore.clearPersons();
    }

    render() {
      return (
        <div>
          <button id={'addBtn'} onClick={this.addOnePerson}>
            add person
          </button>
          <button id={'delBtn'} onClick={this.delOnePerson}>
            delete person
          </button>
          <button id={'clearBtn'} onClick={this.clearPersons}>
            clear persons
          </button>
          <div>
            {this.props.children}
          </div>
        </div>
      );
    }
  }

  it('测试Map方法: set()、delete()、clear()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        return (
          <div>
            <Text id={'size'} text={`persons number: ${this.userStore.$s.persons.size}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 2');
    // 在Map中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 3');

    // 在Map中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 2');

    // clear Map
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#size')?.innerHTML).toBe('persons number: 0');
  });

  it('测试Map方法: keys()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        const nameList:string[] = [];
        const keys = this.userStore.$s.persons.keys();
        for (const key of keys) {
          nameList.push(key);
        }

        return (
          <div>
            <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear Map
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });

  it('测试Map方法: values()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        const ageList:number[] = [];
        const values = this.userStore.$s.persons.values();
        for (const val of values) {
          ageList.push(val);
        }

        return (
          <div>
            <Text id={'ageList'} text={`age list: ${ageList.join(' ')}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#ageList')?.innerHTML).toBe('age list: 1 2');
    // 在Map中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#ageList')?.innerHTML).toBe('age list: 1 2 3');

    // 在Map中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#ageList')?.innerHTML).toBe('age list: 1 2');

    // clear Map
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#ageList')?.innerHTML).toBe('age list: ');
  });

  it('测试Map方法: entries()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        const nameList:string[] = [];
        const entries = this.userStore.$s.persons.entries();
        for (const entry of entries) {
          nameList.push(entry[0]);
        }

        return (
          <div>
            <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear Map
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });

  it('测试Map方法: forEach()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        const nameList:string[] = [];
        this.userStore.$s.persons.forEach((val, key) => {
          nameList.push(key);
        });

        return (
          <div>
            <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear Map
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });

  it('测试Map方法: has()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        return (
          <div>
            <Text id={'hasPerson'} text={`has new person: ${this.userStore.$s.persons.has(newPerson.name)}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: false');
    // 在Map中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: true');
  });

  it('测试Map方法: for of()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        const nameList:string[] = [];
        for (const per of this.userStore.$s.persons) {
          nameList.push(per[0]);
        }

        return (
          <div>
            <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2');

    // clear Map
    Inula.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');
  });
});
