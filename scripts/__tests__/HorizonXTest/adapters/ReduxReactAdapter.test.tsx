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
import {
  batch,
  connect,
  createStore,
  Provider,
  useDispatch,
  useSelector,
  useStore,
  createSelectorHook,
  createDispatchHook
} from '../../../../libs/inula/src/inulax/adapters/redux';
import {triggerClickEvent} from '../../jest/commonComponents';
import {describe, it, beforeEach, afterEach, expect} from '@jest/globals';
import { ReduxStoreHandler } from '../../../../libs/inula/src/inulax/adapters/redux';

const BUTTON = 'button';
const BUTTON2 = 'button2';
const RESULT = 'result';
const CONTAINER = 'container'

function getE(id):HTMLElement {
  return document.getElementById(id)||document.body;
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
      return <Provider store={reduxStore}>
        <Child/>
      </Provider>;
    };

    Inula.render(<Wrapper/>, getE(CONTAINER));

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
      return <div>
        <p id={RESULT}>{store.getState()}</p>
        <button id={BUTTON} onClick={() => {
          dispatch({type: 'ADD'});
        }}></button>
      </div>;
    };

    const Wrapper = () => {
      return <Provider store={reduxStore}>
        <Child/>
      </Provider>;
    };

    Inula.render(<Wrapper/>, getE(CONTAINER));

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
      const count = useSelector((state) => state);
      const dispatch = useDispatch();
      return <div>
        <p id={RESULT}>{count}</p>
        <button id={BUTTON} onClick={() => {
          dispatch({type: 'ADD'});
        }}>click
        </button>
      </div>;
    };

    const Wrapper = () => {
      return <Provider store={reduxStore}>
        <Child/>
      </Provider>;
    };

    Inula.render(<Wrapper/>, getE(CONTAINER));

    expect(getE(RESULT).innerHTML).toBe('0');

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
      triggerClickEvent(getE(CONTAINER), BUTTON);
    });

    expect(getE(RESULT).innerHTML).toBe('2');
  });

  it('Should use connect', async () => {
    const reduxStore = createStore((state, action) => {
      switch (action.type) {
        case('INCREMENT'):
          return {
            ...state,
            value: state.negative ? state.value - action.amount : state.value + action.amount
          };
        case('TOGGLE'):
          return {
            ...state,
            negative: !state.negative
          };
        default:
          return state;
      }
    }, {negative: false, value: 0});

    const Child = connect((state, ownProps) => {
      // map state to props
      return {...state, ...ownProps};
    }, (dispatch, ownProps) => {
      // map dispatch to props
      return {
        // @ts-ignore
        increment: () => dispatch({type: 'INCREMENT', amount: ownProps?.amount})
      };
    }, (stateProps, dispatchProps, ownProps) => {
      //merge props
      return {stateProps, dispatchProps, ownProps};
    }, {})((props) => {
      const n = props.stateProps.negative;
      return <div>
        <div id={RESULT}>{n ? '-' : '+'}{props.stateProps.value}</div>
        <button id={BUTTON} onClick={() => {
          props.dispatchProps.increment();
        }}>add {props.ownProps.amount}</button>
      </div>;
    });

    const Wrapper = () => {
      //@ts-ignore
      const [amount, setAmount] = Inula.useState(5);
      return <Provider store={reduxStore}>
        <Child amount={amount}/>
        <button id={BUTTON2} onClick={() => {
          setAmount(3);
        }}>change amount
        </button>
      </Provider>;
    };

    Inula.render(<Wrapper/>, getE(CONTAINER));

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
  })

  it('Should batch dispatches', async () => {
    const reduxStore = createStore((state = 0, action) => {
      if (action.type == 'ADD') return state + 1;
      return state;
    });

    let renderCounter = 0;

    function Counter() {
      renderCounter++;

      const value = useSelector((state) => state);
      const dispatch = useDispatch();

      return <div>
        <p id={RESULT}>{value}</p>
        <button id={BUTTON} onClick={() => {
          batch(() => {
            for (let i = 0; i < 10; i++) {
              dispatch({type: 'ADD'});
            }
          });
        }}></button>
      </div>;
    }

    Inula.render(<Provider store={reduxStore}><Counter/></Provider>, getE(CONTAINER));

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

      return <button id={BUTTON} onClick={() => {
        dispatch({type: 'ADD'});
      }}>{count}</button>;
    }

    function Toggle() {
      const check = createSelectorHook(toggleContext)();
      const dispatch = createDispatchHook(toggleContext)();

      return <button id={BUTTON2} onClick={() => {
        dispatch({type: 'TOGGLE'});
      }}>{check ? 'true' : 'false'}</button>;
    }

    function Wrapper() {
      return <div>
        <Provider store={counterStore} context={counterContext}>
          <Counter/>
        </Provider>

        <Provider store={toggleStore} context={toggleContext}>
          <Toggle/>
        </Provider>
      </div>;
    }

    Inula.render(<Wrapper/>, getE(CONTAINER));

    expect(getE(BUTTON).innerHTML).toBe('0');
    expect(getE(BUTTON2).innerHTML).toBe('false');

    Inula.act(() => {
      triggerClickEvent(getE(CONTAINER), BUTTON);
      triggerClickEvent(getE(CONTAINER), BUTTON2);
    });

    expect(getE(BUTTON).innerHTML).toBe('1');
    expect(getE(BUTTON2).innerHTML).toBe('true');
  });
});
