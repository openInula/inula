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
import { clearStore, createStore, useStore } from '../../../../libs/inula/src/inulax/store/StoreHandler';
import { OBSERVER_KEY } from '../../../../libs/inula/src/inulax/Constants';
import { App, Text, triggerClickEvent } from '../../jest/commonComponents';

describe('测试对store.state对象进行深度克隆', () => {
  const { unmountComponentAtNode } = Inula;
  let container = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    createStore({
      id: 'user',
      state: {
        type: 'bing dun dun',
        persons: [
          { name: 'p1', age: 1 },
          { name: 'p2', age: 2 },
        ],
      },
      actions: {
        addOnePerson: (state, person) => {
          state.persons.push(person);
        },
        delOnePerson: state => {
          state.persons.pop();
        },
        clearPersons: state => {
          state.persons = null;
        },
      },
    });
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    container.remove();
    container = null;

    clearStore('user');
  });

  const newPerson = { name: 'p3', age: 3 };

  function Parent({ children }) {
    const userStore = useStore('user');
    const addOnePerson = function() {
      userStore.addOnePerson(newPerson);
    };
    const delOnePerson = function() {
      userStore.delOnePerson();
    };
    return (
      <div>
        <button id={'addBtn'} onClick={addOnePerson}>
          add person
        </button>
        <button id={'delBtn'} onClick={delOnePerson}>
          delete person
        </button>
        <div>{children}</div>
      </div>
    );
  }

  it('The observer object of symbol (\'_inulaObserver\') cannot be accessed to  from Proxy', () => {
    let userStore = null;
    function Child(props) {
      userStore = useStore('user');

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${userStore.persons.length}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    // The observer object of symbol ('_inulaObserver') cannot be accessed to  from Proxy prevent errors caused by clonedeep.
    expect(userStore.persons[0][OBSERVER_KEY]).toBe(undefined);
  });

  it('The observer object of symbol (\'_inulaObserver\') cannot be accessed to  from Proxy', () => {
    let userStore = null;
    function Child(props) {
      userStore = useStore('user');

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${userStore.persons.length}`} />
        </div>
      );
    }

    Inula.render(<App parent={Parent} child={Child} />, container);

    // NO throw this Exception, TypeError: 'get' on proxy: property 'prototype' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value
    const proxyObj = userStore.persons[0].constructor;
    expect(proxyObj.prototype !== undefined).toBeTruthy();
  });

});
