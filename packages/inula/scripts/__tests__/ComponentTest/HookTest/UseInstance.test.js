/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import Inula, { render, useEffect, act, useState } from '../../../../src/index';
import { useInstance } from '../../../../src/renderer/hooks/HookExternal';
import { useReactive } from '../../../../src/inulax/reactive/Reactive';

describe('useInstance Hook Test', () => {
  it('Should $vnode work', () => {
    let _instance;
    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return <div></div>;
    };
    render(<App name="app" />, container);

    expect(_instance.$vnode.props.name).toBe('app');
  });

  it('Should $el work', () => {
    let _instance;
    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return <div></div>;
    };
    render(<App name="app" />, container);

    expect(_instance.$el.outerHTML).toBe('<div></div>');
  });

  it('Should $el to find first dom', () => {
    const Child = () => {
      return <div>child</div>;
    };

    let _instance;
    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return (
        <>
          <div>dom</div>
          <Child></Child>
        </>
      );
    };
    render(<App name="app" />, container);

    expect(_instance.$el.outerHTML).toBe('<div>dom</div>');
  });

  it('Should $props work', () => {
    let _instance;
    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return <div></div>;
    };
    render(<App name="app" />, container);

    expect(_instance.$props.name).toBe('app');
  });

  it('Should $root work', () => {
    let _instance = null;
    const Child1 = () => (
      <div>
        child1: <Child2 />
      </div>
    );
    const Child2 = () => (
      <div>
        child2: <Child3 />
      </div>
    );
    const Child3 = () => {
      const instance = useInstance();
      _instance = instance;
      return <div>child3</div>;
    };

    const App = () => {
      return (
        <div id="root">
          <Child1 />
        </div>
      );
    };
    render(<App name="app" />, container);

    expect(_instance.$root.$el.id).toBe('root');
  });

  it('Should $children work', () => {
    let _instance;
    const Child1 = () => {
      return (
        <div>
          child1: <Child2 />
        </div>
      );
    };
    const Child2 = () => (
      <div>
        <div>dom</div>
        child2: <Child3 />
        <Child3>
          <Child1 />
        </Child3>
        <Child3 />
        <button>xxx</button>
      </div>
    );
    const Child3 = () => {
      return <div>child3</div>;
    };
    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return (
        <div id="root">
          <Child1 />
        </div>
      );
    };
    render(<App name="app" />, container);

    const appChildren = _instance.$children;
    expect(appChildren.length).toBe(1);
    const firstLevelChildren = appChildren[0].$children;
    expect(firstLevelChildren.length).toBe(1);
    const secondLevelChildren = firstLevelChildren[0].$children;
    expect(secondLevelChildren.length).toBe(3);
    expect(_instance.$children[0].$children[0].$children[0].$children.length).toBe(0);
  });

  it('Should $refs work', () => {
    let _instance;
    const Child1 = () => <div>child1</div>;
    const Child2 = () => {
      const instance = useInstance();
      return (
        <div>
          child2: <Child3 ref={val => (instance.$refs['child1'] = val)} />
          <Child3 ref={val => (instance.$refs['child2'] = val)} />
          <Child3 ref={val => (instance.$refs['child3'] = val)} />
          <div ref={val => (instance.$refs['div'] = val)}>div</div>
        </div>
      );
    };
    const Child3 = () => {
      return <div refs="child25">child3</div>;
    };

    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return (
        <div ref={val => (instance.$refs['root'] = val)} id="root">
          <Child1 ref={val => (instance.$refs['child1'] = val)} />
          <Child2 ref={val => (instance.$refs['child2'] = val)} />
          <button ref={val => (instance.$refs['button'] = val)} />
        </div>
      );
    };
    render(<App name="app" />, container);

    const refs = _instance.$refs;
    expect(Object.keys(refs).length).toBe(4);

    const firstChild = refs.child1.$refs;
    expect(Object.keys(firstChild).length).toBe(0);
    const secondChild = refs.child2.$refs;
    expect(Object.keys(secondChild).length).toBe(4);
    expect(secondChild.child1.$el.outerHTML).toBe('<div refs="child25">child3</div>');
    expect(secondChild.div.outerHTML).toBe('<div>div</div>');
  });

  it('Should $refs array work', () => {
    let _instance;

    const App = () => {
      const instance = useInstance();
      _instance = instance;

      const dataReactive = useReactive({
        todos: [
          {
            id: 1,
            text: '学习Vue',
          },
          {
            id: 2,
            text: '完成项目',
          },
          {
            id: 3,
            text: '准备面试',
          },
        ],
      });

      return (
        <div>
          <ul>
            {dataReactive.todos.map((todo, index) => {
              return (
                <li key={todo.id}>
                  <sapn ref={val => (instance.$refs['text' + index] = val)}>{todo.text}</sapn>
                </li>
              );
            })}
          </ul>
        </div>
      );
    };
    render(<App name="app" />, container);

    const refs = _instance.$refs;
    expect(Object.keys(refs).length).toBe(3);
    expect(refs.text0.outerHTML).toBe('<sapn>学习Vue</sapn>');
  });

  it('Should $refs work inside component ', () => {
    let _instance;
    const Child1 = props => {
      const instance = useInstance();
      return <div ref={val => (instance.$refs['div'] = val)}>{props.children}</div>;
    };

    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return (
        <div ref={val => (instance.$refs['root'] = val)} id="root">
          <Child1 ref={val => (instance.$refs['child'] = val)}>
            <button ref={val => (instance.$refs['button'] = val)}>btn</button>
          </Child1>
        </div>
      );
    };
    render(<App name="app" />, container);

    const refs = _instance.$refs;
    const keys = Object.keys(refs);
    expect(keys.length).toBe(3);
    expect(refs.button.outerHTML).toBe('<button>btn</button>');
    const childRefs = refs.child.$refs;
    expect(Object.keys(childRefs).length).toBe(1);
    expect(childRefs.div.outerHTML).toBe('<div><button>btn</button></div>');
  });

  it('Should $parent work', () => {
    let parent = null;
    const Comp = ({ children }) => {
      // throw Error('Inula instance:'+useInstance.toString());
      const instance = useInstance();

      function logParent() {
        parent = instance.$parent;
      }

      return (
        <p>
          <button class="logger" onClick={logParent}>
            {children}
          </button>
        </p>
      );
    };
    const App = () => {
      return (
        <div id="App">
          <Comp></Comp>
        </div>
      );
    };

    render(<App />, container);

    container.querySelector('.logger').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(parent.$el.id).toBe('App');
  });

  it('Should custom instance variables work', () => {
    let _instance;
    const Comp = () => {
      const instance = useInstance();
      instance.log = () => {
        return 42;
      };

      return <p>child</p>;
    };
    const App = () => {
      const instance = useInstance();
      _instance = instance;

      return (
        <div id="App">
          <div></div>
          <Comp></Comp>
        </div>
      );
    };
    render(<App />, container);

    expect(_instance.$children[0].log()).toBe(42);
  });

  it('Should useEffect set instance variables work', () => {
    let _instance;
    const Comp = () => {
      const instance = useInstance();

      useEffect(() => {
        instance.getData = () => {
          return 'Data from child component';
        };
      }, []);

      return <p>Child Component</p>;
    };

    let _setShow;
    const App = () => {
      const [show, setShow] = useState(true);
      _setShow = setShow;
      const instance = useInstance();
      _instance = instance;

      return <div id="App">{show && <Comp></Comp>}</div>;
    };

    act(() => {
      render(<App />, container);
    });

    expect(_instance.$children[0].getData()).toBe('Data from child component');

    _setShow(false);

    expect(_instance.$children.length).toBe(0);

    act(() => {
      _setShow(true);
    });

    expect(_instance.$children[0].getData()).toBe('Data from child component');
  });

  it('Should dataReactive variables work', () => {
    let _instance;
    const App = () => {
      const instance = useInstance();
      _instance = instance;
      const dataReactive = (instance.dataReactive = useReactive({
        name: 'dataReactive',
        text: 'hello',
      }));

      const updateName = () => {
        instance.name = 'update dataReactive';

        instance.dataReactive.text = 'hello inula';
      };

      return (
        <div>
          <div ref={val => (instance.$refs['name'] = val)}>{dataReactive.name}</div>
          <div ref={val => (instance.$refs['text'] = val)}>{dataReactive.text}</div>
          <button className="update" onClick={updateName}></button>
        </div>
      );
    };

    render(<App />, container);

    expect(_instance.$refs.name.innerHTML).toBe('dataReactive');

    act(() => {
      container.querySelector('.update').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(_instance.$refs.name.innerHTML).toBe('update dataReactive');

    expect(_instance.$refs.text.innerHTML).toBe('hello inula');
  });

  it('Should Object.prototype.hasOwnProperty.call and name in instance work', () => {
    let _instance;
    const App = () => {
      const instance = useInstance();
      _instance = instance;

      instance.name = 'dataReactive';

      return (
        <div>
          <div ref={val => (instance.$refs['name'] = val)}>{instance.name}</div>
        </div>
      );
    };

    render(<App />, container);

    expect(_instance.$refs.name.innerHTML).toBe('dataReactive');

    expect(Object.prototype.hasOwnProperty.call(_instance, 'name')).toBe(true);

    expect('name' in _instance).toBe(true);
  });
});
