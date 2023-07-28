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

type Person = {name:string,age:number};

const persons:Person[] = [{ name: 'p1', age: 1 }, { name: 'p2', age: 2 }];
let useUserStore =  createStore({
  id: 'user',
  state: {
    type: 'bing dun dun',
    persons: persons,
  },
  actions: {
    addOnePerson: (state, person) => {
      state.persons.push(person);
    },
    delOnePerson: (state) => {
      state.persons.pop();
    },
    clearPersons: (state) => {
      state.persons = [];
    },
  },
});

describe('在Class组件中，测试store中的Array', () => {
  const { unmountComponentAtNode } = Inula;
  let container:HTMLElement|null = null;
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
    LogUtils.clear();

    clearStore('user');
  });

  const newPerson = { name: 'p3', age: 3 };
  class Parent extends Inula.Component {
    userStore = useUserStore();
    props:{
      children:any[]
    };

    constructor(props){
      super(props);
      this.props = props;
    }

    addOnePerson = () => {
      this.userStore.addOnePerson(newPerson);
    }

    delOnePerson = () => {
      this.userStore.delOnePerson();
    }

    render() {
      return <div>
        <button id={'addBtn'} onClick={this.addOnePerson}>
          add person
        </button>
        <button id={'delBtn'} onClick={this.delOnePerson}>
          delete person
        </button>
        <div>
          {this.props.children}
        </div>
      </div>
    }
  }

  it('测试Array方法: push()、pop()', () => {
    class Child extends Inula.Component {
      userStore = useUserStore();

      render() {
        return (
          <div>
            <Text id={'hasPerson'} text={`has new person: ${this.userStore.persons.length}`} />
          </div>
        );
      }
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');
    // 在Array中增加一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 3');

    // 在Array中删除一个对象
    Inula.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container?.querySelector('#hasPerson')?.innerHTML).toBe('has new person: 2');
  });

  it('测试Array方法: entries()、push()、shift()、unshift、直接赋值', () => {
    let globalStore = useUserStore();

    class Child extends Inula.Component {
      userStore = useUserStore();

      constructor(props) {
        super(props);
        globalStore = this.userStore;
      }

      render() {
        const nameList:string[] = [];
        const entries = this.userStore.$s.persons?.entries();
        if (entries) {
          for (const entry of entries) {
            nameList.push(entry[1].name);
          }
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
    // push
    globalStore?.$s.persons.push(newPerson);
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // shift
    // @ts-ignore TODO:why has this function argument?
    globalStore.$s.persons.shift({ name: 'p0', age: 0 });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p2 p3');

    // 赋值[2]
    globalStore.$s.persons[2] = { name: 'p4', age: 4 };
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p2 p3 p4');

    // 重新赋值[2]
    globalStore.$s.persons[2] = { name: 'p5', age: 5 };
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p2 p3 p5');

    // unshift
    globalStore.$s.persons.unshift({ name: 'p1', age: 1 });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3 p5');

    // 重新赋值 []
    globalStore.$s.persons = [];
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');

    // 重新赋值 [{ name: 'p1', age: 1 }]
    globalStore.$s.persons = [{ name: 'p1', age: 1 }];
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1');
  });

  it('测试Array方法: forEach()', () => {
    let globalStore = useUserStore();
    globalStore.$s.persons.push({ name: 'p2', age: 2 });
    class Child extends Inula.Component {
      userStore = useUserStore();

      constructor(props) {
        super(props);
        globalStore = this.userStore;
      }

      render() {
        const nameList:string[] = [];
        this.userStore.$s.persons.forEach((per:Person) => {
          nameList.push(per.name);
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
    // push
    globalStore.$s.persons.push(newPerson);
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3');

    // shift
    // @ts-ignore TODO:why has this function argument?
    globalStore.$s.persons.shift({ name: 'p0', age: 0 });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p2 p3');

    // 赋值[2]
    globalStore.$s.persons[2] = { name: 'p4', age: 4 };
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p2 p3 p4');

    // 重新赋值[2]
    globalStore.$s.persons[2] = { name: 'p5', age: 5 };
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p2 p3 p5');

    // unshift
    globalStore.$s.persons.unshift({ name: 'p1', age: 1 });
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1 p2 p3 p5');

    // 重新赋值 []
    globalStore.$s.persons = [];
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: ');

    // 重新赋值 [{ name: 'p1', age: 1 }]
    globalStore.$s.persons = [{ name: 'p1', age: 1 }];
    expect(container?.querySelector('#nameList')?.innerHTML).toBe('name list: p1');
  });

});
