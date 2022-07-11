import * as Horizon from '@cloudsop/horizon/index.ts';
import { clearStore, createStore, useStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';
import { App, Text, triggerClickEvent } from '../../jest/commonComponents';

describe('测试store中的Set', () => {
  const { unmountComponentAtNode } = Horizon;
  let container = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    const persons = new Set([
      { name: 'p1', age: 1 },
      { name: 'p2', age: 2 },
    ]);

    createStore({
      id: 'user',
      state: {
        type: 'bing dun dun',
        persons: persons,
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

  function Parent(props) {
    const userStore = useStore('user');
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
      const userStore = useStore('user');
      const personArr = Array.from(userStore.$state.persons);
      const nameList = [];
      const keys = userStore.$state.persons.keys();
      for (const key of keys) {
        nameList.push(key.name);
      }

      return (
        <div>
          <Text id={'size'} text={`persons number: ${userStore.$state.persons.size}`} />
          <Text id={'lastAge'} text={`last person age: ${personArr[personArr.length - 1]?.age ?? 0}`} />
        </div>
      );
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#size').innerHTML).toBe('persons number: 2');
    expect(container.querySelector('#lastAge').innerHTML).toBe('last person age: 2');
    // 在set中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#size').innerHTML).toBe('persons number: 3');

    // 在set中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#size').innerHTML).toBe('persons number: 2');

    // clear set
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#size').innerHTML).toBe('persons number: 0');
    expect(container.querySelector('#lastAge').innerHTML).toBe('last person age: 0');
  });

  it('测试Set方法: keys()、values()', () => {
    function Child(props) {
      const userStore = useStore('user');

      const nameList = [];
      const keys = userStore.$state.persons.keys();
      // const keys = userStore.$state.persons.values();
      for (const key of keys) {
        nameList.push(key.name);
      }

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear set
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });

  it('测试Set方法: entries()', () => {
    function Child(props) {
      const userStore = useStore('user');

      const nameList = [];
      const entries = userStore.$state.persons.entries();
      for (const entry of entries) {
        nameList.push(entry[0].name);
      }

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear set
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });

  it('测试Set方法: forEach()', () => {
    function Child(props) {
      const userStore = useStore('user');

      const nameList = [];
      userStore.$state.persons.forEach(per => {
        nameList.push(per.name);
      });

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear set
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });

  it('测试Set方法: has()', () => {
    function Child(props) {
      const userStore = useStore('user');

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${userStore.$state.persons.has(newPerson)}`} />
        </div>
      );
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#hasPerson').innerHTML).toBe('has new person: false');
    // 在set中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#hasPerson').innerHTML).toBe('has new person: true');
  });

  it('测试Set方法: for of()', () => {
    function Child(props) {
      const userStore = useStore('user');

      const nameList = [];
      for (const per of userStore.$state.persons) {
        nameList.push(per.name);
      }

      return (
        <div>
          <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
        </div>
      );
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在set中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在set中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear set
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });
});
