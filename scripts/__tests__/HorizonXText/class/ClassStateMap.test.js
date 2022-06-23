import * as Horizon from '@cloudsop/horizon/index.ts';
import { clearStore, createStore, useStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';
import { App, Text, triggerClickEvent } from '../../jest/commonComponents';

describe('在Class组件中，测试store中的Map', () => {
  const { unmountComponentAtNode } = Horizon;
  let container = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    const persons = new Map([
      ['p1', 1],
      ['p2', 2],
    ]);

    createStore({
      id: 'user',
      state: {
        type: 'bing dun dun',
        persons: persons,
      },
      actions: {
        addOnePerson: (state, person) => {
          state.persons.set(person.name, person.age);
        },
        delOnePerson: (state, person) => {
          state.persons.delete(person.name);
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

  class Parent extends Horizon.Component {
    userStore = useStore('user');

    addOnePerson = () => {
      this.userStore.addOnePerson(newPerson);
    };
    delOnePerson = () => {
      this.userStore.delOnePerson(newPerson);
    };
    clearPersons = () => {
      this.userStore.clearPersons();
    };

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
          <div>{this.props.children}</div>
        </div>
      );
    }
  }

  it('测试Map方法: set()、delete()、clear()', () => {
    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        return (
          <div>
            <Text id={'size'} text={`persons number: ${this.userStore.$state.persons.size}`} />
          </div>
        );
      }
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#size').innerHTML).toBe('persons number: 2');
    // 在Map中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#size').innerHTML).toBe('persons number: 3');

    // 在Map中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#size').innerHTML).toBe('persons number: 2');

    // clear Map
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#size').innerHTML).toBe('persons number: 0');
  });

  it('测试Map方法: keys()', () => {
    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        const nameList = [];
        const keys = this.userStore.$state.persons.keys();
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

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear Map
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });

  it('测试Map方法: values()', () => {
    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        const ageList = [];
        const values = this.userStore.$state.persons.values();
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

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#ageList').innerHTML).toBe('age list: 1 2');
    // 在Map中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#ageList').innerHTML).toBe('age list: 1 2 3');

    // 在Map中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#ageList').innerHTML).toBe('age list: 1 2');

    // clear Map
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#ageList').innerHTML).toBe('age list: ');
  });

  it('测试Map方法: entries()', () => {
    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        const nameList = [];
        const entries = this.userStore.$state.persons.entries();
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

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear Map
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });

  it('测试Map方法: forEach()', () => {
    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        const nameList = [];
        this.userStore.$state.persons.forEach((val, key) => {
          nameList.push(key);
        });

        return (
          <div>
            <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
          </div>
        );
      }
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear Map
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });

  it('测试Map方法: has()', () => {
    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        return (
          <div>
            <Text id={'hasPerson'} text={`has new person: ${this.userStore.$state.persons.has(newPerson.name)}`} />
          </div>
        );
      }
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#hasPerson').innerHTML).toBe('has new person: false');
    // 在Map中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#hasPerson').innerHTML).toBe('has new person: true');
  });

  it('测试Map方法: for of()', () => {
    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        const nameList = [];
        for (const per of this.userStore.$state.persons) {
          nameList.push(per[0]);
        }

        return (
          <div>
            <Text id={'nameList'} text={`name list: ${nameList.join(' ')}`} />
          </div>
        );
      }
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');
    // 在Map中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2 p3');

    // 在Map中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: p1 p2');

    // clear Map
    Horizon.act(() => {
      triggerClickEvent(container, 'clearBtn');
    });
    expect(container.querySelector('#nameList').innerHTML).toBe('name list: ');
  });
});
