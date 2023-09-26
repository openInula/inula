let React;
let ReactTestRenderer;
let Scheduler;
let SchedulerTracing;
let ReactCache;
let Suspense;
let act;

let TextResource;
let textResourceShouldFail;

// Additional tests can be found in ReactSuspenseWithNoopRenderer. Plan is
// to gradually migrate those to this file.
describe('ReactSuspense', () => {
  beforeEach(() => {
    jest.resetModules();
    ReactTestRenderer = require('react-test-renderer');
    React = require('horizon-external');
    act = ReactTestRenderer.unstable_concurrentAct;
    Scheduler = require('scheduler');
    ReactCache = require('react-cache');

    Suspense = React.Suspense;

    TextResource = ReactCache.unstable_createResource(
      ([text, ms = 0]) => {
        let listeners = null;
        let status = 'pending';
        let value = null;
        return {
          then(resolve, reject) {
            switch (status) {
              case 'pending': {
                if (listeners === null) {
                  listeners = [{resolve, reject}];
                  setTimeout(() => {
                    if (textResourceShouldFail) {
                      Scheduler.unstable_yieldValue(
                        `Promise rejected [${text}]`,
                      );
                      status = 'rejected';
                      value = new Error('Failed to load: ' + text);
                      listeners.forEach(listener => listener.reject(value));
                    } else {
                      Scheduler.unstable_yieldValue(
                        `Promise resolved [${text}]`,
                      );
                      status = 'resolved';
                      value = text;
                      listeners.forEach(listener => listener.resolve(value));
                    }
                  }, ms);
                } else {
                  listeners.push({resolve, reject});
                }
                break;
              }
              case 'resolved': {
                resolve(value);
                break;
              }
              case 'rejected': {
                reject(value);
                break;
              }
            }
          },
        };
      },
      ([text, ms]) => text,
    );
    textResourceShouldFail = false;
  });

  function Text(props) {
    Scheduler.unstable_yieldValue(props.text);
    return props.text;
  }

  function AsyncText(props) {
    const text = props.text;
    try {
      TextResource.read([props.text, props.ms]);
      Scheduler.unstable_yieldValue(text);
      return text;
    } catch (promise) {
      if (typeof promise.then === 'function') {
        Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
      } else {
        Scheduler.unstable_yieldValue(`Error! [${text}]`);
      }
      throw promise;
    }
  }

  it('mounts a lazy class component in non-concurrent mode', async () => {
    class Class extends React.Component {
      componentDidMount() {
        Scheduler.unstable_yieldValue('Did mount: ' + this.props.label);
      }
      componentDidUpdate() {
        Scheduler.unstable_yieldValue('Did update: ' + this.props.label);
      }
      render() {
        return <Text text={this.props.label} />;
      }
    }

    async function fakeImport(result) {
      return {default: result};
    }

    const LazyClass = React.lazy(() => fakeImport(Class));

    const root = ReactTestRenderer.create(
      <Suspense fallback={<Text text="Loading..." />}>
        <LazyClass label="Hi" />
      </Suspense>,
    );

    expect(Scheduler).toHaveYielded(['Loading...']);
    expect(root).toMatchRenderedOutput('Loading...');

    await LazyClass;

    expect(Scheduler).toFlushExpired(['Hi', 'Did mount: Hi']);
    expect(root).toMatchRenderedOutput('Hi');
  });

  describe('outside concurrent mode', () => {
    it('a mounted class component can suspend without losing state', () => {
      class TextWithLifecycle extends React.Component {
        componentDidMount() {
          Scheduler.unstable_yieldValue(`Mount [${this.props.text}]`);
        }
        componentDidUpdate() {
          Scheduler.unstable_yieldValue(`Update [${this.props.text}]`);
        }
        componentWillUnmount() {
          Scheduler.unstable_yieldValue(`Unmount [${this.props.text}]`);
        }
        render() {
          return <Text {...this.props} />;
        }
      }

      let instance;
      class AsyncTextWithLifecycle extends React.Component {
        state = {step: 1};
        componentDidMount() {
          Scheduler.unstable_yieldValue(
            `Mount [${this.props.text}:${this.state.step}]`,
          );
        }
        componentDidUpdate() {
          Scheduler.unstable_yieldValue(
            `Update [${this.props.text}:${this.state.step}]`,
          );
        }
        componentWillUnmount() {
          Scheduler.unstable_yieldValue(
            `Unmount [${this.props.text}:${this.state.step}]`,
          );
        }
        render() {
          instance = this;
          const text = `${this.props.text}:${this.state.step}`;
          const ms = this.props.ms;
          try {
            TextResource.read([text, ms]);
            Scheduler.unstable_yieldValue(text);
            return text;
          } catch (promise) {
            if (typeof promise.then === 'function') {
              Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
            } else {
              Scheduler.unstable_yieldValue(`Error! [${text}]`);
            }
            throw promise;
          }
        }
      }

      function App() {
        return (
          <Suspense fallback={<TextWithLifecycle text="Loading..." />}>
            <TextWithLifecycle text="A" />
            <AsyncTextWithLifecycle ms={100} text="B" ref={instance} />
            <TextWithLifecycle text="C" />
          </Suspense>
        );
      }

      const root = ReactTestRenderer.create(<App />);

      expect(Scheduler).toHaveYielded([
        'A',
        'Suspend! [B:1]',
        'C',
        'Mount [A]',
        // B's lifecycle should not fire because it suspended
        // 'Mount [B]',
        'Mount [C]',
        'Loading...',
        'Mount [Loading...]',
      ]);
      expect(root).toMatchRenderedOutput('Loading...');

      jest.advanceTimersByTime(100);

      expect(Scheduler).toHaveYielded(['Promise resolved [B:1]']);
      expect(Scheduler).toFlushExpired([
        'B:1',
        'Unmount [Loading...]',
        // Should be a mount, not an update
        'Mount [B:1]',
      ]);
      expect(root).toMatchRenderedOutput('AB:1C');

      instance.setState({step: 2});
      expect(Scheduler).toHaveYielded([
        'Suspend! [B:2]',
        'Loading...',
        'Mount [Loading...]',
      ]);
      expect(root).toMatchRenderedOutput('Loading...');

      jest.advanceTimersByTime(100);

      expect(Scheduler).toHaveYielded(['Promise resolved [B:2]']);
    });

    it('bails out on timed-out primary children even if they receive an update', () => {
      let instance;
      class Stateful extends React.Component {
        state = {step: 1};
        render() {
          instance = this;
          return <Text text={`Stateful: ${this.state.step}`} />;
        }
      }

      function App(props) {
        return (
          <Suspense fallback={<Text text="Loading..." />}>
            <Stateful />
            <AsyncText ms={1000} text={props.text} />
          </Suspense>
        );
      }

      const root = ReactTestRenderer.create(<App text="A" />);

      expect(Scheduler).toHaveYielded([
        'Stateful: 1',
        'Suspend! [A]',
        'Loading...',
      ]);

      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [A]']);
      expect(Scheduler).toFlushExpired(['A']);
      expect(root).toMatchRenderedOutput('Stateful: 1A');

      root.update(<App text="B" />);
      expect(Scheduler).toHaveYielded([
        'Stateful: 1',
        'Suspend! [B]',
        'Loading...',
      ]);
      expect(root).toMatchRenderedOutput('Loading...');

      instance.setState({step: 2});
      expect(Scheduler).toHaveYielded(['Stateful: 2']);
      expect(root).toMatchRenderedOutput('Loading...');

      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [B]']);
      expect(Scheduler).toFlushExpired(['B']);
      expect(root).toMatchRenderedOutput('Stateful: 2B');
    });

    it('when updating a timed-out tree, always retries the suspended component', () => {
      let instance;
      class Stateful extends React.Component {
        state = {step: 1};
        render() {
          instance = this;
          return <Text text={`Stateful: ${this.state.step}`} />;
        }
      }

      const Indirection = React.Fragment;

      function App(props) {
        return (
          <Suspense fallback={<Text text="Loading..." />}>
            <Stateful />
            <Indirection>
              <Indirection>
                <Indirection>
                  <AsyncText ms={1000} text={props.text} />
                </Indirection>
              </Indirection>
            </Indirection>
          </Suspense>
        );
      }

      const root = ReactTestRenderer.create(<App text="A" />);

      expect(Scheduler).toHaveYielded([
        'Stateful: 1',
        'Suspend! [A]',
        'Loading...',
      ]);

      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [A]']);
      expect(Scheduler).toFlushExpired(['A']);
      expect(root).toMatchRenderedOutput('Stateful: 1A');

      root.update(<App text="B" />);
      expect(Scheduler).toHaveYielded([
        'Stateful: 1',
        'Suspend! [B]',
        'Loading...',
      ]);
      expect(root).toMatchRenderedOutput('Loading...');

      instance.setState({step: 2});
      expect(Scheduler).toHaveYielded([
        'Stateful: 2',
      ]);
      expect(root).toMatchRenderedOutput('Loading...');

      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [B]']);
      expect(Scheduler).toFlushExpired(['B']);
      expect(root).toMatchRenderedOutput('Stateful: 2B');
    });

    it('suspends in a class that has componentWillUnmount and is then deleted', () => {
      class AsyncTextWithUnmount extends React.Component {
        componentWillUnmount() {
          Scheduler.unstable_yieldValue('will unmount');
        }
        render() {
          const text = this.props.text;
          const ms = this.props.ms;
          try {
            TextResource.read([text, ms]);
            Scheduler.unstable_yieldValue(text);
            return text;
          } catch (promise) {
            if (typeof promise.then === 'function') {
              Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
            } else {
              Scheduler.unstable_yieldValue(`Error! [${text}]`);
            }
            throw promise;
          }
        }
      }

      function App({text}) {
        return (
          <Suspense fallback={<Text text="Loading..." />}>
            <AsyncTextWithUnmount text={text} ms={100} />
          </Suspense>
        );
      }

      const root = ReactTestRenderer.create(<App text="A" />);
      expect(Scheduler).toHaveYielded(['Suspend! [A]', 'Loading...']);
      root.update(<Text text="B" />);
      // Should not fire componentWillUnmount
      expect(Scheduler).toHaveYielded(['B']);
      expect(root).toMatchRenderedOutput('B');
    });

    it('suspends in a component that also contains useEffect', () => {
      const {useLayoutEffect} = React;

      function AsyncTextWithEffect(props) {
        const text = props.text;

        useLayoutEffect(() => {
          Scheduler.unstable_yieldValue('Did commit: ' + text);
        }, [text]);

        try {
          TextResource.read([props.text, props.ms]);
          Scheduler.unstable_yieldValue(text);
          return text;
        } catch (promise) {
          if (typeof promise.then === 'function') {
            Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
          } else {
            Scheduler.unstable_yieldValue(`Error! [${text}]`);
          }
          throw promise;
        }
      }

      function App({text}) {
        return (
          <Suspense fallback={<Text text="Loading..." />}>
            <AsyncTextWithEffect text={text} ms={100} />
          </Suspense>
        );
      }

      ReactTestRenderer.create(<App text="A" />);
      expect(Scheduler).toHaveYielded(['Suspend! [A]', 'Loading...']);
      jest.advanceTimersByTime(500);

      expect(Scheduler).toHaveYielded(['Promise resolved [A]']);
      expect(Scheduler).toFlushExpired(['A', 'Did commit: A']);
    });

    it('does not remount the fallback while suspended children resolve in legacy mode', () => {
      let mounts = 0;
      class ShouldMountOnce extends React.Component {
        componentDidMount() {
          mounts++;
        }
        render() {
          return <Text text="Loading..." />;
        }
      }

      function App(props) {
        return (
          <Suspense fallback={<ShouldMountOnce />}>
            <AsyncText ms={1000} text="Child 1" />
            <AsyncText ms={2000} text="Child 2" />
            <AsyncText ms={3000} text="Child 3" />
          </Suspense>
        );
      }

      const root = ReactTestRenderer.create(<App />);

      // Initial render
      expect(Scheduler).toHaveYielded([
        'Suspend! [Child 1]',
        'Suspend! [Child 2]',
        'Suspend! [Child 3]',
        'Loading...',
      ]);
      expect(Scheduler).toFlushAndYield([]);

      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [Child 1]']);
      expect(Scheduler).toFlushExpired([
        'Child 1',
        'Suspend! [Child 2]',
        'Suspend! [Child 3]',
        'Loading...',
      ]);

      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [Child 2]']);
      expect(Scheduler).toFlushExpired(['Child 2', 'Suspend! [Child 3]', "Loading..."]);

      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [Child 3]']);
      expect(Scheduler).toFlushExpired(['Child 3']);
      expect(root).toMatchRenderedOutput(
        ['Child 1', 'Child 2', 'Child 3'].join(''),
      );
      expect(mounts).toBe(3);
    });


    it('#14162', () => {
      const {lazy} = React;

      function Hello() {
        return <span>hello</span>;
      }

      async function fetchComponent() {
        return new Promise(r => {
          // simulating a delayed import() call
          setTimeout(r, 1000, {default: Hello});
        });
      }

      const LazyHello = lazy(fetchComponent);

      class App extends React.Component {
        state = {render: false};

        componentDidMount() {
          setTimeout(() => this.setState({render: true}));
        }

        render() {
          return (
            <Suspense fallback={<span>loading...</span>}>
              {this.state.render && <LazyHello />}
            </Suspense>
          );
        }
      }

      const root = ReactTestRenderer.create(null);

      root.update(<App name="world" />);
      jest.advanceTimersByTime(1000);
    });

    it('updates memoized child of suspense component when context updates (simple memo)', () => {
      const {useContext, createContext, useState, memo} = React;

      const ValueContext = createContext(null);

      const MemoizedChild = memo(function MemoizedChild() {
        const text = useContext(ValueContext);
        try {
          TextResource.read([text, 1000]);
          Scheduler.unstable_yieldValue(text);
          return text;
        } catch (promise) {
          if (typeof promise.then === 'function') {
            Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
          } else {
            Scheduler.unstable_yieldValue(`Error! [${text}]`);
          }
          throw promise;
        }
      });

      let setValue;
      function App() {
        const [value, _setValue] = useState('default');
        setValue = _setValue;

        return (
          <ValueContext.Provider value={value}>
            <Suspense fallback={<Text text="Loading..." />}>
              <MemoizedChild />
            </Suspense>
          </ValueContext.Provider>
        );
      }

      const root = ReactTestRenderer.create(<App />);
      expect(Scheduler).toHaveYielded(['Suspend! [default]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [default]']);
      expect(Scheduler).toFlushExpired(['default']);
      expect(root).toMatchRenderedOutput('default');

      act(() => setValue('new value'));
      expect(Scheduler).toHaveYielded(['Suspend! [new value]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [new value]']);
      expect(Scheduler).toFlushExpired(['new value']);
      expect(root).toMatchRenderedOutput('new value');
    });

    it('updates memoized child of suspense component when context updates (manual memo)', () => {
      const {useContext, createContext, useState, memo} = React;

      const ValueContext = createContext(null);

      const MemoizedChild = memo(
        function MemoizedChild() {
          const text = useContext(ValueContext);
          try {
            TextResource.read([text, 1000]);
            Scheduler.unstable_yieldValue(text);
            return text;
          } catch (promise) {
            if (typeof promise.then === 'function') {
              Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
            } else {
              Scheduler.unstable_yieldValue(`Error! [${text}]`);
            }
            throw promise;
          }
        },
        function areEqual(prevProps, nextProps) {
          return true;
        },
      );

      let setValue;
      function App() {
        const [value, _setValue] = useState('default');
        setValue = _setValue;

        return (
          <ValueContext.Provider value={value}>
            <Suspense fallback={<Text text="Loading..." />}>
              <MemoizedChild />
            </Suspense>
          </ValueContext.Provider>
        );
      }

      const root = ReactTestRenderer.create(<App />);
      expect(Scheduler).toHaveYielded(['Suspend! [default]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [default]']);
      expect(Scheduler).toFlushExpired(['default']);
      expect(root).toMatchRenderedOutput('default');

      act(() => setValue('new value'));
      expect(Scheduler).toHaveYielded(['Suspend! [new value]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [new value]']);
      expect(Scheduler).toFlushExpired(['new value']);
      expect(root).toMatchRenderedOutput('new value');
    });

    it('updates memoized child of suspense component when context updates (function)', () => {
      const {useContext, createContext, useState} = React;

      const ValueContext = createContext(null);

      function MemoizedChild() {
        const text = useContext(ValueContext);
        try {
          TextResource.read([text, 1000]);
          Scheduler.unstable_yieldValue(text);
          return text;
        } catch (promise) {
          if (typeof promise.then === 'function') {
            Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
          } else {
            Scheduler.unstable_yieldValue(`Error! [${text}]`);
          }
          throw promise;
        }
      }

      let setValue;
      function App({children}) {
        const [value, _setValue] = useState('default');
        setValue = _setValue;

        return (
          <ValueContext.Provider value={value}>
            {children}
          </ValueContext.Provider>
        );
      }

      const root = ReactTestRenderer.create(
        <App>
          <Suspense fallback={<Text text="Loading..." />}>
            <MemoizedChild />
          </Suspense>
        </App>,
      );
      expect(Scheduler).toHaveYielded(['Suspend! [default]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [default]']);
      expect(Scheduler).toFlushExpired(['default']);
      expect(root).toMatchRenderedOutput('default');

      act(() => setValue('new value'));
      expect(Scheduler).toHaveYielded(['Suspend! [new value]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [new value]']);
      expect(Scheduler).toFlushExpired(['new value']);
      expect(root).toMatchRenderedOutput('new value');
    });

    it('updates memoized child of suspense component when context updates (forwardRef)', () => {
      const {forwardRef, useContext, createContext, useState} = React;

      const ValueContext = createContext(null);

      const MemoizedChild = forwardRef(function MemoizedChild() {
        const text = useContext(ValueContext);
        try {
          TextResource.read([text, 1000]);
          Scheduler.unstable_yieldValue(text);
          return text;
        } catch (promise) {
          if (typeof promise.then === 'function') {
            Scheduler.unstable_yieldValue(`Suspend! [${text}]`);
          } else {
            Scheduler.unstable_yieldValue(`Error! [${text}]`);
          }
          throw promise;
        }
      });

      let setValue;
      function App() {
        const [value, _setValue] = useState('default');
        setValue = _setValue;

        return (
          <ValueContext.Provider value={value}>
            <Suspense fallback={<Text text="Loading..." />}>
              <MemoizedChild />
            </Suspense>
          </ValueContext.Provider>
        );
      }

      const root = ReactTestRenderer.create(<App />);
      expect(Scheduler).toHaveYielded(['Suspend! [default]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [default]']);
      expect(Scheduler).toFlushExpired(['default']);
      expect(root).toMatchRenderedOutput('default');

      act(() => setValue('new value'));
      expect(Scheduler).toHaveYielded(['Suspend! [new value]', 'Loading...']);
      jest.advanceTimersByTime(1000);

      expect(Scheduler).toHaveYielded(['Promise resolved [new value]']);
      expect(Scheduler).toFlushExpired(['new value']);
      expect(root).toMatchRenderedOutput('new value');
    });
  });
});
