import Inula, { computed, createRef, reactive, watchReactive } from '../../../../src/index';
import { template as _$template, insert as _$insert, setAttribute as _$setAttribute } from '../../../../src/no-vnode/dom';
import { createComponent as _$createComponent, render } from '../../../../src/no-vnode/core';
import { delegateEvents as _$delegateEvents, addEventListener as _$addEventListener } from '../../../../src/no-vnode/event';

import { Show } from '../../../../src/no-vnode/components/Show';
import { For } from '../../../../src/no-vnode/components/For';

describe('测试 no-vnode', () => {
  it('简单的使用signal', () => {
    /**
     * 源码：
     * const CountingComponent = () => {
     *  const [count, setCount] = useSignal(0);
     *
     *  return <div id="count">Count value is {count()}.</div>;
     * };
     *
     * render(() => <CountingComponent />, container);
     */

    let g_count;

    // 编译后：
    const _tmpl$ = /*#__PURE__*/ _$template(`<div id="count">Count value is <!>.`);
    const CountingComponent = () => {
      const count = reactive(0);
      g_count = count;

      return (() => {
        const _el$ = _tmpl$(),
          _el$2 = _el$.firstChild,
          _el$4 = _el$2.nextSibling,
          _el$3 = _el$4.nextSibling;
        _$insert(_el$, count, _el$4);
        return _el$;
      })();
    };
    render(() => _$createComponent(CountingComponent, {}), container);

    _$delegateEvents(['click']);

    expect(container.querySelector('#count').innerHTML).toEqual('Count value is 0<!---->.');

    g_count.set(c => c + 1);

    expect(container.querySelector('#count').innerHTML).toEqual('Count value is 1<!---->.');
  });

  it('return数组，click事件', () => {
    /**
     * 源码：
     * const CountingComponent = () => {
     *  const [count, setCount] = createSignal(0);
     *  const add = () => {
     *    setCount((c) => c + 1);
     *  }
     *  return <>
     *    <div id="count">Count value is {count()}.</div>
     *    <div><button onClick={add}>add</button></div>
     *  </>;
     * };
     */

    // 编译后：
    const _tmpl$ = /*#__PURE__*/ _$template(`<div id="count">Count value is <!>.`),
      _tmpl$2 = /*#__PURE__*/ _$template(`<div><button id="btn">add`);
    const CountingComponent = () => {
      const count = reactive(0);
      const add = () => {
        count.set(c => c + 1);
      };
      return [
        (() => {
          const _el$ = _tmpl$(),
            _el$2 = _el$.firstChild,
            _el$4 = _el$2.nextSibling,
            _el$3 = _el$4.nextSibling;
          _$insert(_el$, count, _el$4);
          return _el$;
        })(),
        (() => {
          const _el$5 = _tmpl$2(),
            _el$6 = _el$5.firstChild;
          _el$6.$$click = add;
          return _el$5;
        })(),
      ];
    };
    render(() => _$createComponent(CountingComponent, {}), container);

    _$delegateEvents(['click']);

    container.querySelector('#btn').click();

    expect(container.querySelector('#count').innerHTML).toEqual('Count value is 1<!---->.');
  });

  it('return 自定义组件', () => {
    /**
     * 源码：
     * const CountValue = (props) => {
     *   return <div>Count value is {props.count} .</div>;
     * }
     *
     * const CountingComponent = () => {
     *  const [count, setCount] = createSignal(0);
     *  const add = () => {
     *       setCount((c) => c + 1);
     *     }
     *
     *  return <div>
     *      <CountValue count={count} />
     *    <div><button onClick={add}>add</button></div>
     *    </div>;
     * };
     *
     * render(() => <CountingComponent />, document.getElementById("app"));
     */

    // 编译后：
    const _tmpl$ = /*#__PURE__*/ _$template(`<div id="count">Count value is <!>.`),
      _tmpl$2 = /*#__PURE__*/ _$template(`<div><div><button id="btn">add`);
    const CountValue = props => {
      return (() => {
        const _el$ = _tmpl$(),
          _el$2 = _el$.firstChild,
          _el$4 = _el$2.nextSibling,
          _el$3 = _el$4.nextSibling;
        _$insert(_el$, () => props.count, _el$4);
        return _el$;
      })();
    };
    const CountingComponent = () => {
      const count = reactive(0);
      const add = () => {
        count.set(c => c + 1);
      };
      return (() => {
        const _el$5 = _tmpl$2(),
          _el$6 = _el$5.firstChild,
          _el$7 = _el$6.firstChild;
        _$insert(
          _el$5,
          _$createComponent(CountValue, {
            count: count,
          }),
          _el$6
        );
        _el$7.$$click = add;
        return _el$5;
      })();
    };
    render(() => _$createComponent(CountingComponent, {}), container);
    _$delegateEvents(['click']);

    container.querySelector('#btn').click();

    expect(container.querySelector('#count').innerHTML).toEqual('Count value is 1<!---->.');
  });

  it('使用Show组件', () => {
    /**
     * 源码：
     * const CountValue = (props) => {
     *   return <div id="count">Count value is {props.count()}.</div>;
     * }
     *
     * const CountingComponent = () => {
     *  const [count, setCount] = createSignal(0);
     *  const add = () => {
     *       setCount((c) => c + 1);
     *     }
     *
     *  return <div>
     *    <Show when={count() > 0} fallback={<CountValue count={999} />}>
     *      <CountValue count={count} />
     *    </Show>
     *    <div><button id="btn" onClick={add}>add</button></div>
     *    </div>;
     * };
     *
     * render(() => <CountingComponent />, document.getElementById("app"));
     */

    // 编译后：
    const _tmpl$ = /*#__PURE__*/ _$template(`<div id="count">Count value is <!>.`),
      _tmpl$2 = /*#__PURE__*/ _$template(`<div><div><button id="btn">add`);
    const CountValue = props => {
      return (() => {
        const _el$ = _tmpl$(),
          _el$2 = _el$.firstChild,
          _el$4 = _el$2.nextSibling,
          _el$3 = _el$4.nextSibling;
        _$insert(_el$, () => props.count, _el$4);
        return _el$;
      })();
    };
    const CountingComponent = () => {
      const count = reactive(0);
      const add = () => {
        count.set(c => c + 1);
      };
      return (() => {
        const _el$5 = _tmpl$2(),
          _el$6 = _el$5.firstChild,
          _el$7 = _el$6.firstChild;
        _$insert(
          _el$5,
          _$createComponent(Show, {
            get if() {
              return computed(() => count.get() > 0);
            },
            get else() {
              return _$createComponent(CountValue, {
                count: 999,
              });
            },
            get children() {
              return _$createComponent(CountValue, {
                count: count,
              });
            },
          }),
          _el$6
        );
        _el$7.$$click = add;
        return _el$5;
      })();
    };
    render(() => _$createComponent(CountingComponent, {}), container);
    _$delegateEvents(['click']);

    expect(container.querySelector('#count').innerHTML).toEqual('Count value is 999<!---->.');

    container.querySelector('#btn').click();

    expect(container.querySelector('#count').innerHTML).toEqual('Count value is 1<!---->.');
  });

  it('使用For组件', () => {
    /**
     * 源码：
     * const Todo = (props) => {
     *   return <div>Count value is {props.todo.title}.</div>;
     * }
     *
     * const CountingComponent = () => {
     *  const [state, setState] = createStore({
     *    counter: 2,
     *    todoList: [
     *      { id: 23, title: 'Birds' },
     *      { id: 27, title: 'Fish' }
     *    ]
     *  });
     *
     *  const add = () => {
     *    setState('todoList', () => {
     *      return [
     *        { id: 23, title: 'Birds' },
     *        { id: 27, title: 'Fish' },
     *        { id: 27, title: 'Cat' }
     *      ];
     *    });
     *  }
     *
     *  const push = () => {
     *         state.todoList.push({
     *           id: 27,
     *           title: 'Pig',
     *         },);
     *       };
     *
     *  return <div>
     *    <div id="todos">
     *      <For each={state.todoList}>
     *        {todo => <><Todo todo={todo} /><Todo todo={todo} /></>}
     *      </For>
     *    </div>
     *    <div><button id="btn" onClick={add}>add</button></div>
     *    <div><button id="btn-push" onClick={push}>push</button></div>
     *    </div>;
     * };
     *
     * render(() => <CountingComponent />, document.getElementById("app"));
     */

    // 编译后：
    const _tmpl$ = /*#__PURE__*/_$template(`<div>Count value is <!>.`),
      _tmpl$2 = /*#__PURE__*/_$template(`<div><div id="todos"></div><div><button id="btn">add</button></div><div><button id="btn-push">push`);
    const Todo = props => {
      return (() => {
        const _el$ = _tmpl$(),
          _el$2 = _el$.firstChild,
          _el$4 = _el$2.nextSibling,
          _el$3 = _el$4.nextSibling;
        _$insert(_el$, () => props.todo.title, _el$4);
        return _el$;
      })();
    };
    const CountingComponent = () => {
      const state = reactive({
        counter: 2,
        todoList: [
          {
            id: 23,
            title: 'Birds',
          },
          {
            id: 27,
            title: 'Fish',
          },
        ],
      });
      const add = () => {
        state.todoList.set(() => {
          return [
            {
              id: 23,
              title: 'Birds',
            },
            {
              id: 27,
              title: 'Fish',
            },
            {
              id: 27,
              title: 'Cat',
            },
          ];
        });
      };

      const push = () => {
        state.todoList.push({
          id: 27,
          title: 'Pig',
        },);
      };
      return (() => {
        const _el$5 = _tmpl$2(),
          _el$6 = _el$5.firstChild,
          _el$7 = _el$6.nextSibling,
          _el$8 = _el$7.firstChild,
          _el$9 = _el$7.nextSibling,
          _el$10 = _el$9.firstChild;
        _$insert(
          _el$6,
          _$createComponent(For, {
            get each() {
              return state.todoList;
            },
            children: todo => [
              _$createComponent(Todo, {
                todo: todo,
              }),
              _$createComponent(Todo, {
                todo: todo,
              }),
            ],
          })
        );
        _el$8.$$click = add;
        _el$10.$$click = push;
        return _el$5;
      })();
    };
    render(() => _$createComponent(CountingComponent, {}), container);
    _$delegateEvents(['click']);

    expect(container.querySelector('#todos').innerHTML).toEqual(
      '<div>Count value is Birds<!---->.</div><div>Count value is Birds<!---->.</div><div>Count value is Fish<!---->.</div><div>Count value is Fish<!---->.</div>'
    );

    container.querySelector('#btn').click();

    expect(container.querySelector('#todos').innerHTML).toEqual(
      '<div>Count value is Birds<!---->.</div><div>Count value is Birds<!---->.</div><div>Count value is Fish<!---->.</div><div>Count value is Fish<!---->.</div><div>Count value is Cat<!---->.</div><div>Count value is Cat<!---->.</div>'
    );

    container.querySelector('#btn-push').click();

    expect(container.querySelector('#todos').innerHTML).toEqual(
      '<div>Count value is Birds<!---->.</div><div>Count value is Birds<!---->.</div><div>Count value is Fish<!---->.</div><div>Count value is Fish<!---->.</div><div>Count value is Cat<!---->.</div><div>Count value is Cat<!---->.</div><div>Count value is Pig<!---->.</div><div>Count value is Pig<!---->.</div>'
    );
  });

  it('使用effect, setAttribute, addEventListener', () => {
    /**
     * 源码：
     * const A = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean',
     *   'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive',
     *   'cheap', 'expensive', 'fancy'];
     *
     * const random = (max: any) => Math.round(Math.random() * 1000) % max;
     *
     * let nextId = 1;
     *
     * function buildData(count: number) {
     *   let data = new Array(count);
     *
     *   for (let i = 0; i < count; i++) {
     *     data[i] = {
     *       id: nextId++,
     *       label: `${A[random(A.length)]}`,
     *     }
     *   }
     *   return data;
     * }
     *
     * const Row = (props) => {
     *   const selected = createMemo(() => {
     *     return props.item.selected ? 'danger' : '';
     *   });
     *
     *   return (
     *     <tr class={selected()}>
     *       <td class="col-md-1">{props.item.label}</td>
     *     </tr>
     *   )
     * };
     *
     * const RowList = (props) => {
     *   return <For each={props.list}>
     *     {(item) => <Row item={item}/>}
     *   </For>;
     * };
     *
     * const Button = (props) => (
     *   <div class="col-sm-6">
     *     <button type="button" id={props.id} onClick={props.cb}>{props.title}</button>
     *   </div>
     * );
     *
     * const Main = () => {
     *  const [state, setState] = createStore({data: [{id: 1, label: '111', selected: false}, {id: 2, label: '222', selected: false}], num: 2});
     *
     *  function run() {
     *    setState('data', buildData(5));
     *  }
     *
     *   return (
     *     <div>
     *       <div>
     *         <div>
     *           <div><h1>Horizon-reactive-novnode</h1></div>
     *           <div>
     *             <div>
     *               <Button id="run" title="Create 1,000 rows" cb={run}/>
     *             </div>
     *           </div>
     *         </div>
     *       </div>
     *       <table>
     *         <tbody id="tbody"><RowList list={state.data}/></tbody>
     *       </table>
     *     </div>
     *   );
     * };
     *
     * render(() => <Main />, document.getElementById("app"));
     */

      // 编译后：
    const _tmpl$ = /*#__PURE__*/_$template(`<tr><td class="col-md-1">`),
      _tmpl$2 = /*#__PURE__*/_$template(`<div class="col-sm-6"><button type="button">`),
      _tmpl$3 = /*#__PURE__*/_$template(`<div><div><div><div><h1>Horizon-reactive-novnode</h1></div><div><div></div></div></div></div><table><tbody id="tbody">`);
    const A = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive', 'cheap', 'expensive', 'fancy'];
    const random = max => Math.round(Math.random() * 1000) % max;
    let nextId = 1;
    function buildData(count) {
      let data = new Array(count);
      for (let i = 0; i < count; i++) {
        data[i] = {
          id: nextId++,
          label: `${A[random(A.length)]}`
        };
      }
      return data;
    }
    const Row = props => {
      const selected = computed(() => {
        return props.item.selected.get() ? "danger" : "";
      });

      return (() => {
        const _el$ = _tmpl$(),
          _el$2 = _el$.firstChild;
        _$insert(_el$2, () => props.item.label);
        return _el$;
      })();
    };
    const RowList = props => {
      return _$createComponent(For, {
        get each() {
          return props.list;
        },
        children: item => _$createComponent(Row, {
          item: item
        })
      });
    };
    const Button = props => (() => {
      const _el$3 = _tmpl$2(),
        _el$4 = _el$3.firstChild;
      _$addEventListener(_el$4, "click", props.cb, true);
      _$insert(_el$4, () => props.title);
      watchReactive(() => _$setAttribute(_el$4, "id", props.id));
      return _el$3;
    })();
    const Main = () => {
      const state = reactive({
        list: [{
          id: 1,
          label: '111'
        }, {
          id: 2,
          label: '222'
        }],
        num: 2
      });
      function run() {
        state.list.set(buildData(5));
      }
      return (() => {
        const _el$5 = _tmpl$3(),
          _el$6 = _el$5.firstChild,
          _el$7 = _el$6.firstChild,
          _el$8 = _el$7.firstChild,
          _el$9 = _el$8.nextSibling,
          _el$10 = _el$9.firstChild,
          _el$11 = _el$6.nextSibling,
          _el$12 = _el$11.firstChild;
        _$insert(_el$10, _$createComponent(Button, {
          id: "run",
          title: "Create 1,000 rows",
          cb: run
        }));
        _$insert(_el$12, _$createComponent(RowList, {
          get list() {
            return state.list;
          }
        }));
        return _el$5;
      })();
    };
    render(() => _$createComponent(Main, {}), container);
    _$delegateEvents(["click"]);

    expect(container.querySelector('#tbody').innerHTML).toEqual(
      '<tr><td class="col-md-1">111</td></tr><tr><td class="col-md-1">222</td></tr>'
    );

    container.querySelector('#run').click();

    expect(container.querySelector('#tbody').children.length).toEqual(5);
  });
});
