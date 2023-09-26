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
let ReactTestRenderer;
let Scheduler;
let act;

// Additional tests can be found in ReactHooksWithNoopRenderer. Plan is to
// gradually migrate those to this file.
describe('ReactHooks', () => {
  beforeEach(() => {
    jest.resetModules();

    ReactTestRenderer = require('react-test-renderer');
    React = require('horizon-external');
    Scheduler = require('scheduler');
    act = ReactTestRenderer.unstable_concurrentAct;
  });

  // Concurrent
  xit('bails out in the render phase if all of the state is the same', () => {
    const {useState, useLayoutEffect} = React;

    function Child({text}) {
      Scheduler.unstable_yieldValue('Child: ' + text);
      return text;
    }

    let setCounter1;
    let setCounter2;
    function Parent() {
      const [counter1, _setCounter1] = useState(0);
      setCounter1 = _setCounter1;
      const [counter2, _setCounter2] = useState(0);
      setCounter2 = _setCounter2;

      const text = `${counter1}, ${counter2}`;
      Scheduler.unstable_yieldValue(`Parent: ${text}`);
      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue(`Effect: ${text}`);
      });
      return <Child text={text} />;
    }

    const root = ReactTestRenderer.create(null, {unstable_isConcurrent: true});
    root.update(<Parent />);
    expect(Scheduler).toFlushAndYield([
      'Parent: 0, 0',
      'Child: 0, 0',
      'Effect: 0, 0',
    ]);
    expect(root).toMatchRenderedOutput('0, 0');

    // Normal update
    act(() => {
      setCounter1(1);
      setCounter2(1);
    });

    expect(Scheduler).toHaveYielded([
      'Parent: 1, 1',
      'Child: 1, 1',
      'Effect: 1, 1',
    ]);

    // Update that bails out.
    act(() => setCounter1(1));
    expect(Scheduler).toHaveYielded(['Parent: 1, 1']);

    // This time, one of the state updates but the other one doesn't. So we
    // can't bail out.
    act(() => {
      setCounter1(1);
      setCounter2(2);
    });

    expect(Scheduler).toHaveYielded([
      'Parent: 1, 2',
      'Child: 1, 2',
      'Effect: 1, 2',
    ]);

    // Lots of updates that eventually resolve to the current values.
    act(() => {
      setCounter1(9);
      setCounter2(3);
      setCounter1(4);
      setCounter2(7);
      setCounter1(1);
      setCounter2(2);
    });

    // Because the final values are the same as the current values, the
    // component bails out.
    expect(Scheduler).toHaveYielded(['Parent: 1, 2']);

    // prepare to check SameValue
    act(() => {
      setCounter1(0 / -1);
      setCounter2(NaN);
    });

    expect(Scheduler).toHaveYielded([
      'Parent: 0, NaN',
      'Child: 0, NaN',
      'Effect: 0, NaN',
    ]);

    // check if re-setting to negative 0 / NaN still bails out
    act(() => {
      setCounter1(0 / -1);
      setCounter2(NaN);
      setCounter2(Infinity);
      setCounter2(NaN);
    });

    expect(Scheduler).toHaveYielded(['Parent: 0, NaN']);

    // check if changing negative 0 to positive 0 does not bail out
    act(() => {
      setCounter1(0);
    });
    expect(Scheduler).toHaveYielded([
      'Parent: 0, NaN',
      'Child: 0, NaN',
      'Effect: 0, NaN',
    ]);
  });

  // Concurrent
  xit('bails out in render phase if all the state is the same and props bail out with memo', () => {
    const {useState, memo} = React;

    function Child({text}) {
      Scheduler.unstable_yieldValue('Child: ' + text);
      return text;
    }

    let setCounter1;
    let setCounter2;
    function Parent({theme}) {
      const [counter1, _setCounter1] = useState(0);
      setCounter1 = _setCounter1;
      const [counter2, _setCounter2] = useState(0);
      setCounter2 = _setCounter2;

      const text = `${counter1}, ${counter2} (${theme})`;
      Scheduler.unstable_yieldValue(`Parent: ${text}`);
      return <Child text={text} />;
    }

    Parent = memo(Parent);

    const root = ReactTestRenderer.create(null, {unstable_isConcurrent: true});
    root.update(<Parent theme="light" />);
    expect(Scheduler).toFlushAndYield([
      'Parent: 0, 0 (light)',
      'Child: 0, 0 (light)',
    ]);
    expect(root).toMatchRenderedOutput('0, 0 (light)');

    // Normal update
    act(() => {
      setCounter1(1);
      setCounter2(1);
    });

    expect(Scheduler).toHaveYielded([
      'Parent: 1, 1 (light)',
      'Child: 1, 1 (light)',
    ]);

    // Update that bails out.
    act(() => setCounter1(1));
    expect(Scheduler).toHaveYielded(['Parent: 1, 1 (light)']);

    // This time, one of the state updates but the other one doesn't. So we
    // can't bail out.
    act(() => {
      setCounter1(1);
      setCounter2(2);
    });

    expect(Scheduler).toHaveYielded([
      'Parent: 1, 2 (light)',
      'Child: 1, 2 (light)',
    ]);

    // Updates bail out, but component still renders because props
    // have changed
    act(() => {
      setCounter1(1);
      setCounter2(2);
      root.update(<Parent theme="dark" />);
    });

    expect(Scheduler).toHaveYielded([
      'Parent: 1, 2 (dark)',
      'Child: 1, 2 (dark)',
    ]);

    // Both props and state bail out
    act(() => {
      setCounter1(1);
      setCounter2(2);
      root.update(<Parent theme="dark" />);
    });

    expect(Scheduler).toHaveYielded(['Parent: 1, 2 (dark)']);
  });

  it('warns about setState second argument', () => {
    const {useState} = React;

    let setCounter;
    function Counter() {
      const [counter, _setCounter] = useState(0);
      setCounter = _setCounter;

      Scheduler.unstable_yieldValue(`Count: ${counter}`);
      return counter;
    }

    const root = ReactTestRenderer.create(null);
    root.update(<Counter />);
    expect(Scheduler).toHaveYielded(['Count: 0']);
    expect(root).toMatchRenderedOutput('0');
  });

  it('warns about dispatch second argument', () => {
    const {useReducer} = React;

    let dispatch;
    function Counter() {
      const [counter, _dispatch] = useReducer((s, a) => a, 0);
      dispatch = _dispatch;

      Scheduler.unstable_yieldValue(`Count: ${counter}`);
      return counter;
    }

    const root = ReactTestRenderer.create(null);
    root.update(<Counter />);
    expect(Scheduler).toHaveYielded(['Count: 0']);
    expect(root).toMatchRenderedOutput('0');

  });

  it('never bails out if context has changed', () => {
    const {useState, useLayoutEffect, useContext} = React;

    const ThemeContext = React.createContext('light');

    let setTheme;
    function ThemeProvider({children}) {
      const [theme, _setTheme] = useState('light');
      Scheduler.unstable_yieldValue('Theme: ' + theme);
      setTheme = _setTheme;
      return (
        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
      );
    }

    function Child({text}) {
      Scheduler.unstable_yieldValue('Child: ' + text);
      return text;
    }

    let setCounter;
    function Parent() {
      const [counter, _setCounter] = useState(0);
      setCounter = _setCounter;

      const theme = useContext(ThemeContext);

      const text = `${counter} (${theme})`;
      Scheduler.unstable_yieldValue(`Parent: ${text}`);
      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue(`Effect: ${text}`);
      });
      return <Child text={text} />;
    }
    const root = ReactTestRenderer.create(null);
    act(() => {
      root.update(
        <ThemeProvider>
          <Parent />
        </ThemeProvider>,
      );
    });

    expect(Scheduler).toHaveYielded([
      'Theme: light',
      'Parent: 0 (light)',
      'Child: 0 (light)',
      'Effect: 0 (light)',
    ]);
    expect(root).toMatchRenderedOutput('0 (light)');

    // Updating the theme to the same value doesn't cause the consumers
    // to re-render.
    setTheme('light');
    expect(Scheduler).toHaveYielded([]);
    expect(root).toMatchRenderedOutput('0 (light)');

    // Normal update
    act(() => setCounter(1));
    expect(Scheduler).toHaveYielded([
      'Parent: 1 (light)',
      'Child: 1 (light)',
      'Effect: 1 (light)',
    ]);
    expect(root).toMatchRenderedOutput('1 (light)');

    // Update that doesn't change state, so it bails out
    // act(() => setCounter(1));
    // expect(Scheduler).toHaveYielded(['Parent: 1 (light)']);
    // expect(root).toMatchRenderedOutput('1 (light)');

    // Update that doesn't change state, but the context changes, too, so it
    // can't bail out
    act(() => {
      setCounter(1);
      setTheme('dark');
    });

    expect(Scheduler).toHaveYielded([
      'Theme: dark',
      'Parent: 1 (dark)',
      'Child: 1 (dark)',
      'Effect: 1 (dark)',
    ]);
    expect(root).toMatchRenderedOutput('1 (dark)');
  });

  it('can bail out without calling render phase (as an optimization) if queue is known to be empty', () => {
    const {useState, useLayoutEffect} = React;

    function Child({text}) {
      Scheduler.unstable_yieldValue('Child: ' + text);
      return text;
    }

    let setCounter;
    function Parent() {
      const [counter, _setCounter] = useState(0);
      setCounter = _setCounter;
      Scheduler.unstable_yieldValue('Parent: ' + counter);
      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue('Effect: ' + counter);
      });
      return <Child text={counter} />;
    }

    const root = ReactTestRenderer.create(null);
    root.update(<Parent />);
    expect(Scheduler).toHaveYielded(['Parent: 0', 'Child: 0', 'Effect: 0']);
    expect(root).toMatchRenderedOutput('0');

    // Normal update
    act(() => setCounter(1));
    expect(Scheduler).toHaveYielded(['Parent: 1', 'Child: 1', 'Effect: 1']);
    expect(root).toMatchRenderedOutput('1');

    // Update to the same state. React doesn't know if the queue is empty
    // because the alternate fiber has pending update priority, so we have to
    // enter the render phase before we can bail out. But we bail out before
    // rendering the child, and we don't fire any effects.
    // act(() => setCounter(1));
    // expect(Scheduler).toHaveYielded(['Parent: 1']);
    // expect(root).toMatchRenderedOutput('1');

    // Update to the same state again. This times, neither fiber has pending
    // update priority, so we can bail out before even entering the render phase.
    act(() => setCounter(1));
    expect(Scheduler).toFlushAndYield([]);
    expect(root).toMatchRenderedOutput('1');

    // This changes the state to something different so it renders normally.
    act(() => setCounter(2));
    expect(Scheduler).toHaveYielded(['Parent: 2', 'Child: 2', 'Effect: 2']);
    expect(root).toMatchRenderedOutput('2');

    // prepare to check SameValue
    act(() => {
      setCounter(0);
    });
    expect(Scheduler).toHaveYielded(['Parent: 0', 'Child: 0', 'Effect: 0']);
    expect(root).toMatchRenderedOutput('0');

    // Update to the same state for the first time to flush the queue
    // act(() => {
    //   setCounter(0);
    // });
    //
    // expect(Scheduler).toHaveYielded(['Parent: 0']);
    // expect(root).toMatchRenderedOutput('0');

    // Update again to the same state. Should bail out.
    act(() => {
      setCounter(0);
    });
    expect(Scheduler).toFlushAndYield([]);
    expect(root).toMatchRenderedOutput('0');

    // Update to a different state (positive 0 to negative 0)
    act(() => {
      setCounter(0 / -1);
    });
    expect(Scheduler).toHaveYielded(['Parent: 0', 'Child: 0', 'Effect: 0']);
    expect(root).toMatchRenderedOutput('0');
  });

  it('bails out multiple times in a row without entering render phase', () => {
    const {useState} = React;

    function Child({text}) {
      Scheduler.unstable_yieldValue('Child: ' + text);
      return text;
    }

    let setCounter;
    function Parent() {
      const [counter, _setCounter] = useState(0);
      setCounter = _setCounter;
      Scheduler.unstable_yieldValue('Parent: ' + counter);
      return <Child text={counter} />;
    }

    const root = ReactTestRenderer.create(null);
    root.update(<Parent />);
    expect(Scheduler).toHaveYielded(['Parent: 0', 'Child: 0']);
    expect(root).toMatchRenderedOutput('0');

    const update = value => {
      setCounter(previous => {
        Scheduler.unstable_yieldValue(
          `Compute state (${previous} -> ${value})`,
        );
        return value;
      });
    };
    ReactTestRenderer.unstable_batchedUpdates(() => {
      update(0);
      update(0);
      update(0);
      update(1);
      update(2);
      update(3);
    });

    expect(Scheduler).toHaveYielded([
      // The first four updates were eagerly computed, because the queue is
      // empty before each one.
      'Compute state (0 -> 0)',
      'Compute state (0 -> 0)',
      'Compute state (0 -> 0)',
      // The fourth update doesn't bail out
      'Compute state (0 -> 1)',
      // so subsequent updates can't be eagerly computed.
      // We don't need to re-compute the first four updates. Only the final two.
      'Compute state (1 -> 2)',
      'Compute state (2 -> 3)',
      'Parent: 3',
      'Child: 3',
    ]);

    expect(root).toMatchRenderedOutput('3');
  });

  // Concurrent
  xit('can rebase on top of a previously skipped update', () => {
    const {useState} = React;

    function Child({text}) {
      Scheduler.unstable_yieldValue('Child: ' + text);
      return text;
    }

    let setCounter;
    function Parent() {
      const [counter, _setCounter] = useState(1);
      setCounter = _setCounter;
      Scheduler.unstable_yieldValue('Parent: ' + counter);
      return <Child text={counter} />;
    }

    const root = ReactTestRenderer.create(null, {unstable_isConcurrent: true});
    root.update(<Parent />);
    expect(Scheduler).toFlushAndYield(['Parent: 1', 'Child: 1']);
    expect(root).toMatchRenderedOutput('1');

    const update = compute => {
      setCounter(previous => {
        const value = compute(previous);
        Scheduler.unstable_yieldValue(
          `Compute state (${previous} -> ${value})`,
        );
        return value;
      });
    };

    // Update at normal priority
    ReactTestRenderer.unstable_batchedUpdates(() => update(n => n * 100));

    // The new state is eagerly computed.
    expect(Scheduler).toHaveYielded(['Compute state (1 -> 100)']);

    // but before it's flushed, a higher priority update interrupts it.
    root.unstable_flushSync(() => {
      update(n => n + 5);
    });
    expect(Scheduler).toHaveYielded([
      // The eagerly computed state was completely skipped
      'Compute state (1 -> 6)',
      'Parent: 6',
      'Child: 6',
    ]);
    expect(root).toMatchRenderedOutput('6');

    // Now when we finish the first update, the second update is rebased on top.
    // Notice we didn't have to recompute the first update even though it was
    // skipped in the previous render.
    expect(Scheduler).toFlushAndYield([
      'Compute state (100 -> 105)',
      'Parent: 105',
      'Child: 105',
    ]);
    expect(root).toMatchRenderedOutput('105');
  });

  xit('does not forget render phase useState updates inside an effect', () => {
    const {useState, useEffect} = React;

    function Counter() {
      const [counter, setCounter] = useState(0);
      if (counter === 0) {
        setCounter(x => x + 1);
        setCounter(x => x + 1);
      }
      useEffect(() => {
        setCounter(x => x + 1);
        setCounter(x => x + 1);
      }, []);
      return counter;
    }

    const root = ReactTestRenderer.create(null);
    act(() => {
      root.update(<Counter />);
    });
    expect(root).toMatchRenderedOutput('4');
  });

  it('does not forget render phase useReducer updates inside an effect with hoisted reducer', () => {
    const {useReducer, useEffect} = React;

    const reducer = x => x + 1;
    function Counter() {
      const [counter, increment] = useReducer(reducer, 0);
      if (counter === 0) {
        increment();
        increment();
      }
      useEffect(() => {
        increment();
        increment();
      }, []);
      return counter;
    }

    const root = ReactTestRenderer.create(null);
    act(() => {
      root.update(<Counter />);
    });
    expect(root).toMatchRenderedOutput('4');
  });

  it('does not forget render phase useReducer updates inside an effect with inline reducer', () => {
    const {useReducer, useEffect} = React;

    function Counter() {
      const [counter, increment] = useReducer(x => x + 1, 0);
      if (counter === 0) {
        increment();
        increment();
      }
      useEffect(() => {
        increment();
        increment();
      }, []);
      return counter;
    }

    const root = ReactTestRenderer.create(null);
    act(() => {
      root.update(<Counter />);
    });
    expect(root).toMatchRenderedOutput('4');
  });

  it("throws when calling hooks inside .memo's compare function", () => {
    const {useState} = React;
    function App() {
      useState(0);
      return null;
    }
    const MemoApp = React.memo(App, () => {
      useState(0);
      return false;
    });

    const root = ReactTestRenderer.create(<MemoApp />);
    // trying to render again should trigger comparison and throw
    expect(() => root.update(<MemoApp />)).toThrow(
      'Hooks should be used inside function component.',
    );
    // and then again, fail
    expect(() => root.update(<MemoApp />)).toThrow(
      'Hooks should be used inside function component.',
    );
  });

  it('double-invokes useMemo in DEV StrictMode despite []', () => {
    const {useMemo, StrictMode} = React;

    let useMemoCount = 0;
    function BadUseMemo() {
      useMemo(() => {
        useMemoCount++;
      }, []);
      return <div />;
    }

    useMemoCount = 0;
    ReactTestRenderer.create(
      <StrictMode>
        <BadUseMemo />
      </StrictMode>,
    );
    expect(useMemoCount).toBe(1); // Has Hooks
  });

  describe('hook ordering', () => {
    const useCallbackHelper = () => React.useCallback(() => {}, []);
    const useContextHelper = () => React.useContext(React.createContext());
    const useEffectHelper = () => React.useEffect(() => () => {}, []);
    const useImperativeHandleHelper = () => {
      React.useImperativeHandle({current: null}, () => ({}), []);
    };
    const useLayoutEffectHelper = () =>
      React.useLayoutEffect(() => () => {}, []);
    const useMemoHelper = () => React.useMemo(() => 123, []);
    const useReducerHelper = () => React.useReducer((s, a) => a, 0);
    const useRefHelper = () => React.useRef(null);
    const useStateHelper = () => React.useState(0);

    // We don't include useImperativeHandleHelper in this set,
    // because it generates an additional warning about the inputs length changing.
    // We test it below with its own test.
    const orderedHooks = [
      useCallbackHelper,
      useContextHelper,
      useEffectHelper,
      useLayoutEffectHelper,
      useMemoHelper,
      useReducerHelper,
      useRefHelper,
      useStateHelper,
    ];

    // We don't include useContext in this set,
    // because they aren't added to the hooks list and so won't throw.
    const hooksInList = [
      useCallbackHelper,
      useEffectHelper,
      useImperativeHandleHelper,
      useLayoutEffectHelper,
      useMemoHelper,
      useReducerHelper,
      useRefHelper,
      useStateHelper,
    ];

    hooksInList.forEach((firstHelper, index) => {
      const secondHelper =
        index > 0
          ? hooksInList[index - 1]
          : hooksInList[hooksInList.length - 1];

      const hookNameA = firstHelper.name
        .replace('use', '')
        .replace('Helper', '');
      const hookNameB = secondHelper.name
        .replace('use', '')
        .replace('Helper', '');

      it(`warns when fewer hooks (${(hookNameA,
      hookNameB)}) are used during update than mount`, () => {
        function App(props) {
          /* eslint-disable no-unused-vars */
          if (props.update) {
            firstHelper();
          } else {
            firstHelper();
            secondHelper();
          }
          return null;
          /* eslint-enable no-unused-vars */
        }
        let root;
        act(() => {
          root = ReactTestRenderer.create(<App update={false} />);
        });

        expect(() => {
          act(() => {
            root.update(<App update={true} />);
          });
        }).toThrow('Hooks are less than expected, please check whether the hook is written in the condition.');
      });
    });
  });

  // Regression test for https://github.com/facebook/react/issues/14790
  it('does not fire a false positive warning when suspending memo', async () => {
    const {Suspense, useState} = React;

    let wasSuspended = false;
    function trySuspend() {
      if (!wasSuspended) {
        throw new Promise(resolve => {
          wasSuspended = true;
          resolve();
        });
      }
    }

    function Child() {
      useState();
      trySuspend();
      return 'hello';
    }

    const Wrapper = React.memo(Child);
    const root = ReactTestRenderer.create(
      <Suspense fallback="loading">
        <Wrapper />
      </Suspense>,
    );
    expect(root).toMatchRenderedOutput('loading');
    await Promise.resolve();
    Scheduler.unstable_flushAll();
    expect(root).toMatchRenderedOutput('hello');
  });

  // Regression test for https://github.com/facebook/react/issues/14790
  it('does not fire a false positive warning when suspending forwardRef', async () => {
    const {Suspense, useState} = React;

    let wasSuspended = false;
    function trySuspend() {
      if (!wasSuspended) {
        throw new Promise(resolve => {
          wasSuspended = true;
          resolve();
        });
      }
    }

    function render(props, ref) {
      useState();
      trySuspend();
      return 'hello';
    }

    const Wrapper = React.forwardRef(render);
    const root = ReactTestRenderer.create(
      <Suspense fallback="loading">
        <Wrapper />
      </Suspense>,
    );
    expect(root).toMatchRenderedOutput('loading');
    await Promise.resolve();
    Scheduler.unstable_flushAll();
    expect(root).toMatchRenderedOutput('hello');
  });

  // Regression test for https://github.com/facebook/react/issues/14790
  it('does not fire a false positive warning when suspending memo(forwardRef)', async () => {
    const {Suspense, useState} = React;

    let wasSuspended = false;
    function trySuspend() {
      if (!wasSuspended) {
        throw new Promise(resolve => {
          wasSuspended = true;
          resolve();
        });
      }
    }

    function render(props, ref) {
      useState();
      trySuspend();
      return 'hello';
    }

    const Wrapper = React.memo(React.forwardRef(render));
    const root = ReactTestRenderer.create(
      <Suspense fallback="loading">
        <Wrapper />
      </Suspense>,
    );
    expect(root).toMatchRenderedOutput('loading');
    await Promise.resolve();
    Scheduler.unstable_flushAll();
    expect(root).toMatchRenderedOutput('hello');
  });

  // Regression test for https://github.com/facebook/react/issues/15732
  it('resets hooks when an error is thrown in the middle of a list of hooks', async () => {
    const {useEffect, useState} = React;

    class ErrorBoundary extends React.Component {
      state = {hasError: false};

      static getDerivedStateFromError() {
        return {hasError: true};
      }

      render() {
        return (
          <Wrapper>
            {this.state.hasError ? 'Error!' : this.props.children}
          </Wrapper>
        );
      }
    }

    function Wrapper({children}) {
      return children;
    }

    let setShouldThrow;
    function Thrower() {
      const [shouldThrow, _setShouldThrow] = useState(false);
      setShouldThrow = _setShouldThrow;

      if (shouldThrow) {
        throw new Error('Throw!');
      }

      useEffect(() => {}, []);

      return 'Throw!';
    }

    let root;
    act(() => {
      root = ReactTestRenderer.create(
        <ErrorBoundary>
          <Thrower />
        </ErrorBoundary>,
      );
    });

    expect(root).toMatchRenderedOutput('Throw!');
    act(() => setShouldThrow(true));
    expect(root).toMatchRenderedOutput('Error!');
  });
});
