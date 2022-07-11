import * as Horizon from '@cloudsop/horizon/index.ts';
import { clearStore, createStore, useStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';
import { App, Text, triggerClickEvent } from '../../jest/commonComponents';

describe('测试store中的WeakSet', () => {
  const { unmountComponentAtNode } = Horizon;
  let container = null;
  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    const persons = new WeakSet([
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
      const userStore = useStore('user');

      return (
        <div>
          <Text id={'hasPerson'} text={`has new person: ${userStore.$state.persons.has(newPerson)}`} />
        </div>
      );
    }

    Horizon.render(<App parent={Parent} child={Child} />, container);

    expect(container.querySelector('#hasPerson').innerHTML).toBe('has new person: false');
    // 在WeakSet中增加一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'addBtn');
    });
    expect(container.querySelector('#hasPerson').innerHTML).toBe('has new person: true');

    // 在WeakSet中删除一个对象
    Horizon.act(() => {
      triggerClickEvent(container, 'delBtn');
    });
    expect(container.querySelector('#hasPerson').innerHTML).toBe('has new person: false');
  });
});
