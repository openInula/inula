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

//@ts-ignore
import * as Inula from '../../../../src/index';
import {
  batch,
  connect,
  createStore,
  Provider,
  useDispatch,
  useSelector,
  useStore,
  createSelectorHook,
  createDispatchHook,
} from '../../../../src/inulax/adapters/redux';
import { triggerClickEvent } from '../../jest/commonComponents';
import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { ReduxStoreHandler } from '../../../../src/inulax/adapters/redux';

const BUTTON = 'button';
const BUTTON2 = 'button2';
const RESULT = 'result';
const CONTAINER = 'container';

function getE(id): HTMLElement {
  return document.getElementById(id) || document.body;
}

describe('Redux/React binding adapter', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    container.id = CONTAINER;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(getE(CONTAINER));
  });

  it('Should create provider context', async () => {
    const reduxStore = createStore((state = 'state', action) => state);

    const Child = () => {
      const store = useStore() as unknown as ReduxStoreHandler;
      return <div id={RESULT}>{store.getState()}</div>;
    };

    const Wrapper = () => {
      return (
        <Provider store={reduxStore}>
          <Child />
        </Provider>
      );
    };

    Inula.render(<Wrapper />, getE(CONTAINER));

    expect(getE(RESULT).innerHTML).toBe('state');
  });

  it('Should use dispatch', async () => {
    const reduxStore = createStore((state = 0, action) => {
      if (action.type === 'ADD') return state + 1;
      return state;
    });

    const Child = () => {
      const store = useStore() as unknown as ReduxStoreHandler;
      const dispatch = useDispatch();
      return (
        <div>
          <p id={RESULT}>{store.getState()}</p>
          <button
            id={BUTTON}
            onClick={() => {
              dispatch({ type: 'ADD' });
            }}
          ></button>
        </div>
      );
    };

    const Wrapper = () => {
      return (
        <Provider store={reduxStore}>
          <Child />
        </Provider>
      );
    };

    Inula.render(<Wrapper />, getE(CONTAINER));

    expect(reduxStore.getState()).toBe(0);

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
    });

    expect(reduxStore.getState()).toBe(1);
  });

  it('Should use selector', async () => {
    const reduxStore = createStore((state = 0, action) => {
      if (action.type === 'ADD') return state + 1;
      return state;
    });

    const Child = () => {
      const count = useSelector(state => state);
      const dispatch = useDispatch();
      return (
        <div>
          <p id={RESULT}>{count}</p>
          <button
            id={BUTTON}
            onClick={() => {
              dispatch({ type: 'ADD' });
            }}
          >
            click
          </button>
        </div>
      );
    };

    const Wrapper = () => {
      return (
        <Provider store={reduxStore}>
          <Child />
        </Provider>
      );
    };

    Inula.render(<Wrapper />, getE(CONTAINER));

    expect(getE(RESULT).innerHTML).toBe('0');

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
      triggerClickEvent(getE(CONTAINER), BUTTON);
    });

    expect(getE(RESULT).innerHTML).toBe('2');
  });

  it('Should use connect', async () => {
    const reduxStore = createStore(
      (state, action) => {
        switch (action.type) {
          case 'INCREMENT':
            return {
              ...state,
              value: state.negative ? state.value - action.amount : state.value + action.amount,
            };
          case 'TOGGLE':
            return {
              ...state,
              negative: !state.negative,
            };
          default:
            return state;
        }
      },
      { negative: false, value: 0 }
    );

    const Child = connect(
      (state, ownProps) => {
        // map state to props
        return { ...state, ...ownProps };
      },
      (dispatch, ownProps) => {
        // map dispatch to props
        return {
          // @ts-ignore
          increment: () => dispatch({ type: 'INCREMENT', amount: ownProps?.amount }),
        };
      },
      (stateProps, dispatchProps, ownProps) => {
        //merge props
        return { stateProps, dispatchProps, ownProps };
      },
      {}
    )(props => {
      const n = props.stateProps.negative;
      return (
        <div>
          <div id={RESULT}>
            {n ? '-' : '+'}
            {props.stateProps.value}
          </div>
          <button
            id={BUTTON}
            onClick={() => {
              props.dispatchProps.increment();
            }}
          >
            add {props.ownProps.amount}
          </button>
        </div>
      );
    });

    const Wrapper = () => {
      //@ts-ignore
      const [amount, setAmount] = Inula.useState(5);
      return (
        <Provider store={reduxStore}>
          <Child amount={amount} />
          <button
            id={BUTTON2}
            onClick={() => {
              setAmount(3);
            }}
          >
            change amount
          </button>
        </Provider>
      );
    };

    Inula.render(<Wrapper />, getE(CONTAINER));

    expect(getE(RESULT).innerHTML).toBe('+0');

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
    });

    expect(getE(RESULT).innerHTML).toBe('+5');

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON2);
    });

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
    });

    expect(getE(RESULT).innerHTML).toBe('+8');
  });

  it('Should batch dispatches', async () => {
    const reduxStore = createStore((state = 0, action) => {
      if (action.type == 'ADD') return state + 1;
      return state;
    });

    let renderCounter = 0;

    function Counter() {
      renderCounter++;

      const value = useSelector(state => state);
      const dispatch = useDispatch();

      return (
        <div>
          <p id={RESULT}>{value}</p>
          <button
            id={BUTTON}
            onClick={() => {
              batch(() => {
                for (let i = 0; i < 10; i++) {
                  dispatch({ type: 'ADD' });
                }
              });
            }}
          ></button>
        </div>
      );
    }

    Inula.render(
      <Provider store={reduxStore}>
        <Counter />
      </Provider>,
      getE(CONTAINER)
    );

    expect(getE(RESULT).innerHTML).toBe('0');
    expect(renderCounter).toBe(1);

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
    });

    expect(getE(RESULT).innerHTML).toBe('10');
    expect(renderCounter).toBe(2);
  });

  it('Should use multiple contexts', async () => {
    const counterStore = createStore((state = 0, action) => {
      if (action.type === 'ADD') return state + 1;
      return state;
    });

    const toggleStore = createStore((state = false, action) => {
      if (action.type === 'TOGGLE') return !state;
      return state;
    });

    const counterContext = Inula.createContext();
    const toggleContext = Inula.createContext();

    function Counter() {
      const count = createSelectorHook(counterContext)();
      const dispatch = createDispatchHook(counterContext)();

      return (
        <button
          id={BUTTON}
          onClick={() => {
            dispatch({ type: 'ADD' });
          }}
        >
          {count}
        </button>
      );
    }

    function Toggle() {
      const check = createSelectorHook(toggleContext)();
      const dispatch = createDispatchHook(toggleContext)();

      return (
        <button
          id={BUTTON2}
          onClick={() => {
            dispatch({ type: 'TOGGLE' });
          }}
        >
          {check ? 'true' : 'false'}
        </button>
      );
    }

    function Wrapper() {
      return (
        <div>
          <Provider store={counterStore} context={counterContext}>
            <Counter />
          </Provider>

          <Provider store={toggleStore} context={toggleContext}>
            <Toggle />
          </Provider>
        </div>
      );
    }

    Inula.render(<Wrapper />, getE(CONTAINER));

    expect(getE(BUTTON).innerHTML).toBe('0');
    expect(getE(BUTTON2).innerHTML).toBe('false');

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
      triggerClickEvent(getE(CONTAINER), BUTTON2);
    });

    expect(getE(BUTTON).innerHTML).toBe('1');
    expect(getE(BUTTON2).innerHTML).toBe('true');
  });

  it('Nested use of connect', () => {
    // Child Component
    const updateInfo = [];
    let dispatchMethod;
    const ChildComponent = ({ childData, dispatch }) => {
      const isMount = Inula.useRef(false);

      Inula.useEffect(() => {
        if (!isMount.current) {
          isMount.current = true;
        } else {
          updateInfo.push('ChildComponent Updated');
        }
      });
      dispatchMethod = dispatch;

      return (
        <div>
          <h2>Child Component</h2>
          <p id="child">{childData}</p>
        </div>
      );
    };

    const mapStateToPropsChild = state => ({
      childData: state.childData,
    });

    const Child = connect(mapStateToPropsChild)(ChildComponent);

    // Parent Component
    const ParentComponent = ({ parentData }) => {
      const isMount = Inula.useRef(false);

      Inula.useEffect(() => {
        if (!isMount.current) {
          isMount.current = true;
        } else {
          updateInfo.push('ParentComponent Updated');
        }
      });

      return (
        <div>
          <h1>Parent Component</h1>
          <p id="parent">{parentData}</p>
          <Child />
        </div>
      );
    };

    const mapStateToPropsParent = state => ({
      parentData: state.parentData,
    });

    const Parent = connect(mapStateToPropsParent)(ParentComponent);

    const initialState = {
      parentData: 0,
      childData: 0,
    };

    const reducer = (state = initialState, action) => {
      switch (action.type) {
        case 'INCREMENT_PARENT':
          return { ...state, parentData: state.parentData + 1 };
        case 'INCREMENT_CHILD':
          return { ...state, childData: state.childData + 1 };
        default:
          return state;
      }
    };

    const store = createStore(reducer);

    Inula.render(
      <Provider store={store}>
        <Parent />
      </Provider>,
      getE(CONTAINER)
    );

    expect(getE('child').innerHTML).toBe('0');
    expect(getE('parent').innerHTML).toBe('0');

    Inula.act(() => {
      dispatchMethod({ type: 'INCREMENT_CHILD' });
    });
    // store中的数据更新了，父元素没有订阅该数据，不触发父元素更新
    expect(updateInfo).toStrictEqual(['ChildComponent Updated']);

    expect(getE('child').innerHTML).toBe('1');
    expect(getE('parent').innerHTML).toBe('0');
  });
});
