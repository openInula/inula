/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

'use strict';

let React;
let ReactNoop;
let Scheduler;

// Copied from ReactFiberLanes. Don't do this!
// This is hard coded directly to avoid needing to import, and
// we'll remove this as we replace runWithPriority with React APIs.
const InputContinuousLanePriority = 10;

describe('ReactIncrementalUpdates', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();

    ReactNoop = require('react-noop-renderer');
    React = require('horizon-external');
    Scheduler = require('scheduler');
  });

  function span(prop) {
    return {type: 'span', children: [], prop, hidden: false};
  }


  it('applies updates with equal priority in insertion order', () => {
    let state;
    class Foo extends React.Component {
      state = {};
      componentDidMount() {
        // All have Task priority
        this.setState({a: 'a'});
        this.setState({b: 'b'});
        this.setState({c: 'c'});
      }
      render() {
        state = this.state;
        return <div />;
      }
    }

    ReactNoop.render(<Foo />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(state).toEqual({a: 'a', b: 'b', c: 'c'});
  });

  // Concurrent
  xit('can abort an update, schedule additional updates, and resume', () => {
    let instance;
    class Foo extends React.Component {
      state = {};
      render() {
        instance = this;
        return (
          <span
            prop={Object.keys(this.state)
              .sort()
              .join('')}
          />
        );
      }
    }

    ReactNoop.render(<Foo />);
    expect(Scheduler).toFlushWithoutYielding();

    function createUpdate(letter) {
      return () => {
        Scheduler.unstable_yieldValue(letter);
        return {
          [letter]: letter,
        };
      };
    }

    // Schedule some async updates
    instance.setState(createUpdate('a'));
    instance.setState(createUpdate('b'));
    instance.setState(createUpdate('c'));

    // Begin the updates but don't flush them yet
    expect(Scheduler).toFlushAndYieldThrough(['a', 'b', 'c']);
    expect(ReactNoop.getChildren()).toEqual([span('')]);

    // Schedule some more updates at different priorities
    instance.setState(createUpdate('d'));
    ReactNoop.flushSync(() => {
      instance.setState(createUpdate('e'));
      instance.setState(createUpdate('f'));
    });
    instance.setState(createUpdate('g'));

    // The sync updates should have flushed, but not the async ones
    expect(Scheduler).toHaveYielded(['e', 'f']);
    expect(ReactNoop.getChildren()).toEqual([span('ef')]);

    // Now flush the remaining work. Even though e and f were already processed,
    // they should be processed again, to ensure that the terminal state
    // is deterministic.
    expect(Scheduler).toFlushAndYield(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expect(ReactNoop.getChildren()).toEqual([span('abcdefg')]);
  });

  // Concurrent
  xit('can abort an update, schedule a replaceState, and resume', () => {
    let instance;
    class Foo extends React.Component {
      state = {};
      render() {
        instance = this;
        return (
          <span
            prop={Object.keys(this.state)
              .sort()
              .join('')}
          />
        );
      }
    }

    ReactNoop.render(<Foo />);
    expect(Scheduler).toFlushWithoutYielding();

    function createUpdate(letter) {
      return () => {
        Scheduler.unstable_yieldValue(letter);
        return {
          [letter]: letter,
        };
      };
    }

    // Schedule some async updates
    instance.setState(createUpdate('a'));
    instance.setState(createUpdate('b'));
    instance.setState(createUpdate('c'));

    // Begin the updates but don't flush them yet
    expect(Scheduler).toFlushAndYieldThrough(['a', 'b', 'c']);
    expect(ReactNoop.getChildren()).toEqual([span('')]);

    // Schedule some more updates at different priorities{
    instance.setState(createUpdate('d'));
    ReactNoop.flushSync(() => {
      instance.setState(createUpdate('e'));
      // No longer a public API, but we can test that it works internally by
      // reaching into the updater.
      instance.updater.enqueueReplaceState(instance, createUpdate('f'));
    });
    instance.setState(createUpdate('g'));

    // The sync updates should have flushed, but not the async ones. Update d
    // was dropped and replaced by e.
    expect(Scheduler).toHaveYielded(['e', 'f']);
    expect(ReactNoop.getChildren()).toEqual([span('f')]);

    // Now flush the remaining work. Even though e and f were already processed,
    // they should be processed again, to ensure that the terminal state
    // is deterministic.
    expect(Scheduler).toFlushAndYield(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expect(ReactNoop.getChildren()).toEqual([span('fg')]);
  });

  it('does not call callbacks that are scheduled by another callback until a later commit', () => {
    class Foo extends React.Component {
      state = {};
      componentDidMount() {
        Scheduler.unstable_yieldValue('did mount');
        this.setState({a: 'a'}, () => {
          Scheduler.unstable_yieldValue('callback a');
          this.setState({b: 'b'}, () => {
            Scheduler.unstable_yieldValue('callback b');
          });
        });
      }
      render() {
        Scheduler.unstable_yieldValue('render');
        return <div />;
      }
    }

    ReactNoop.render(<Foo />);
    expect(Scheduler).toHaveYielded([
      'render',
      'did mount',
      'render',
      'callback a',
      'render',
      'callback b',
    ]);
  });

  it('getDerivedStateFromProps should update base state of updateQueue (based on product bug)', () => {
    // Based on real-world bug.

    let foo;
    class Foo extends React.Component {
      state = {value: 'initial state'};
      static getDerivedStateFromProps() {
        return {value: 'derived state'};
      }
      render() {
        foo = this;
        return (
          <>
            <span prop={this.state.value} />
            <Bar />
          </>
        );
      }
    }

    let bar;
    class Bar extends React.Component {
      render() {
        bar = this;
        return null;
      }
    }

    ReactNoop.render(<Foo />);
    expect(ReactNoop.getChildren()).toEqual([span('derived state')]);

    // Triggers getDerivedStateFromProps again
    ReactNoop.render(<Foo />);
    // The noop callback is needed to trigger the specific internal path that
    // led to this bug. Removing it causes it to "accidentally" work.
    foo.setState({value: 'update state'}, function noop() {});

    expect(ReactNoop.getChildren()).toEqual([span('derived state')]);

    bar.setState({});
    expect(ReactNoop.getChildren()).toEqual([span('derived state')]);
  });

  // Concurrent
  xit('regression: does not expire soon due to layout effects in the last batch', () => {
    const {useState, useLayoutEffect} = React;

    let setCount;
    function App() {
      const [count, _setCount] = useState(0);
      setCount = _setCount;
      Scheduler.unstable_yieldValue('Render: ' + count);
      useLayoutEffect(() => {
        setCount(prevCount => prevCount + 1);
        Scheduler.unstable_yieldValue('Commit: ' + count);
      }, []);
      return null;
    }

    ReactNoop.act(() => {
      ReactNoop.render(<App />);
      expect(Scheduler).toFlushExpired([]);
      expect(Scheduler).toFlushAndYield([
        'Render: 0',
        'Commit: 0',
        'Render: 1',
      ]);

      Scheduler.unstable_advanceTime(10000);

      setCount(2);
      expect(Scheduler).toFlushExpired([]);
    });
  });

  // Concurrent
  xit('regression: does not expire soon due to previous flushSync', () => {
    function Text({text}) {
      Scheduler.unstable_yieldValue(text);
      return text;
    }

    ReactNoop.flushSync(() => {
      ReactNoop.render(<Text text="A" />);
    });
    expect(Scheduler).toHaveYielded(['A']);

    Scheduler.unstable_advanceTime(10000);

    ReactNoop.render(<Text text="B" />);
    expect(Scheduler).toFlushExpired([]);
  });

  // Concurrent
  xit('regression: does not expire soon due to previous expired work', () => {
    function Text({text}) {
      Scheduler.unstable_yieldValue(text);
      return text;
    }

    ReactNoop.render(<Text text="A" />);
    Scheduler.unstable_advanceTime(10000);
    expect(Scheduler).toFlushExpired(['A']);

    Scheduler.unstable_advanceTime(10000);

    ReactNoop.render(<Text text="B" />);
    expect(Scheduler).toFlushExpired([]);
  });

  // Concurrent
  xit('when rebasing, does not exclude updates that were already committed, regardless of priority', async () => {
    const {useState, useLayoutEffect} = React;

    let pushToLog;
    function App() {
      const [log, setLog] = useState('');
      pushToLog = msg => {
        setLog(prevLog => prevLog + msg);
      };

      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue('Committed: ' + log);
        if (log === 'B') {
          // Right after B commits, schedule additional updates.
          // TODO: Double wrapping is temporary while we remove Scheduler runWithPriority.
          ReactNoop.runSync(() =>
            Scheduler.runSync(
              () => {
                pushToLog('C');
              },
              Scheduler.unstable_UserBlockingPriority
            ),
            InputContinuousLanePriority
          );
          setLog(prevLog => prevLog + 'D');
        }
      }, [log]);

      return log;
    }

    const root = ReactNoop.createRoot();
    await ReactNoop.act(async () => {
      root.render(<App />);
    });
    expect(Scheduler).toHaveYielded(['Committed: ']);
    expect(root).toMatchRenderedOutput('');

    await ReactNoop.act(async () => {
      pushToLog('A');

      // TODO: Double wrapping is temporary while we remove Scheduler runWithPriority.
      ReactNoop.runSync(() =>
        Scheduler.runSync(
          () => {
            pushToLog('B');
          },
          Scheduler.unstable_UserBlockingPriority
        ),
        InputContinuousLanePriority
      );
    });
    expect(Scheduler).toHaveYielded([
      // A and B are pending. B is higher priority, so we'll render that first.
      'Committed: B',
      // Because A comes first in the queue, we're now in rebase mode. B must
      // be rebased on top of A. Also, in a layout effect, we received two new
      // updates: C and D. C is user-blocking and D is synchronous.
      //
      // First render the synchronous update. What we're testing here is that
      // B *is not dropped* even though it has lower than sync priority. That's
      // because we already committed it. However, this render should not
      // include C, because that update wasn't already committed.
      'Committed: BD',
      'Committed: BCD',
      'Committed: ABCD',
    ]);
    expect(root).toMatchRenderedOutput('ABCD');
  });

  // Concurrent
  xit('when rebasing, does not exclude updates that were already committed, regardless of priority (classes)', async () => {
    let pushToLog;
    class App extends React.Component {
      state = {log: ''};
      pushToLog = msg => {
        this.setState(prevState => ({log: prevState.log + msg}));
      };
      componentDidUpdate() {
        Scheduler.unstable_yieldValue('Committed: ' + this.state.log);
        if (this.state.log === 'B') {
          // Right after B commits, schedule additional updates.
          // TODO: Double wrapping is temporary while we remove Scheduler runWithPriority.
          ReactNoop.runSync(() =>
            Scheduler.runSync(
              () => {
                this.pushToLog('C');
              },
              Scheduler.unstable_UserBlockingPriority
            ),
            InputContinuousLanePriority
          );
          this.pushToLog('D');
        }
      }
      render() {
        pushToLog = this.pushToLog;
        return this.state.log;
      }
    }

    const root = ReactNoop.createRoot();
    await ReactNoop.act(async () => {
      root.render(<App />);
    });
    expect(Scheduler).toHaveYielded([]);
    expect(root).toMatchRenderedOutput('');

    await ReactNoop.act(async () => {
      pushToLog('A');
      // TODO: Double wrapping is temporary while we remove Scheduler runWithPriority.
      ReactNoop.runSync(() =>
        Scheduler.runSync(
          () => {
            pushToLog('B');
          },
          Scheduler.unstable_UserBlockingPriority,
        ),
        InputContinuousLanePriority
      );
    });
    expect(Scheduler).toHaveYielded([
      // A and B are pending. B is higher priority, so we'll render that first.
      'Committed: B',
      // Because A comes first in the queue, we're now in rebase mode. B must
      // be rebased on top of A. Also, in a layout effect, we received two new
      // updates: C and D. C is user-blocking and D is synchronous.
      //
      // First render the synchronous update. What we're testing here is that
      // B *is not dropped* even though it has lower than sync priority. That's
      // because we already committed it. However, this render should not
      // include C, because that update wasn't already committed.
      'Committed: BD',
      'Committed: BCD',
      'Committed: ABCD',
    ]);
    expect(root).toMatchRenderedOutput('ABCD');
  });

  it("base state of update queue is initialized to its fiber's memoized state", async () => {
    // This test is very weird because it tests an implementation detail but
    // is tested in terms of public APIs. When it was originally written, the
    // test failed because the update queue was initialized to the state of
    // the alternate fiber.
    let app;
    class App extends React.Component {
      state = {prevProp: 'A', count: 0};
      static getDerivedStateFromProps(props, state) {
        // Add 100 whenever the label prop changes. The prev label is stored
        // in state. If the state is dropped incorrectly, we'll fail to detect
        // prop changes.
        if (props.prop !== state.prevProp) {
          return {
            prevProp: props.prop,
            count: state.count + 100,
          };
        }
        return null;
      }
      render() {
        app = this;
        return this.state.count;
      }
    }

    await ReactNoop.act(async () => {
      ReactNoop.render(<App prop="A" />);
    });
    expect(ReactNoop).toMatchRenderedOutput('0');

    // Changing the prop causes the count to increase by 100
    await ReactNoop.act(async () => {
      ReactNoop.render(<App prop="B" />);
    });
    expect(ReactNoop).toMatchRenderedOutput('100');

    // Now increment the count by 1 with a state update. And, in the same
    // batch, change the prop back to its original value.
    await ReactNoop.act(async () => {
      ReactNoop.render(<App prop="A" />);
      app.setState(state => ({count: state.count + 1}));
    });
    // There were two total prop changes, plus an increment.
    expect(ReactNoop).toMatchRenderedOutput('201');
  });
});
