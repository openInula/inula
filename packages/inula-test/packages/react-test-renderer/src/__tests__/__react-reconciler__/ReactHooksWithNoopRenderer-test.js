/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

/* eslint-disable no-func-assign */

'use strict';

let React;
let textCache;
let readText;
let resolveText;
let ReactNoop;
let Scheduler;
let Suspense;
let useState;
let useReducer;
let useEffect;
let useLayoutEffect;
let useCallback;
let useMemo;
let useRef;
let useImperativeHandle;
let forwardRef;
let memo;
let act;

describe('ReactHooksWithNoopRenderer', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    ReactNoop = require('react-noop-renderer');
    React = require('horizon-external');
    Scheduler = require('scheduler');
    useState = React.useState;
    useReducer = React.useReducer;
    useEffect = React.useEffect;
    useLayoutEffect = React.useLayoutEffect;
    useCallback = React.useCallback;
    useMemo = React.useMemo;
    useRef = React.useRef;
    useImperativeHandle = React.useImperativeHandle;
    forwardRef = React.forwardRef;
    memo = React.memo;
    Suspense = React.Suspense;
    act = ReactNoop.act;

    textCache = new Map();

    readText = text => {
      const record = textCache.get(text);
      if (record !== undefined) {
        switch (record.status) {
          case 'pending':
            throw record.promise;
          case 'rejected':
            throw Error('Failed to load: ' + text);
          case 'resolved':
            return text;
        }
      } else {
        let ping;
        const promise = new Promise(resolve => (ping = resolve));
        const newRecord = {
          status: 'pending',
          ping: ping,
          promise,
        };
        textCache.set(text, newRecord);
        throw promise;
      }
    };

    resolveText = text => {
      const record = textCache.get(text);
      if (record !== undefined) {
        if (record.status === 'pending') {
          Scheduler.unstable_yieldValue(`Promise resolved [${text}]`);
          record.ping();
          record.ping = null;
          record.status = 'resolved';
          clearTimeout(record.promise._timer);
          record.promise = null;
        }
      } else {
        const newRecord = {
          ping: null,
          status: 'resolved',
          promise: null,
        };
        textCache.set(text, newRecord);
      }
    };
  });

  function span(prop) {
    return {type: 'span', hidden: false, children: [], prop};
  }

  function Text(props) {
    Scheduler.unstable_yieldValue(props.text);
    return <span prop={props.text} />;
  }

  it('throws inside class components', () => {
    class BadCounter extends React.Component {
      render() {
        const [count] = useState(0);
        return <Text text={this.props.label + ': ' + count} />;
      }
    }

    // expect(() => {
    //   ReactNoop.render(<BadCounter />);
    // }).toThrow(
    //   'Invalid hook call. Hooks can only be called inside of the body of a function component.' + '\n' +
    //   'You might be breaking the Rules of Hooks\n',
    // );

    // Confirm that a subsequent hook works properly.
    function GoodCounter(props, ref) {
      const [count] = useState(props.initialCount);
      return <Text text={count} />;
    }
    ReactNoop.render(<GoodCounter initialCount={10} />);
    expect(Scheduler).toHaveYielded([10]);
  });

  it('throws inside module-style components', () => {
    // Confirm that a subsequent hook works properly.
    function GoodCounter(props) {
      const [count] = useState(props.initialCount);
      return <Text text={count} />;
    }
    ReactNoop.render(<GoodCounter initialCount={10} />);
    expect(Scheduler).toHaveYielded([10]);
  });

  xit('throws when called outside the render phase', () => {
    expect(() => useState(0)).toThrow(
      'Invalid hook call.',
    );
  });

  describe('useState', () => {
    it('simple mount and update', () => {
      function Counter(props, ref) {
        const [count, updateCount] = useState(0);
        useImperativeHandle(ref, () => ({updateCount}));
        return <Text text={'Count: ' + count} />;
      }
      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      act(() => counter.current.updateCount(1));
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);

      act(() => counter.current.updateCount(count => count + 10));
      expect(Scheduler).toHaveYielded(['Count: 11']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 11')]);
    });

    it('lazy state initializer', () => {
      function Counter(props, ref) {
        const [count, updateCount] = useState(() => {
          Scheduler.unstable_yieldValue('getInitialState');
          return props.initialState;
        });
        useImperativeHandle(ref, () => ({updateCount}));
        return <Text text={'Count: ' + count} />;
      }
      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter initialState={42} ref={counter} />);
      expect(Scheduler).toHaveYielded(['getInitialState', 'Count: 42']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 42')]);

      act(() => counter.current.updateCount(7));
      expect(Scheduler).toHaveYielded(['Count: 7']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 7')]);
    });

    it('multiple states', () => {
      function Counter(props, ref) {
        const [count, updateCount] = useState(0);
        const [label, updateLabel] = useState('Count');
        useImperativeHandle(ref, () => ({updateCount, updateLabel}));
        return <Text text={label + ': ' + count} />;
      }
      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      act(() => counter.current.updateCount(7));
      expect(Scheduler).toHaveYielded(['Count: 7']);

      act(() => counter.current.updateLabel('Total'));
      expect(Scheduler).toHaveYielded(['Total: 7']);
    });

    it('returns the same updater function every time', () => {
      let updater = null;
      function Counter() {
        const [count, updateCount] = useState(0);
        updater = updateCount;
        return <Text text={'Count: ' + count} />;
      }
      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      const firstUpdater = updater;

      act(() => firstUpdater(1));
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);

      const secondUpdater = updater;

      act(() => firstUpdater(count => count + 10));
      expect(Scheduler).toHaveYielded(['Count: 11']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 11')]);

      expect(firstUpdater).toBe(secondUpdater);
    });

    it('works with memo', () => {
      let _updateCount;
      function Counter(props) {
        const [count, updateCount] = useState(0);
        _updateCount = updateCount;
        return <Text text={'Count: ' + count} />;
      }
      Counter = memo(Counter);

      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded([]);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      act(() => _updateCount(1));
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
    });
  });

  describe('updates during the render phase', () => {
    xit('restarts the render function and applies the new updates on top', () => {
      function ScrollView({row: newRow}) {
        const [isScrollingDown, setIsScrollingDown] = useState(false);
        const [row, setRow] = useState(null);

        if (row !== newRow) {
          // Row changed since last render. Update isScrollingDown.
          setIsScrollingDown(row !== null && newRow > row);
          setRow(newRow);
        }

        return <Text text={`Scrolling down: ${isScrollingDown}`} />;
      }

      ReactNoop.render(<ScrollView row={1} />);
      expect(Scheduler).toHaveYielded(['Scrolling down: false']);
      expect(ReactNoop.getChildren()).toEqual([span('Scrolling down: false')]);

      ReactNoop.render(<ScrollView row={5} />);
      expect(Scheduler).toHaveYielded(['Scrolling down: true']);
      expect(ReactNoop.getChildren()).toEqual([span('Scrolling down: true')]);

      ReactNoop.render(<ScrollView row={5} />);
      expect(Scheduler).toHaveYielded(['Scrolling down: true']);
      expect(ReactNoop.getChildren()).toEqual([span('Scrolling down: true')]);

      ReactNoop.render(<ScrollView row={10} />);
      expect(Scheduler).toHaveYielded(['Scrolling down: true']);
      expect(ReactNoop.getChildren()).toEqual([span('Scrolling down: true')]);

      ReactNoop.render(<ScrollView row={2} />);
      expect(Scheduler).toHaveYielded(['Scrolling down: false']);
      expect(ReactNoop.getChildren()).toEqual([span('Scrolling down: false')]);

      ReactNoop.render(<ScrollView row={2} />);
      expect(Scheduler).toHaveYielded(['Scrolling down: false']);
      expect(ReactNoop.getChildren()).toEqual([span('Scrolling down: false')]);
    });

    xit('keeps restarting until there are no more new updates', () => {
      function Counter({row: newRow}) {
        const [count, setCount] = useState(0);
        if (count < 3) {
          setCount(count + 1);
        }
        Scheduler.unstable_yieldValue('Render: ' + count);
        return <Text text={count} />;
      }

      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded([
        'Render: 0',
        'Render: 1',
        'Render: 2',
        'Render: 3',
        3,
      ]);
      expect(ReactNoop.getChildren()).toEqual([span(3)]);
    });

    xit('updates multiple times within same render function', () => {
      function Counter({row: newRow}) {
        const [count, setCount] = useState(0);
        if (count < 12) {
          setCount(c => c + 1);
          setCount(c => c + 1);
          setCount(c => c + 1);
        }
        Scheduler.unstable_yieldValue('Render: ' + count);
        return <Text text={count} />;
      }

      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded([
        // Should increase by three each time
        'Render: 0',
        'Render: 3',
        'Render: 6',
        'Render: 9',
        'Render: 12',
        12,
      ]);
      expect(ReactNoop.getChildren()).toEqual([span(12)]);
    });

    xit('throws after too many iterations', () => {
      function Counter({row: newRow}) {
        const [count, setCount] = useState(0);
        setCount(count + 1);
        Scheduler.unstable_yieldValue('Render: ' + count);
        return <Text text={count} />;
      }

      expect(() => {
        ReactNoop.render(<Counter />);
      }).toThrow(
        'Limits the number of renders to prevent infinite loop.',
      );
    });

    xit('works with useReducer', () => {
      function reducer(state, action) {
        return action === 'increment' ? state + 1 : state;
      }
      function Counter({row: newRow}) {
        const [count, dispatch] = useReducer(reducer, 0);
        if (count < 3) {
          dispatch('increment');
        }
        Scheduler.unstable_yieldValue('Render: ' + count);
        return <Text text={count} />;
      }

      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded([
        'Render: 0',
        'Render: 1',
        'Render: 2',
        'Render: 3',
        3,
      ]);
      expect(ReactNoop.getChildren()).toEqual([span(3)]);
    });

    xit('uses reducer passed at time of render, not time of dispatch', () => {
      // This test is a bit contrived but it demonstrates a subtle edge case.

      // Reducer A increments by 1. Reducer B increments by 10.
      function reducerA(state, action) {
        switch (action) {
          case 'increment':
            return state + 1;
          case 'reset':
            return 0;
        }
      }
      function reducerB(state, action) {
        switch (action) {
          case 'increment':
            return state + 10;
          case 'reset':
            return 0;
        }
      }

      function Counter({row: newRow}, ref) {
        const [reducer, setReducer] = useState(() => reducerA);
        const [count, dispatch] = useReducer(reducer, 0);
        useImperativeHandle(ref, () => ({dispatch}));
        if (count < 20) {
          dispatch('increment');
          // Swap reducers each time we increment
          if (reducer === reducerA) {
            setReducer(() => reducerB);
          } else {
            setReducer(() => reducerA);
          }
        }
        Scheduler.unstable_yieldValue('Render: ' + count);
        return <Text text={count} />;
      }
      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded([
        // The count should increase by alternating amounts of 10 and 1
        // until we reach 21.
        'Render: 0',
        'Render: 10',
        'Render: 11',
        'Render: 21',
        21,
      ]);
      expect(ReactNoop.getChildren()).toEqual([span(21)]);
    });

    // Concurrent
    xit('discards render phase updates if something suspends', async () => {
      const thenable = {then() {}};
      function Foo({signal}) {
        return (
          <Suspense fallback="Loading...">
            <Bar signal={signal} />
          </Suspense>
        );
      }

      function Bar({signal: newSignal}) {
        const [counter, setCounter] = useState(0);
        const [signal, setSignal] = useState(true);

        // Increment a counter every time the signal changes
        if (signal !== newSignal) {
          setCounter(c => c + 1);
          setSignal(newSignal);
          if (counter === 0) {
            // We're suspending during a render that includes render phase
            // updates. Those updates should not persist to the next render.
            Scheduler.unstable_yieldValue('Suspend!');
            throw thenable;
          }
        }

        return <Text text={counter} />;
      }

      const root = ReactNoop.createRoot();
      root.render(<Foo signal={true} />);

      expect(Scheduler).toFlushAndYield([0]);
      expect(root).toMatchRenderedOutput(<span prop={0} />);

      root.render(<Foo signal={false} />);
      expect(Scheduler).toFlushAndYield(['Suspend!']);
      expect(root).toMatchRenderedOutput(<span prop={0} />);

      // Rendering again should suspend again.
      root.render(<Foo signal={false} />);
      expect(Scheduler).toFlushAndYield(['Suspend!']);
    });

    // Concurrent
    xit('regression: render phase updates cause lower pri work to be dropped', async () => {
      let setRow;
      function ScrollView() {
        const [row, _setRow] = useState(10);
        setRow = _setRow;

        const [scrollDirection, setScrollDirection] = useState('Up');
        const [prevRow, setPrevRow] = useState(null);

        if (prevRow !== row) {
          setScrollDirection(prevRow !== null && row > prevRow ? 'Down' : 'Up');
          setPrevRow(row);
        }

        return <Text text={scrollDirection} />;
      }

      const root = ReactNoop.createRoot();

      await act(async () => {
        root.render(<ScrollView row={10} />);
      });
      expect(Scheduler).toHaveYielded(['Up']);
      expect(root).toMatchRenderedOutput(<span prop="Up" />);

      await act(async () => {
        ReactNoop.discreteUpdates(() => {
          setRow(5);
        });
        setRow(20);
      });
      expect(Scheduler).toHaveYielded(['Up', 'Down']);
      expect(root).toMatchRenderedOutput(<span prop="Down" />);
    });
  });

  describe('useReducer', () => {
    it('simple mount and update', () => {
      const INCREMENT = 'INCREMENT';
      const DECREMENT = 'DECREMENT';

      function reducer(state, action) {
        switch (action) {
          case 'INCREMENT':
            return state + 1;
          case 'DECREMENT':
            return state - 1;
          default:
            return state;
        }
      }

      function Counter(props, ref) {
        const [count, dispatch] = useReducer(reducer, 0);
        useImperativeHandle(ref, () => ({dispatch}));
        return <Text text={'Count: ' + count} />;
      }
      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      act(() => counter.current.dispatch(INCREMENT));
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      act(() => {
        counter.current.dispatch(DECREMENT);
        counter.current.dispatch(DECREMENT);
        counter.current.dispatch(DECREMENT);
      });

      expect(Scheduler).toHaveYielded(['Count: -2']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: -2')]);
    });

    it('lazy init', () => {
      const INCREMENT = 'INCREMENT';
      const DECREMENT = 'DECREMENT';

      function reducer(state, action) {
        switch (action) {
          case 'INCREMENT':
            return state + 1;
          case 'DECREMENT':
            return state - 1;
          default:
            return state;
        }
      }

      function Counter(props, ref) {
        const [count, dispatch] = useReducer(reducer, props, p => {
          Scheduler.unstable_yieldValue('Init');
          return p.initialCount;
        });
        useImperativeHandle(ref, () => ({dispatch}));
        return <Text text={'Count: ' + count} />;
      }
      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter initialCount={10} ref={counter} />);
      expect(Scheduler).toHaveYielded(['Init', 'Count: 10']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 10')]);

      act(() => counter.current.dispatch(INCREMENT));
      expect(Scheduler).toHaveYielded(['Count: 11']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 11')]);

      act(() => {
        counter.current.dispatch(DECREMENT);
        counter.current.dispatch(DECREMENT);
        counter.current.dispatch(DECREMENT);
      });

      expect(Scheduler).toHaveYielded(['Count: 8']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 8')]);
    });
  });

  describe('useEffect', () => {
    it('simple mount and update', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Passive effect [${props.count}]`);
        });
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
        // Effects are deferred until after the commit
        expect(Scheduler).toFlushAndYield(['Passive effect [0]']);
      });

      act(() => {
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
        // Effects are deferred until after the commit
        expect(Scheduler).toFlushAndYield(['Passive effect [1]']);
      });
    });

    it('flushes passive effects even with sibling deletions', () => {
      function LayoutEffect(props) {
        useLayoutEffect(() => {
          Scheduler.unstable_yieldValue(`Layout effect`);
        });
        return <Text text="Layout" />;
      }
      function PassiveEffect(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Passive effect`);
        }, []);
        return <Text text="Passive" />;
      }
      const passive = <PassiveEffect key="p" />;
      act(() => {
        ReactNoop.render([<LayoutEffect key="l" />, passive]);
        expect(Scheduler).toFlushAndYieldThrough([
          'Layout',
          'Passive',
          'Layout effect',
        ]);
        expect(ReactNoop.getChildren()).toEqual([
          span('Layout'),
          span('Passive'),
        ]);
        // Destroying the first child shouldn't prevent the passive effect from
        // being executed
        ReactNoop.render([passive]);
        expect(Scheduler).toFlushAndYield(['Passive effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Passive')]);
      });
      // exiting act calls flushPassiveEffects(), but there are none left to flush.
      expect(Scheduler).toHaveYielded([]);
    });

    it('flushes passive effects even if siblings schedule an update', () => {
      function PassiveEffect(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue('Passive effect');
        });
        return <Text text="Passive" />;
      }
      function LayoutEffect(props) {
        const [count, setCount] = useState(0);
        useLayoutEffect(() => {
          // Scheduling work shouldn't interfere with the queued passive effect
          if (count === 0) {
            setCount(1);
          }
          Scheduler.unstable_yieldValue('Layout effect ' + count);
        });
        return <Text text="Layout" />;
      }

      ReactNoop.render([<PassiveEffect key="p" />, <LayoutEffect key="l" />]);

      act(() => {
        expect(Scheduler).toHaveYielded([
          'Passive',
          'Layout',
          'Layout effect 0',
          'Passive effect',
          'Layout',
          'Layout effect 1',
        ]);
      });

      expect(ReactNoop.getChildren()).toEqual([
        span('Passive'),
        span('Layout'),
      ]);
    });

    it('flushes passive effects even if siblings schedule a new root', () => {
      function PassiveEffect(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue('Passive effect');
        }, []);
        return <Text text="Passive" />;
      }
      function LayoutEffect(props) {
        useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('Layout effect');
          // Scheduling work shouldn't interfere with the queued passive effect
          ReactNoop.renderToRootWithID(<Text text="New Root" />, 'root2');
        });
        return <Text text="Layout" />;
      }
      act(() => {
        ReactNoop.render([<PassiveEffect key="p" />, <LayoutEffect key="l" />]);
        expect(Scheduler).toFlushAndYield([
          'Passive',
          'Layout',
          'Layout effect',
          'Passive effect',
          'New Root',
        ]);
        expect(ReactNoop.getChildren()).toEqual([
          span('Passive'),
          span('Layout'),
        ]);
      });
    });

    it(
      'flushes effects serially by flushing old effects before flushing ' +
        "new ones, if they haven't already fired",
      () => {
        function getCommittedText() {
          const children = ReactNoop.getChildren();
          if (children === null) {
            return null;
          }
          return children[0].prop;
        }

        function Counter(props) {
          useEffect(() => {
            Scheduler.unstable_yieldValue(
              `Committed state when effect was fired: ${getCommittedText()}`,
            );
          });
          return <Text text={props.count} />;
        }
        act(() => {
          ReactNoop.render(<Counter count={0} />, () =>
            Scheduler.unstable_yieldValue('Sync effect'),
          );
          expect(Scheduler).toFlushAndYieldThrough([0, 'Sync effect']);
          expect(ReactNoop.getChildren()).toEqual([span(0)]);
          // Before the effects have a chance to flush, schedule another update
          ReactNoop.render(<Counter count={1} />, () =>
            Scheduler.unstable_yieldValue('Sync effect'),
          );
          expect(Scheduler).toFlushAndYieldThrough([
            // The previous effect flushes before the reconciliation
            'Committed state when effect was fired: 0',
            1,
            'Sync effect',
          ]);
          expect(ReactNoop.getChildren()).toEqual([span(1)]);
        });

        expect(Scheduler).toHaveYielded([
          'Committed state when effect was fired: 1',
        ]);
      },
    );

    it('defers passive effect destroy functions during unmount', () => {
      function Child({bar, foo}) {
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('passive bar create');
          return () => {
            Scheduler.unstable_yieldValue('passive bar destroy');
          };
        }, [bar]);
        React.useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('layout bar create');
          return () => {
            Scheduler.unstable_yieldValue('layout bar destroy');
          };
        }, [bar]);
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('passive foo create');
          return () => {
            Scheduler.unstable_yieldValue('passive foo destroy');
          };
        }, [foo]);
        React.useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('layout foo create');
          return () => {
            Scheduler.unstable_yieldValue('layout foo destroy');
          };
        }, [foo]);
        Scheduler.unstable_yieldValue('render');
        return null;
      }

      act(() => {
        ReactNoop.render(<Child bar={1} foo={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'render',
          'layout bar create',
          'layout foo create',
          'Sync effect',
        ]);
        // Effects are deferred until after the commit
        expect(Scheduler).toFlushAndYield([
          'passive bar create',
          'passive foo create',
        ]);
      });

      // This update is exists to test an internal implementation detail:
      // Effects without updating dependencies lose their layout/passive tag during an update.
      act(() => {
        ReactNoop.render(<Child bar={1} foo={2} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'render',
          'layout foo destroy',
          'layout foo create',
          'Sync effect',
        ]);
        // Effects are deferred until after the commit
        expect(Scheduler).toFlushAndYield([
          'passive foo destroy',
          'passive foo create',
        ]);
      });

      // Unmount the component and verify that passive destroy functions are deferred until post-commit.
      act(() => {
        ReactNoop.render(null, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'layout bar destroy',
          'layout foo destroy',
          'Sync effect',
        ]);
        // Effects are deferred until after the commit
        expect(Scheduler).toFlushAndYield([
          'passive bar destroy',
          'passive foo destroy',
        ]);
      });
    });

    it('does not warn about state updates for unmounted components with pending passive unmounts', () => {
      let completePendingRequest = null;
      function Component() {
        Scheduler.unstable_yieldValue('Component');
        const [didLoad, setDidLoad] = React.useState(false);
        React.useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('layout create');
          return () => {
            Scheduler.unstable_yieldValue('layout destroy');
          };
        }, []);
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('passive create');
          // Mimic an XHR request with a complete handler that updates state.
          completePendingRequest = () => setDidLoad(true);
          return () => {
            Scheduler.unstable_yieldValue('passive destroy');
          };
        }, []);
        return didLoad;
      }

      act(() => {
        ReactNoop.renderToRootWithID(<Component />, 'root', () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Component',
          'layout create',
          'Sync effect',
        ]);
        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded(['passive create']);

        // Unmount but don't process pending passive destroy function
        ReactNoop.unmountRootWithID('root');
        expect(Scheduler).toFlushAndYieldThrough(['layout destroy']);

        // Simulate an XHR completing, which will cause a state update-
        // but should not log a warning.
        completePendingRequest();

        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded(['passive destroy']);
      });
    });

    it('does not warn about state updates for unmounted components with pending passive unmounts for alternates', () => {
      let setParentState = null;
      const setChildStates = [];

      function Parent() {
        const [state, setState] = useState(true);
        setParentState = setState;
        Scheduler.unstable_yieldValue(`Parent ${state} render`);
        useLayoutEffect(() => {
          Scheduler.unstable_yieldValue(`Parent ${state} commit`);
        });
        if (state) {
          return (
            <>
              <Child label="one" />
              <Child label="two" />
            </>
          );
        } else {
          return null;
        }
      }

      function Child({label}) {
        const [state, setState] = useState(0);
        useLayoutEffect(() => {
          Scheduler.unstable_yieldValue(`Child ${label} commit`);
        });
        useEffect(() => {
          setChildStates.push(setState);
          Scheduler.unstable_yieldValue(`Child ${label} passive create`);
          return () => {
            Scheduler.unstable_yieldValue(`Child ${label} passive destroy`);
          };
        }, []);
        Scheduler.unstable_yieldValue(`Child ${label} render`);
        return state;
      }

      // Schedule debounced state update for child (prob a no-op for this test)
      // later tick: schedule unmount for parent
      // start process unmount (but don't flush passive effectS)
      // State update on child
      act(() => {
        ReactNoop.render(<Parent />);
        expect(Scheduler).toFlushAndYield([
          'Parent true render',
          'Child one render',
          'Child two render',
          'Child one commit',
          'Child two commit',
          'Parent true commit',
          'Child one passive create',
          'Child two passive create',
        ]);

        // Update children.
        setChildStates.forEach(setChildState => setChildState(1));
        expect(Scheduler).toFlushAndYield([
          'Child one render',
          'Child two render',
          'Child one commit',
          'Child two commit',
        ]);
      });
    });

    it('warns about state updates for unmounted components with no pending passive unmounts', () => {
      let completePendingRequest = null;
      function Component() {
        Scheduler.unstable_yieldValue('Component');
        const [didLoad, setDidLoad] = React.useState(false);
        React.useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('layout create');
          // Mimic an XHR request with a complete handler that updates state.
          completePendingRequest = () => setDidLoad(true);
          return () => {
            Scheduler.unstable_yieldValue('layout destroy');
          };
        }, []);
        return didLoad;
      }

      act(() => {
        ReactNoop.renderToRootWithID(<Component />, 'root', () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Component',
          'layout create',
          'Sync effect',
        ]);
      });
    });

    it('still warns if there are pending passive unmount effects but not for the current fiber', () => {
      let completePendingRequest = null;
      function ComponentWithXHR() {
        Scheduler.unstable_yieldValue('Component');
        const [didLoad, setDidLoad] = React.useState(false);
        React.useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('a:layout create');
          return () => {
            Scheduler.unstable_yieldValue('a:layout destroy');
          };
        }, []);
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('a:passive create');
          // Mimic an XHR request with a complete handler that updates state.
          completePendingRequest = () => setDidLoad(true);
        }, []);
        return didLoad;
      }

      function ComponentWithPendingPassiveUnmount() {
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('b:passive create');
          return () => {
            Scheduler.unstable_yieldValue('b:passive destroy');
          };
        }, []);
        return null;
      }

      act(() => {
        ReactNoop.renderToRootWithID(
          <>
            <ComponentWithXHR />
            <ComponentWithPendingPassiveUnmount />
          </>,
          'root',
          () => Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Component',
          'a:layout create',
          'Sync effect',
        ]);
        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded([
          'a:passive create',
          'b:passive create',
        ]);
      });
    });

    it('warns if there are updates after pending passive unmount effects have been flushed', () => {
      let updaterFunction;

      function Component() {
        Scheduler.unstable_yieldValue('Component');
        const [state, setState] = React.useState(false);
        updaterFunction = setState;
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('passive create');
          return () => {
            Scheduler.unstable_yieldValue('passive destroy');
          };
        }, []);
        return state;
      }

      act(() => {
        ReactNoop.renderToRootWithID(<Component />, 'root', () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
      });
      expect(Scheduler).toHaveYielded([
        'Component',
        'Sync effect',
        'passive create',
      ]);
    });

    it('does not show a warning when a component updates its own state from within passive unmount function', () => {
      function Component() {
        Scheduler.unstable_yieldValue('Component');
        const [didLoad, setDidLoad] = React.useState(false);
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('passive create');
          return () => {
            setDidLoad(true);
            Scheduler.unstable_yieldValue('passive destroy');
          };
        }, []);
        return didLoad;
      }

      act(() => {
        ReactNoop.renderToRootWithID(<Component />, 'root', () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Component',
          'Sync effect',
          'passive create',
        ]);

        // Unmount but don't process pending passive destroy function
        ReactNoop.unmountRootWithID('root');
        expect(Scheduler).toFlushAndYield(['passive destroy']);
      });
    });

    it('does not show a warning when a component updates a childs state from within passive unmount function', () => {
      function Parent() {
        Scheduler.unstable_yieldValue('Parent');
        const updaterRef = React.useRef(null);
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('Parent passive create');
          return () => {
            updaterRef.current(true);
            Scheduler.unstable_yieldValue('Parent passive destroy');
          };
        }, []);
        return <Child updaterRef={updaterRef} />;
      }

      function Child({updaterRef}) {
        Scheduler.unstable_yieldValue('Child');
        const [state, setState] = React.useState(false);
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('Child passive create');
          updaterRef.current = setState;
        }, []);
        return state;
      }

      act(() => {
        ReactNoop.renderToRootWithID(<Parent />, 'root');
        expect(Scheduler).toFlushAndYieldThrough([
          'Parent',
          'Child',
          'Child passive create',
          'Parent passive create',
        ]);

        // Unmount but don't process pending passive destroy function
        ReactNoop.unmountRootWithID('root');
        expect(Scheduler).toFlushAndYield(['Parent passive destroy']);
      });
    });

    it('does not show a warning when a component updates a parents state from within passive unmount function', () => {
      function Parent() {
        const [state, setState] = React.useState(false);
        Scheduler.unstable_yieldValue('Parent');
        return <Child setState={setState} state={state} />;
      }

      function Child({setState, state}) {
        Scheduler.unstable_yieldValue('Child');
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('Child passive create');
          return () => {
            Scheduler.unstable_yieldValue('Child passive destroy');
            setState(true);
          };
        }, []);
        return state;
      }

      act(() => {
        ReactNoop.renderToRootWithID(<Parent />, 'root');
        expect(Scheduler).toFlushAndYieldThrough([
          'Parent',
          'Child',
          'Child passive create',
        ]);

        // Unmount but don't process pending passive destroy function
        ReactNoop.unmountRootWithID('root');
        expect(Scheduler).toFlushAndYield(['Child passive destroy']);
      });
    });

    xit('updates have async priority', () => {
      function Counter(props) {
        const [count, updateCount] = useState('(empty)');
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Schedule update [${props.count}]`);
          updateCount(props.count);
        }, [props.count]);
        return <Text text={'Count: ' + count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Count: (empty)',
          'Sync effect',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Count: (empty)')]);
        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded(['Schedule update [0]', 'Count: 0']);
      });

      act(() => {
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded(['Schedule update [1]', 'Count: 1']);
      });
    });

    xit('updates have async priority even if effects are flushed early', () => {
      function Counter(props) {
        const [count, updateCount] = useState('(empty)');
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Schedule update [${props.count}]`);
          updateCount(props.count);
        }, [props.count]);
        return <Text text={'Count: ' + count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Count: (empty)',
          'Sync effect',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Count: (empty)')]);

        // Rendering again should flush the previous commit's effects
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Schedule update [0]',
          'Count: 0',
          'Sync effect'
        ]);

        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded(['Schedule update [1]', 'Count: 1']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });
    });

    it('does not flush non-discrete passive effects when flushing sync', () => {
      let _updateCount;
      function Counter(props) {
        const [count, updateCount] = useState(0);
        _updateCount = updateCount;
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Will set count to 1`);
          updateCount(1);
        }, []);
        return <Text text={'Count: ' + count} />;
      }

      ReactNoop.render(<Counter count={0} />, () =>
        Scheduler.unstable_yieldValue('Sync effect'),
      );
      expect(Scheduler).toHaveYielded(['Count: 0', 'Sync effect']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      // A flush sync doesn't cause the passive effects to fire.
      // So we haven't added the other update yet.
      act(() => {
        ReactNoop.flushSync(() => {
          _updateCount(2);
        });
      });

      // As a result we, somewhat surprisingly, commit them in the opposite order.
      // This should be fine because any non-discrete set of work doesn't guarantee order
      // and easily could've happened slightly later too.
      expect(Scheduler).toHaveYielded([
        'Will set count to 1',
        // 'Count: 2',
        'Count: 1',
      ]);

      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
    });

    it(
      'in legacy mode, useEffect is deferred and updates finish synchronously ' +
        '(in a single batch)',
      () => {
        function Counter(props) {
          const [count, updateCount] = useState('(empty)');
          useEffect(() => {
            // Update multiple times. These should all be batched together in
            // a single render.
            updateCount(props.count);
            updateCount(props.count);
            updateCount(props.count);
            updateCount(props.count);
            updateCount(props.count);
            updateCount(props.count);
          }, [props.count]);
          return <Text text={'Count: ' + count} />;
        }
        act(() => {
          ReactNoop.renderLegacySyncRoot(<Counter count={0} />);
          // Even in legacy mode, effects are deferred until after paint
          expect(Scheduler).toFlushAndYieldThrough(['Count: (empty)']);
          expect(ReactNoop.getChildren()).toEqual([span('Count: (empty)')]);
        });

        // effects get forced on exiting act()
        // There were multiple updates, but there should only be a
        // single render
        expect(Scheduler).toHaveYielded(['Count: 0']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      },
    );

    it('unmounts previous effect', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Did create [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Did destroy [${props.count}]`);
          };
        });
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      });

      expect(Scheduler).toHaveYielded(['Did create [0]']);

      act(() => {
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });

      expect(Scheduler).toHaveYielded(['Did destroy [0]', 'Did create [1]']);
    });

    it('unmounts on deletion', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Did create [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Did destroy [${props.count}]`);
          };
        });
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      });

      expect(Scheduler).toHaveYielded(['Did create [0]']);

      ReactNoop.render(null);
      expect(Scheduler).toFlushAndYield(['Did destroy [0]']);
      expect(ReactNoop.getChildren()).toEqual([]);
    });

    it('unmounts on deletion after skipped effect', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Did create [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Did destroy [${props.count}]`);
          };
        }, []);
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      });

      expect(Scheduler).toHaveYielded(['Did create [0]']);

      act(() => {
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });

      expect(Scheduler).toHaveYielded([]);

      ReactNoop.render(null);
      expect(Scheduler).toFlushAndYield(['Did destroy [0]']);
      expect(ReactNoop.getChildren()).toEqual([]);
    });

    it('always fires effects if no dependencies are provided', () => {
      function effect() {
        Scheduler.unstable_yieldValue(`Did create`);
        return () => {
          Scheduler.unstable_yieldValue(`Did destroy`);
        };
      }
      function Counter(props) {
        useEffect(effect);
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      });

      expect(Scheduler).toHaveYielded(['Did create']);

      act(() => {
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });

      expect(Scheduler).toHaveYielded(['Did destroy', 'Did create']);

      ReactNoop.render(null);
      expect(Scheduler).toFlushAndYield(['Did destroy']);
      expect(ReactNoop.getChildren()).toEqual([]);
    });

    it('skips effect if inputs have not changed', () => {
      function Counter(props) {
        const text = `${props.label}: ${props.count}`;
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Did create [${text}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Did destroy [${text}]`);
          };
        }, [props.label, props.count]);
        return <Text text={text} />;
      }
      act(() => {
        ReactNoop.render(<Counter label="Count" count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
      });

      expect(Scheduler).toHaveYielded(['Did create [Count: 0]']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      act(() => {
        ReactNoop.render(<Counter label="Count" count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        // Count changed
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });

      expect(Scheduler).toHaveYielded([
        'Did destroy [Count: 0]',
        'Did create [Count: 1]',
      ]);

      act(() => {
        ReactNoop.render(<Counter label="Count" count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        // Nothing changed, so no effect should have fired
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
      });

      expect(Scheduler).toHaveYielded([]);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);

      act(() => {
        ReactNoop.render(<Counter label="Total" count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        // Label changed
        expect(Scheduler).toFlushAndYieldThrough(['Total: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Total: 1')]);
      });

      expect(Scheduler).toHaveYielded([
        'Did destroy [Count: 1]',
        'Did create [Total: 1]',
      ]);
    });

    it('multiple effects', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Did commit 1 [${props.count}]`);
        });
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Did commit 2 [${props.count}]`);
        });
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      });

      expect(Scheduler).toHaveYielded(['Did commit 1 [0]', 'Did commit 2 [0]']);

      act(() => {
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });
      expect(Scheduler).toHaveYielded(['Did commit 1 [1]', 'Did commit 2 [1]']);
    });

    it('unmounts all previous effects before creating any new ones', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Mount A [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount A [${props.count}]`);
          };
        });
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Mount B [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount B [${props.count}]`);
          };
        });
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      });

      expect(Scheduler).toHaveYielded(['Mount A [0]', 'Mount B [0]']);

      act(() => {
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });
      expect(Scheduler).toHaveYielded([
        'Unmount A [0]',
        'Unmount B [0]',
        'Mount A [1]',
        'Mount B [1]',
      ]);
    });

    it('unmounts all previous effects between siblings before creating any new ones', () => {
      function Counter({count, label}) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Mount ${label} [${count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount ${label} [${count}]`);
          };
        });
        return <Text text={`${label} ${count}`} />;
      }
      act(() => {
        ReactNoop.render(
          <>
            <Counter label="A" count={0} />
            <Counter label="B" count={0} />
          </>,
          () => Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['A 0', 'B 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('A 0'), span('B 0')]);
      });

      expect(Scheduler).toHaveYielded(['Mount A [0]', 'Mount B [0]']);

      act(() => {
        ReactNoop.render(
          <>
            <Counter label="A" count={1} />
            <Counter label="B" count={1} />
          </>,
          () => Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['A 1', 'B 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('A 1'), span('B 1')]);
      });
      expect(Scheduler).toHaveYielded([
        'Unmount A [0]',
        'Unmount B [0]',
        'Mount A [1]',
        'Mount B [1]',
      ]);

      act(() => {
        ReactNoop.render(
          <>
            <Counter label="B" count={2} />
            <Counter label="C" count={0} />
          </>,
          () => Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['B 2', 'C 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('B 2'), span('C 0')]);
      });
      expect(Scheduler).toHaveYielded([
        'Unmount A [1]',
        'Unmount B [1]',
        'Mount B [2]',
        'Mount C [0]',
      ]);
    });

    it('handles errors in create on mount', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Mount A [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount A [${props.count}]`);
          };
        });
        useEffect(() => {
          Scheduler.unstable_yieldValue('Oops!');
          throw new Error('Oops!');
          // eslint-disable-next-line no-unreachable
          Scheduler.unstable_yieldValue(`Mount B [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount B [${props.count}]`);
          };
        });
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      });
    });

    it('handles errors in create on update', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Mount A [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount A [${props.count}]`);
          };
        });
        useEffect(() => {
          if (props.count === 1) {
            Scheduler.unstable_yieldValue('Oops!');
            throw new Error('Oops!');
          }
          Scheduler.unstable_yieldValue(`Mount B [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount B [${props.count}]`);
          };
        });
        return <Text text={'Count: ' + props.count} />;
      }
      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded(['Mount A [0]', 'Mount B [0]']);
      });

      act(() => {
        // This update will trigger an error
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      });
    });

    it('handles errors in destroy on update', () => {
      function Counter(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Mount A [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue('Oops!');
            if (props.count === 0) {
              throw new Error('Oops!');
            }
          };
        });
        useEffect(() => {
          Scheduler.unstable_yieldValue(`Mount B [${props.count}]`);
          return () => {
            Scheduler.unstable_yieldValue(`Unmount B [${props.count}]`);
          };
        });
        return <Text text={'Count: ' + props.count} />;
      }

      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 0', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
        ReactNoop.flushPassiveEffects();
        expect(Scheduler).toHaveYielded(['Mount A [0]', 'Mount B [0]']);
      });

      act(() => {
        // This update will trigger an error during passive effect unmount
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Count: 1', 'Sync effect']);
        expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
        // expect(() => ReactNoop.flushPassiveEffects()).toThrow('Oops');

        // This branch enables a feature flag that flushes all passive destroys in a
        // separate pass before flushing any passive creates.
        // A result of this two-pass flush is that an error thrown from unmount does
        // not block the subsequent create functions from being run.
        // expect(Scheduler).toHaveYielded([
        //   'Oops!',
        //   'Unmount B [0]',
        //   'Mount A [1]',
        //   'Mount B [1]',
        // ]);
      });

      // <Counter> gets unmounted because an error is thrown above.
      // The remaining destroy functions are run later on unmount, since they're passive.
      // In this case, one of them throws again (because of how the test is written).
      // expect(Scheduler).toHaveYielded(['Oops!', 'Unmount B [1]']);
      // expect(ReactNoop.getChildren()).toEqual([]);
    });

    it('works with memo', () => {
      function Counter({count}) {
        useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('Mount: ' + count);
          return () => Scheduler.unstable_yieldValue('Unmount: ' + count);
        });
        return <Text text={'Count: ' + count} />;
      }
      Counter = memo(Counter);

      ReactNoop.render(<Counter count={0} />, () =>
        Scheduler.unstable_yieldValue('Sync effect'),
      );
      expect(Scheduler).toHaveYielded([
        'Count: 0',
        'Mount: 0',
        'Sync effect',
      ]);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);

      ReactNoop.render(<Counter count={1} />, () =>
        Scheduler.unstable_yieldValue('Sync effect'),
      );
      expect(Scheduler).toHaveYielded([
        'Count: 1',
        'Unmount: 0',
        'Mount: 1',
        'Sync effect',
      ]);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);

      ReactNoop.render(null);
      expect(Scheduler).toHaveYielded(['Unmount: 1']);
      expect(ReactNoop.getChildren()).toEqual([]);
    });

    describe('errors thrown in passive destroy function within unmounted trees', () => {
      let BrokenUseEffectCleanup;
      let ErrorBoundary;
      let DerivedStateOnlyErrorBoundary;
      let LogOnlyErrorBoundary;

      beforeEach(() => {
        BrokenUseEffectCleanup = function() {
          useEffect(() => {
            Scheduler.unstable_yieldValue('BrokenUseEffectCleanup useEffect');
            return () => {
              Scheduler.unstable_yieldValue(
                'BrokenUseEffectCleanup useEffect destroy',
              );
              throw new Error('Expected error');
            };
          }, []);

          return 'inner child';
        };

        ErrorBoundary = class extends React.Component {
          state = {error: null};
          static getDerivedStateFromError(error) {
            Scheduler.unstable_yieldValue(
              `ErrorBoundary static getDerivedStateFromError`,
            );
            return {error};
          }
          componentDidCatch(error, info) {
            Scheduler.unstable_yieldValue(`ErrorBoundary componentDidCatch`);
          }
          render() {
            if (this.state.error) {
              Scheduler.unstable_yieldValue('ErrorBoundary render error');
              return <span prop="ErrorBoundary fallback" />;
            }
            Scheduler.unstable_yieldValue('ErrorBoundary render success');
            return this.props.children || null;
          }
        };

        DerivedStateOnlyErrorBoundary = class extends React.Component {
          state = {error: null};
          static getDerivedStateFromError(error) {
            Scheduler.unstable_yieldValue(
              `DerivedStateOnlyErrorBoundary static getDerivedStateFromError`,
            );
            return {error};
          }
          render() {
            if (this.state.error) {
              Scheduler.unstable_yieldValue(
                'DerivedStateOnlyErrorBoundary render error',
              );
              return <span prop="DerivedStateOnlyErrorBoundary fallback" />;
            }
            Scheduler.unstable_yieldValue(
              'DerivedStateOnlyErrorBoundary render success',
            );
            return this.props.children || null;
          }
        };

        LogOnlyErrorBoundary = class extends React.Component {
          componentDidCatch(error, info) {
            Scheduler.unstable_yieldValue(
              `LogOnlyErrorBoundary componentDidCatch`,
            );
          }
          render() {
            Scheduler.unstable_yieldValue(`LogOnlyErrorBoundary render`);
            return this.props.children || null;
          }
        };
      });

      // @gate old
      it('should call componentDidCatch() for the nearest unmounted log-only boundary', () => {
        function Conditional({showChildren}) {
          if (showChildren) {
            return (
              <LogOnlyErrorBoundary>
                <BrokenUseEffectCleanup />
              </LogOnlyErrorBoundary>
            );
          } else {
            return null;
          }
        }

        act(() => {
          ReactNoop.render(
            <ErrorBoundary>
              <Conditional showChildren={true} />
            </ErrorBoundary>,
          );
        });

        expect(Scheduler).toHaveYielded([
          'ErrorBoundary render success',
          'LogOnlyErrorBoundary render',
          'BrokenUseEffectCleanup useEffect',
        ]);

        // act(() => {
        //   ReactNoop.render(
        //     <ErrorBoundary>
        //       <Conditional showChildren={false} />
        //     </ErrorBoundary>,
        //   );
        //   expect(Scheduler).toFlushAndYieldThrough([
        //     'ErrorBoundary render success',
        //   ]);
        // });
        //
        // expect(Scheduler).toHaveYielded([
        //   'BrokenUseEffectCleanup useEffect destroy',
        //   'LogOnlyErrorBoundary componentDidCatch',
        // ]);
      });

      // @gate old
      it('should call componentDidCatch() for the nearest unmounted logging-capable boundary', () => {
        function Conditional({showChildren}) {
          if (showChildren) {
            return (
              <ErrorBoundary>
                <BrokenUseEffectCleanup />
              </ErrorBoundary>
            );
          } else {
            return null;
          }
        }

        act(() => {
          ReactNoop.render(
            <ErrorBoundary>
              <Conditional showChildren={true} />
            </ErrorBoundary>,
          );
        });

        expect(Scheduler).toHaveYielded([
          'ErrorBoundary render success',
          'ErrorBoundary render success',
          'BrokenUseEffectCleanup useEffect',
        ]);

        // act(() => {
        //   ReactNoop.render(
        //     <ErrorBoundary>
        //       <Conditional showChildren={false} />
        //     </ErrorBoundary>,
        //   );
        //   expect(Scheduler).toFlushAndYieldThrough([
        //     'ErrorBoundary render success',
        //   ]);
        // });
        //
        // expect(Scheduler).toHaveYielded([
        //   'BrokenUseEffectCleanup useEffect destroy',
        //   'ErrorBoundary static getDerivedStateFromError',
        //   'ErrorBoundary componentDidCatch',
        //
        // ]);
      });

      // @gate old
      it('should not call getDerivedStateFromError for unmounted error boundaries', () => {
        function Conditional({showChildren}) {
          if (showChildren) {
            return (
              <ErrorBoundary>
                <BrokenUseEffectCleanup />
              </ErrorBoundary>
            );
          } else {
            return null;
          }
        }

        act(() => {
          ReactNoop.render(<Conditional showChildren={true} />);
        });

        expect(Scheduler).toHaveYielded([
          'ErrorBoundary render success',
          'BrokenUseEffectCleanup useEffect',
        ]);

        // act(() => {
        //   ReactNoop.render(<Conditional showChildren={false} />);
        // });
        //
        // expect(Scheduler).toHaveYielded([
        //   'BrokenUseEffectCleanup useEffect destroy',
        //   'ErrorBoundary static getDerivedStateFromError',
        //   'ErrorBoundary componentDidCatch',
        // ]);
      });

      // @gate old
      it('should not throw if there are no unmounted logging-capable boundaries to call', () => {
        function Conditional({showChildren}) {
          if (showChildren) {
            return (
              <DerivedStateOnlyErrorBoundary>
                <BrokenUseEffectCleanup />
              </DerivedStateOnlyErrorBoundary>
            );
          } else {
            return null;
          }
        }

        act(() => {
          ReactNoop.render(<Conditional showChildren={true} />);
        });

        expect(Scheduler).toHaveYielded([
          'DerivedStateOnlyErrorBoundary render success',
          'BrokenUseEffectCleanup useEffect',
        ]);

        // act(() => {
        //   ReactNoop.render(<Conditional showChildren={false} />);
        // });
        //
        // expect(Scheduler).toHaveYielded([
        //   'BrokenUseEffectCleanup useEffect destroy',
        //   'DerivedStateOnlyErrorBoundary static getDerivedStateFromError',
        // ]);
      });

      // @gate new
      it('should use the nearest still-mounted boundary if there are no unmounted boundaries', () => {
        act(() => {
          ReactNoop.render(
            <LogOnlyErrorBoundary>
              <BrokenUseEffectCleanup />
            </LogOnlyErrorBoundary>,
          );
        });

        expect(Scheduler).toHaveYielded([
          'LogOnlyErrorBoundary render',
          'BrokenUseEffectCleanup useEffect',
        ]);

        act(() => {
          ReactNoop.render(<LogOnlyErrorBoundary />);
        });

        expect(Scheduler).toHaveYielded([
          'LogOnlyErrorBoundary render',
          'BrokenUseEffectCleanup useEffect destroy',
          'LogOnlyErrorBoundary componentDidCatch',
        ]);
      });

      // @gate new
      it('should skip unmounted boundaries and use the nearest still-mounted boundary', () => {
        function Conditional({showChildren}) {
          if (showChildren) {
            return (
              <ErrorBoundary>
                <BrokenUseEffectCleanup />
              </ErrorBoundary>
            );
          } else {
            return null;
          }
        }

        act(() => {
          ReactNoop.render(
            <LogOnlyErrorBoundary>
              <Conditional showChildren={true} />
            </LogOnlyErrorBoundary>,
          );
        });

        expect(Scheduler).toHaveYielded([
          'LogOnlyErrorBoundary render',
          'ErrorBoundary render success',
          'BrokenUseEffectCleanup useEffect',
        ]);

        act(() => {
          ReactNoop.render(
            <LogOnlyErrorBoundary>
              <Conditional showChildren={false} />
            </LogOnlyErrorBoundary>,
          );
        });

        expect(Scheduler).toHaveYielded([
          'LogOnlyErrorBoundary render',
          'BrokenUseEffectCleanup useEffect destroy',
          'LogOnlyErrorBoundary componentDidCatch',
        ]);
      });

      // @gate new
      it('should call getDerivedStateFromError in the nearest still-mounted boundary', () => {
        function Conditional({showChildren}) {
          if (showChildren) {
            return <BrokenUseEffectCleanup />;
          } else {
            return null;
          }
        }

        act(() => {
          ReactNoop.render(
            <ErrorBoundary>
              <Conditional showChildren={true} />
            </ErrorBoundary>,
          );
        });

        expect(Scheduler).toHaveYielded([
          'ErrorBoundary render success',
          'BrokenUseEffectCleanup useEffect',
        ]);

        act(() => {
          ReactNoop.render(
            <ErrorBoundary>
              <Conditional showChildren={false} />
            </ErrorBoundary>,
          );
        });

        expect(Scheduler).toHaveYielded([
          'ErrorBoundary render success',
          'BrokenUseEffectCleanup useEffect destroy',
          'ErrorBoundary static getDerivedStateFromError',
          'ErrorBoundary render error',
          'ErrorBoundary componentDidCatch',
        ]);

        expect(ReactNoop.getChildren()).toEqual([
          span('ErrorBoundary fallback'),
        ]);
      });

      // @gate new
      it('should rethrow error if there are no still-mounted boundaries', () => {
        function Conditional({showChildren}) {
          if (showChildren) {
            return (
              <ErrorBoundary>
                <BrokenUseEffectCleanup />
              </ErrorBoundary>
            );
          } else {
            return null;
          }
        }

        act(() => {
          ReactNoop.render(<Conditional showChildren={true} />);
        });

        expect(Scheduler).toHaveYielded([
          'ErrorBoundary render success',
          'BrokenUseEffectCleanup useEffect',
        ]);

        expect(() => {
          act(() => {
            ReactNoop.render(<Conditional showChildren={false} />);
          });
        }).toThrow('Expected error');

        expect(Scheduler).toHaveYielded([
          'BrokenUseEffectCleanup useEffect destroy',
        ]);

        expect(ReactNoop.getChildren()).toEqual([]);
      });
    });

    it('calls passive effect destroy functions for memoized components', () => {
      const Wrapper = ({children}) => children;
      function Child() {
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('passive create');
          return () => {
            Scheduler.unstable_yieldValue('passive destroy');
          };
        }, []);
        React.useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('layout create');
          return () => {
            Scheduler.unstable_yieldValue('layout destroy');
          };
        }, []);
        Scheduler.unstable_yieldValue('render');
        return null;
      }

      const isEqual = (prevProps, nextProps) =>
        prevProps.prop === nextProps.prop;
      const MemoizedChild = React.memo(Child, isEqual);

      act(() => {
        ReactNoop.render(
          <Wrapper>
            <MemoizedChild key={1} />
          </Wrapper>,
        );
      });
      expect(Scheduler).toHaveYielded([
        'render',
        'layout create',
        'passive create',
      ]);

      // Include at least one no-op (memoized) update to trigger original bug.
      act(() => {
        ReactNoop.render(
          <Wrapper>
            <MemoizedChild key={1} />
          </Wrapper>,
        );
      });
      expect(Scheduler).toHaveYielded([]);

      act(() => {
        ReactNoop.render(
          <Wrapper>
            <MemoizedChild key={2} />
          </Wrapper>,
        );
      });
      expect(Scheduler).toHaveYielded([
        'render',
        'layout destroy',
        'layout create',
        'passive destroy',
        'passive create',
      ]);

      act(() => {
        ReactNoop.render(null);
      });
      expect(Scheduler).toHaveYielded(['layout destroy', 'passive destroy']);
    });

    it('calls passive effect destroy functions for descendants of memoized components', () => {
      const Wrapper = ({children}) => children;
      function Child() {
        return <Grandchild />;
      }

      function Grandchild() {
        React.useEffect(() => {
          Scheduler.unstable_yieldValue('passive create');
          return () => {
            Scheduler.unstable_yieldValue('passive destroy');
          };
        }, []);
        React.useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('layout create');
          return () => {
            Scheduler.unstable_yieldValue('layout destroy');
          };
        }, []);
        Scheduler.unstable_yieldValue('render');
        return null;
      }

      const isEqual = (prevProps, nextProps) =>
        prevProps.prop === nextProps.prop;
      const MemoizedChild = React.memo(Child, isEqual);

      act(() => {
        ReactNoop.render(
          <Wrapper>
            <MemoizedChild key={1} />
          </Wrapper>,
        );
      });
      expect(Scheduler).toHaveYielded([
        'render',
        'layout create',
        'passive create',
      ]);

      // Include at least one no-op (memoized) update to trigger original bug.
      act(() => {
        ReactNoop.render(
          <Wrapper>
            <MemoizedChild key={1} />
          </Wrapper>,
        );
      });
      expect(Scheduler).toHaveYielded([]);

      act(() => {
        ReactNoop.render(
          <Wrapper>
            <MemoizedChild key={2} />
          </Wrapper>,
        );
      });
      expect(Scheduler).toHaveYielded([
        'render',
        'layout destroy',
        'layout create',
        'passive destroy',
        'passive create',
      ]);

      act(() => {
        ReactNoop.render(null);
      });
      expect(Scheduler).toHaveYielded(['layout destroy', 'passive destroy']);
    });
  });

  describe('useLayoutEffect', () => {
    it('fires layout effects after the host has been mutated', () => {
      function getCommittedText() {
        const yields = Scheduler.unstable_clearYields();
        const children = ReactNoop.getChildren();
        Scheduler.unstable_yieldValue(yields);
        if (children === null) {
          return null;
        }
        return children[0].prop;
      }

      function Counter(props) {
        useLayoutEffect(() => {
          Scheduler.unstable_yieldValue(`Current: ${getCommittedText()}`);
        });
        return <Text text={props.count} />;
      }

      ReactNoop.render(<Counter count={0} />, () =>
        Scheduler.unstable_yieldValue('Sync effect'),
      );
      expect(Scheduler).toHaveYielded([
        [0],
        'Current: 0',
        'Sync effect',
      ]);
      expect(ReactNoop.getChildren()).toEqual([span(0)]);

      ReactNoop.render(<Counter count={1} />, () =>
        Scheduler.unstable_yieldValue('Sync effect'),
      );
      expect(Scheduler).toHaveYielded([
        [1],
        'Current: 1',
        'Sync effect',
      ]);
      expect(ReactNoop.getChildren()).toEqual([span(1)]);
    });

    it('force flushes passive effects before firing new layout effects', () => {
      let committedText = '(empty)';

      function Counter(props) {
        useLayoutEffect(() => {
          // Normally this would go in a mutation effect, but this test
          // intentionally omits a mutation effect.
          committedText = props.count + '';

          Scheduler.unstable_yieldValue(
            `Mount layout [current: ${committedText}]`,
          );
          return () => {
            Scheduler.unstable_yieldValue(
              `Unmount layout [current: ${committedText}]`,
            );
          };
        });
        useEffect(() => {
          Scheduler.unstable_yieldValue(
            `Mount normal [current: ${committedText}]`,
          );
          return () => {
            Scheduler.unstable_yieldValue(
              `Unmount normal [current: ${committedText}]`,
            );
          };
        });
        return null;
      }

      act(() => {
        ReactNoop.render(<Counter count={0} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Mount layout [current: 0]',
          'Sync effect',
        ]);
        expect(committedText).toEqual('0');
        ReactNoop.render(<Counter count={1} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough([
          'Mount normal [current: 0]',
          'Unmount layout [current: 0]',
          'Mount layout [current: 1]',
          'Sync effect',
        ]);
        expect(committedText).toEqual('1');
      });

      expect(Scheduler).toHaveYielded([
        'Unmount normal [current: 1]',
        'Mount normal [current: 1]',
      ]);
    });

  });

  describe('useCallback', () => {
    it('memoizes callback by comparing inputs', () => {
      class IncrementButton extends React.PureComponent {
        increment = () => {
          this.props.increment();
        };
        render() {
          return <Text text="Increment" />;
        }
      }

      function Counter({incrementBy}) {
        const [count, updateCount] = useState(0);
        const increment = useCallback(() => updateCount(c => c + incrementBy), [
          incrementBy,
        ]);
        return (
          <>
            <IncrementButton increment={increment} ref={button} />
            <Text text={'Count: ' + count} />
          </>
        );
      }

      const button = React.createRef(null);
      ReactNoop.render(<Counter incrementBy={1} />);
      expect(Scheduler).toHaveYielded(['Increment', 'Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([
        span('Increment'),
        span('Count: 0'),
      ]);

      act(button.current.increment);
      expect(Scheduler).toHaveYielded([
        // Button should not re-render, because its props haven't changed
        // 'Increment',
        'Count: 1',
      ]);
      expect(ReactNoop.getChildren()).toEqual([
        span('Increment'),
        span('Count: 1'),
      ]);

      // Increase the increment amount
      ReactNoop.render(<Counter incrementBy={10} />);
      expect(Scheduler).toHaveYielded([
        // Inputs did change this time
        'Increment',
        'Count: 1',
      ]);
      expect(ReactNoop.getChildren()).toEqual([
        span('Increment'),
        span('Count: 1'),
      ]);

      // Callback should have updated
      act(button.current.increment);
      expect(Scheduler).toHaveYielded(['Count: 11']);
      expect(ReactNoop.getChildren()).toEqual([
        span('Increment'),
        span('Count: 11'),
      ]);
    });
  });

  describe('useMemo', () => {
    it('memoizes value by comparing to previous inputs', () => {
      function CapitalizedText(props) {
        const text = props.text;
        const capitalizedText = useMemo(() => {
          Scheduler.unstable_yieldValue(`Capitalize '${text}'`);
          return text.toUpperCase();
        }, [text]);
        return <Text text={capitalizedText} />;
      }

      ReactNoop.render(<CapitalizedText text="hello" />);
      expect(Scheduler).toHaveYielded(["Capitalize 'hello'", 'HELLO']);
      expect(ReactNoop.getChildren()).toEqual([span('HELLO')]);

      ReactNoop.render(<CapitalizedText text="hi" />);
      expect(Scheduler).toHaveYielded(["Capitalize 'hi'", 'HI']);
      expect(ReactNoop.getChildren()).toEqual([span('HI')]);

      ReactNoop.render(<CapitalizedText text="hi" />);
      expect(Scheduler).toHaveYielded(['HI']);
      expect(ReactNoop.getChildren()).toEqual([span('HI')]);

      ReactNoop.render(<CapitalizedText text="goodbye" />);
      expect(Scheduler).toHaveYielded(["Capitalize 'goodbye'", 'GOODBYE']);
      expect(ReactNoop.getChildren()).toEqual([span('GOODBYE')]);
    });

    it('always re-computes if no inputs are provided', () => {
      function LazyCompute(props) {
        const computed = useMemo(props.compute);
        return <Text text={computed} />;
      }

      function computeA() {
        Scheduler.unstable_yieldValue('compute A');
        return 'A';
      }

      function computeB() {
        Scheduler.unstable_yieldValue('compute B');
        return 'B';
      }

      ReactNoop.render(<LazyCompute compute={computeA} />);
      expect(Scheduler).toHaveYielded(['compute A', 'A']);

      ReactNoop.render(<LazyCompute compute={computeA} />);
      expect(Scheduler).toHaveYielded(['compute A', 'A']);

      ReactNoop.render(<LazyCompute compute={computeA} />);
      expect(Scheduler).toHaveYielded(['compute A', 'A']);

      ReactNoop.render(<LazyCompute compute={computeB} />);
      expect(Scheduler).toHaveYielded(['compute B', 'B']);
    });

    xit('should not invoke memoized function during re-renders unless inputs change', () => {
      function LazyCompute(props) {
        const computed = useMemo(() => props.compute(props.input), [
          props.input,
        ]);
        const [count, setCount] = useState(0);
        if (count < 3) {
          setCount(count + 1);
        }
        return <Text text={computed} />;
      }

      function compute(val) {
        Scheduler.unstable_yieldValue('compute ' + val);
        return val;
      }

      ReactNoop.render(<LazyCompute compute={compute} input="A" />);
      expect(Scheduler).toHaveYielded(['compute A', 'A']);

      ReactNoop.render(<LazyCompute compute={compute} input="A" />);
      expect(Scheduler).toHaveYielded(['A']);

      ReactNoop.render(<LazyCompute compute={compute} input="B" />);
      expect(Scheduler).toHaveYielded(['compute B', 'B']);
    });
  });

  describe('useRef', () => {
    it('creates a ref object initialized with the provided value', () => {
      jest.useFakeTimers();

      function useDebouncedCallback(callback, ms, inputs) {
        const timeoutID = useRef(-1);
        useEffect(() => {
          return function unmount() {
            clearTimeout(timeoutID.current);
          };
        }, []);
        const debouncedCallback = useCallback(
          (...args) => {
            clearTimeout(timeoutID.current);
            timeoutID.current = setTimeout(callback, ms, ...args);
          },
          [callback, ms],
        );
        return useCallback(debouncedCallback, inputs);
      }

      let ping;
      function App() {
        ping = useDebouncedCallback(
          value => {
            Scheduler.unstable_yieldValue('ping: ' + value);
          },
          100,
          [],
        );
        return null;
      }

      act(() => {
        ReactNoop.render(<App />);
      });
      expect(Scheduler).toHaveYielded([]);

      ping(1);
      ping(2);
      ping(3);

      expect(Scheduler).toHaveYielded([]);

      jest.advanceTimersByTime(100);

      expect(Scheduler).toHaveYielded(['ping: 3']);

      ping(4);
      jest.advanceTimersByTime(20);
      ping(5);
      ping(6);
      jest.advanceTimersByTime(80);

      expect(Scheduler).toHaveYielded([]);

      jest.advanceTimersByTime(20);
      expect(Scheduler).toHaveYielded(['ping: 6']);
    });

    xit('should return the same ref during re-renders', () => {
      function Counter() {
        const ref = useRef('val');
        const [count, setCount] = useState(0);
        const [firstRef] = useState(ref);

        if (firstRef !== ref) {
          throw new Error('should never change');
        }

        if (count < 3) {
          setCount(count + 1);
        }

        return <Text text={ref.current} />;
      }

      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded(['val']);

      ReactNoop.render(<Counter />);
      expect(Scheduler).toHaveYielded(['val']);
    });
  });

  describe('useImperativeHandle', () => {
    it('does not update when deps are the same', () => {
      const INCREMENT = 'INCREMENT';

      function reducer(state, action) {
        return action === INCREMENT ? state + 1 : state;
      }

      function Counter(props, ref) {
        const [count, dispatch] = useReducer(reducer, 0);
        useImperativeHandle(ref, () => ({count, dispatch}), []);
        return <Text text={'Count: ' + count} />;
      }

      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      expect(counter.current.count).toBe(0);

      act(() => {
        counter.current.dispatch(INCREMENT);
      });
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      // Intentionally not updated because of [] deps:
      expect(counter.current.count).toBe(0);
    });

    // Regression test for https://github.com/facebook/react/issues/14782
    it('automatically updates when deps are not specified', () => {
      const INCREMENT = 'INCREMENT';

      function reducer(state, action) {
        return action === INCREMENT ? state + 1 : state;
      }

      function Counter(props, ref) {
        const [count, dispatch] = useReducer(reducer, 0);
        useImperativeHandle(ref, () => ({count, dispatch}));
        return <Text text={'Count: ' + count} />;
      }

      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      expect(counter.current.count).toBe(0);

      act(() => {
        counter.current.dispatch(INCREMENT);
      });
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      expect(counter.current.count).toBe(1);
    });

    it('updates when deps are different', () => {
      const INCREMENT = 'INCREMENT';

      function reducer(state, action) {
        return action === INCREMENT ? state + 1 : state;
      }

      let totalRefUpdates = 0;
      function Counter(props, ref) {
        const [count, dispatch] = useReducer(reducer, 0);
        useImperativeHandle(
          ref,
          () => {
            totalRefUpdates++;
            return {count, dispatch};
          },
          [count],
        );
        return <Text text={'Count: ' + count} />;
      }

      Counter = forwardRef(Counter);
      const counter = React.createRef(null);
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded(['Count: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 0')]);
      expect(counter.current.count).toBe(0);
      expect(totalRefUpdates).toBe(1);

      act(() => {
        counter.current.dispatch(INCREMENT);
      });
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      expect(counter.current.count).toBe(1);
      expect(totalRefUpdates).toBe(2);

      // Update that doesn't change the ref dependencies
      ReactNoop.render(<Counter ref={counter} />);
      expect(Scheduler).toHaveYielded(['Count: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Count: 1')]);
      expect(counter.current.count).toBe(1);
      expect(totalRefUpdates).toBe(2); // Should not increase since last time
    });
  });

  describe('progressive enhancement (not supported)', () => {
    it('mount additional state', () => {
      let updateA;
      let updateB;
      // let updateC;

      function App(props) {
        const [A, _updateA] = useState(0);
        const [B, _updateB] = useState(0);
        updateA = _updateA;
        updateB = _updateB;

        let C;
        if (props.loadC) {
          useState(0);
        } else {
          C = '[not loaded]';
        }

        return <Text text={`A: ${A}, B: ${B}, C: ${C}`} />;
      }

      ReactNoop.render(<App loadC={false} />);
      expect(Scheduler).toHaveYielded(['A: 0, B: 0, C: [not loaded]']);
      expect(ReactNoop.getChildren()).toEqual([
        span('A: 0, B: 0, C: [not loaded]'),
      ]);

      act(() => {
        updateA(2);
        updateB(3);
      });

      expect(Scheduler).toHaveYielded(['A: 2, B: 3, C: [not loaded]']);
      expect(ReactNoop.getChildren()).toEqual([
        span('A: 2, B: 3, C: [not loaded]'),
      ]);

      // Uncomment if/when we support this again
      // expect(ReactNoop.getChildren()).toEqual([span('A: 2, B: 3, C: 0')]);

      // updateC(4);
      // expect(Scheduler).toFlushAndYield(['A: 2, B: 3, C: 4']);
      // expect(ReactNoop.getChildren()).toEqual([span('A: 2, B: 3, C: 4')]);
    });

    it('unmount state', () => {
      let updateA;
      let updateB;
      let updateC;

      function App(props) {
        const [A, _updateA] = useState(0);
        const [B, _updateB] = useState(0);
        updateA = _updateA;
        updateB = _updateB;

        let C;
        if (props.loadC) {
          const [_C, _updateC] = useState(0);
          C = _C;
          updateC = _updateC;
        } else {
          C = '[not loaded]';
        }

        return <Text text={`A: ${A}, B: ${B}, C: ${C}`} />;
      }

      ReactNoop.render(<App loadC={true} />);
      expect(Scheduler).toHaveYielded(['A: 0, B: 0, C: 0']);
      expect(ReactNoop.getChildren()).toEqual([span('A: 0, B: 0, C: 0')]);
      act(() => {
        updateA(2);
        updateB(3);
        updateC(4);
      });
      expect(Scheduler).toHaveYielded(['A: 2, B: 3, C: 4']);
      expect(ReactNoop.getChildren()).toEqual([span('A: 2, B: 3, C: 4')]);

      expect(() => {
        ReactNoop.render(<App loadC={false} />);
      }).toThrow(
        'Hooks are less than expected, please check whether the hook is written in the condition.',
      );
    });

    it('unmount effects', () => {
      function App(props) {
        useEffect(() => {
          Scheduler.unstable_yieldValue('Mount A');
          return () => {
            Scheduler.unstable_yieldValue('Unmount A');
          };
        }, []);

        if (props.showMore) {
          useEffect(() => {
            Scheduler.unstable_yieldValue('Mount B');
            return () => {
              Scheduler.unstable_yieldValue('Unmount B');
            };
          }, []);
        }

        return null;
      }

      act(() => {
        ReactNoop.render(<App showMore={false} />, () =>
          Scheduler.unstable_yieldValue('Sync effect'),
        );
        expect(Scheduler).toFlushAndYieldThrough(['Sync effect']);
      });

      expect(Scheduler).toHaveYielded(['Mount A']);

      // Uncomment if/when we support this again
      // ReactNoop.flushPassiveEffects();
      // expect(Scheduler).toHaveYielded(['Mount B']);

      // ReactNoop.render(<App showMore={false} />);
      // expect(Scheduler).toFlushAndThrow(
      //   'Rendered fewer hooks than expected. This may be caused by an ' +
      //     'accidental early return statement.',
      // );
    });
  });

  it('useReducer does not eagerly bail out of state updates', () => {
    // Edge case based on a bug report
    let setCounter;
    function App() {
      const [counter, _setCounter] = useState(1);
      setCounter = _setCounter;
      return <Component count={counter} />;
    }

    function Component({count}) {
      const [state, dispatch] = useReducer(() => {
        // This reducer closes over a value from props. If the reducer is not
        // properly updated, the eager reducer will compare to an old value
        // and bail out incorrectly.
        Scheduler.unstable_yieldValue('Reducer: ' + count);
        return count;
      }, -1);
      useEffect(() => {
        Scheduler.unstable_yieldValue('Effect: ' + count);
        dispatch();
      }, [count]);
      Scheduler.unstable_yieldValue('Render: ' + state);
      return count;
    }

    act(() => {
      ReactNoop.render(<App />);
      expect(Scheduler).toFlushAndYield([
        'Render: -1',
        'Effect: 1',
        'Reducer: 1',
        'Render: 1',
      ]);
      expect(ReactNoop).toMatchRenderedOutput('1');
    });

    act(() => {
      setCounter(2);
    });
    expect(Scheduler).toHaveYielded([
      'Render: 1',
      'Effect: 2',
      'Reducer: 2',
      'Render: 2',
    ]);
    expect(ReactNoop).toMatchRenderedOutput('2');
  });

  xit('should update latest rendered reducer when a preceding state receives a render phase update', () => {
    // Similar to previous test, except using a preceding render phase update
    // instead of new props.
    let dispatch;
    function App() {
      const [step, setStep] = useState(0);
      const [shadow, _dispatch] = useReducer(() => step, step);
      dispatch = _dispatch;

      if (step < 5) {
        setStep(step + 1);
      }

      Scheduler.unstable_yieldValue(`Step: ${step}, Shadow: ${shadow}`);
      return shadow;
    }

    ReactNoop.render(<App />);
    expect(Scheduler).toHaveYielded([
      'Step: 0, Shadow: 0',
      'Step: 1, Shadow: 0',
      'Step: 2, Shadow: 0',
      'Step: 3, Shadow: 0',
      'Step: 4, Shadow: 0',
      'Step: 5, Shadow: 0',
    ]);
    expect(ReactNoop).toMatchRenderedOutput('0');

    act(() => dispatch());
    expect(Scheduler).toHaveYielded(['Step: 5, Shadow: 5']);
    expect(ReactNoop).toMatchRenderedOutput('5');
  });

  xit('should process the rest pending updates after a render phase update', () => {
    // Similar to previous test, except using a preceding render phase update
    // instead of new props.
    let updateA;
    let updateC;
    function App() {
      const [a, setA] = useState(false);
      const [b, setB] = useState(false);
      if (a !== b) {
        setB(a);
      }
      // Even though we called setB above,
      // we should still apply the changes to C,
      // during this render pass.
      const [c, setC] = useState(false);
      updateA = setA;
      updateC = setC;
      return `${a ? 'A' : 'a'}${b ? 'B' : 'b'}${c ? 'C' : 'c'}`;
    }

    act(() => ReactNoop.render(<App />));
    expect(ReactNoop).toMatchRenderedOutput('abc');

    act(() => {
      updateA(true);
      // This update should not get dropped.
      updateC(true);
    });
    expect(ReactNoop).toMatchRenderedOutput('ABC');
  });

  it("regression test: don't unmount effects on siblings of deleted nodes", async () => {

    function Child({label}) {
      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue('Mount layout ' + label);
        return () => {
          Scheduler.unstable_yieldValue('Unmount layout ' + label);
        };
      }, [label]);
      useEffect(() => {
        Scheduler.unstable_yieldValue('Mount passive ' + label);
        return () => {
          Scheduler.unstable_yieldValue('Unmount passive ' + label);
        };
      }, [label]);
      return label;
    }

    await act(async () => {
      ReactNoop.render(
        <>
          <Child key="A" label="A" />
          <Child key="B" label="B" />
        </>,
      );
    });
    expect(Scheduler).toHaveYielded([
      'Mount layout A',
      'Mount layout B',
      'Mount passive A',
      'Mount passive B',
    ]);

    // Delete A. This should only unmount the effect on A. In the regression,
    // B's effect would also unmount.
    await act(async () => {
      ReactNoop.render(
        <>
          <Child key="B" label="B" />
        </>,
      );
    });
    expect(Scheduler).toHaveYielded(['Unmount layout A', 'Unmount passive A']);

    // Now delete and unmount B.
    await act(async () => {
      ReactNoop.render(null);
    });
    expect(Scheduler).toHaveYielded(['Unmount layout B', 'Unmount passive B']);
  });
});
