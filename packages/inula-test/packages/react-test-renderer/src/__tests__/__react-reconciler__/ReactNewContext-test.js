/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

import {UseContextHookMapping} from 'inula/src/renderer/hooks/HookExternal';
let React = require('horizon-external');
let useContext;
let ReactNoop;
let Scheduler;
let gen;

describe('ReactNewContext', () => {
  beforeEach(() => {
    jest.resetModules();

    ReactNoop = require('react-noop-renderer');
    React = require('horizon-external');
    useContext = React.useContext;
    Scheduler = require('scheduler');
    gen = require('random-seed');
  });

  function Text(props) {
    Scheduler.unstable_yieldValue(props.text);
    return <span prop={props.text} />;
  }

  function span(prop) {
    return {type: 'span', children: [], prop, hidden: false};
  }

  function readContext(Context, observedBits) {
    const dispatcher = UseContextHookMapping.val;
    return dispatcher.readContext(Context, observedBits);
  }

  // We have several ways of reading from context. sharedContextTests runs
  // a suite of tests for a given context consumer implementation.
  sharedContextTests('Context.Consumer', Context => Context.Consumer);
  sharedContextTests(
    'useContext inside function component',
    Context =>
      function Consumer(props) {
        const observedBits = props.unstable_observedBits;
        let contextValue;
        expect(() => {
          contextValue = useContext(Context, observedBits);
        }).toErrorDev(
          observedBits !== undefined
            ? 'useContext() second argument is reserved for future use in React. ' +
            `Passing it is not supported. You passed: ${observedBits}.`
            : [],
        );
        const render = props.children;
        return render(contextValue);
      },
  );
  sharedContextTests('useContext inside forwardRef component', Context =>
    React.forwardRef(function Consumer(props, ref) {
      const observedBits = props.unstable_observedBits;
      let contextValue;
      expect(() => {
        contextValue = useContext(Context, observedBits);
      }).toErrorDev(
        observedBits !== undefined
          ? 'useContext() second argument is reserved for future use in React. ' +
          `Passing it is not supported. You passed: ${observedBits}.`
          : [],
      );
      const render = props.children;
      return render(contextValue);
    }),
  );
  sharedContextTests('useContext inside memoized function component', Context =>
    React.memo(function Consumer(props) {
      const observedBits = props.unstable_observedBits;
      let contextValue;
      expect(() => {
        contextValue = useContext(Context, observedBits);
      }).toErrorDev(
        observedBits !== undefined
          ? 'useContext() second argument is reserved for future use in React. ' +
          `Passing it is not supported. You passed: ${observedBits}.`
          : [],
      );
      const render = props.children;
      return render(contextValue);
    }),
  );

  function sharedContextTests(label, getConsumer) {
    describe(`reading context with ${label}`, () => {
      it('simple mount and update', () => {
        const Context = React.createContext(1);
        const Consumer = getConsumer(Context);

        const Indirection = React.Fragment;

        function App(props) {
          return (
            <Context.Provider value={props.value}>
              <Indirection>
                <Indirection>
                  <Consumer>
                    {value => <span prop={'Result: ' + value} />}
                  </Consumer>
                </Indirection>
              </Indirection>
            </Context.Provider>
          );
        }

        ReactNoop.render(<App value={2} />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([span('Result: 2')]);

        // Update
        ReactNoop.render(<App value={3} />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([span('Result: 3')]);
      });

      it('propagates through shouldComponentUpdate false', () => {
        const Context = React.createContext(1);
        const ContextConsumer = getConsumer(Context);

        function Provider(props) {
          Scheduler.unstable_yieldValue('Provider');
          return (
            <Context.Provider value={props.value}>
              {props.children}
            </Context.Provider>
          );
        }

        function Consumer(props) {
          Scheduler.unstable_yieldValue('Consumer');
          return (
            <ContextConsumer>
              {value => {
                Scheduler.unstable_yieldValue('Consumer render prop');
                return <span prop={'Result: ' + value} />;
              }}
            </ContextConsumer>
          );
        }

        class Indirection extends React.Component {
          shouldComponentUpdate() {
            return false;
          }
          render() {
            Scheduler.unstable_yieldValue('Indirection');
            return this.props.children;
          }
        }

        function App(props) {
          Scheduler.unstable_yieldValue('App');
          return (
            <Provider value={props.value}>
              <Indirection>
                <Indirection>
                  <Consumer />
                </Indirection>
              </Indirection>
            </Provider>
          );
        }

        ReactNoop.render(<App value={2} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Provider',
          'Indirection',
          'Indirection',
          'Consumer',
          'Consumer render prop',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Result: 2')]);

        // Update
        ReactNoop.render(<App value={3} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Provider',
          'Consumer render prop',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Result: 3')]);
      });

      it('consumers bail out if context value is the same', () => {
        const Context = React.createContext(1);
        const ContextConsumer = getConsumer(Context);

        function Provider(props) {
          Scheduler.unstable_yieldValue('Provider');
          return (
            <Context.Provider value={props.value}>
              {props.children}
            </Context.Provider>
          );
        }

        function Consumer(props) {
          Scheduler.unstable_yieldValue('Consumer');
          return (
            <ContextConsumer>
              {value => {
                Scheduler.unstable_yieldValue('Consumer render prop');
                return <span prop={'Result: ' + value} />;
              }}
            </ContextConsumer>
          );
        }

        class Indirection extends React.Component {
          shouldComponentUpdate() {
            return false;
          }
          render() {
            Scheduler.unstable_yieldValue('Indirection');
            return this.props.children;
          }
        }

        function App(props) {
          Scheduler.unstable_yieldValue('App');
          return (
            <Provider value={props.value}>
              <Indirection>
                <Indirection>
                  <Consumer />
                </Indirection>
              </Indirection>
            </Provider>
          );
        }

        ReactNoop.render(<App value={2} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Provider',
          'Indirection',
          'Indirection',
          'Consumer',
          'Consumer render prop',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Result: 2')]);

        // Update with the same context value
        ReactNoop.render(<App value={2} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Provider',
          // Don't call render prop again
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Result: 2')]);
      });

      it('nested providers', () => {
        const Context = React.createContext(1);
        const Consumer = getConsumer(Context);

        function Provider(props) {
          return (
            <Consumer>
              {contextValue => (
                // Multiply previous context value by 2, unless prop overrides
                <Context.Provider value={props.value || contextValue * 2}>
                  {props.children}
                </Context.Provider>
              )}
            </Consumer>
          );
        }

        class Indirection extends React.Component {
          shouldComponentUpdate() {
            return false;
          }
          render() {
            return this.props.children;
          }
        }

        function App(props) {
          return (
            <Provider value={props.value}>
              <Indirection>
                <Provider>
                  <Indirection>
                    <Provider>
                      <Indirection>
                        <Consumer>
                          {value => <span prop={'Result: ' + value} />}
                        </Consumer>
                      </Indirection>
                    </Provider>
                  </Indirection>
                </Provider>
              </Indirection>
            </Provider>
          );
        }

        ReactNoop.render(<App value={2} />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([span('Result: 8')]);

        // Update
        ReactNoop.render(<App value={3} />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([span('Result: 12')]);
      });

      it('should provide the correct (default) values to consumers outside of a provider', () => {
        const FooContext = React.createContext({value: 'foo-initial'});
        const BarContext = React.createContext({value: 'bar-initial'});
        const FooConsumer = getConsumer(FooContext);
        const BarConsumer = getConsumer(BarContext);

        const Verify = ({actual, expected}) => {
          expect(expected).toBe(actual);
          return null;
        };

        ReactNoop.render(
          <>
            <BarContext.Provider value={{value: 'bar-updated'}}>
              <BarConsumer>
                {({value}) => <Verify actual={value} expected="bar-updated" />}
              </BarConsumer>

              <FooContext.Provider value={{value: 'foo-updated'}}>
                <FooConsumer>
                  {({value}) => (
                    <Verify actual={value} expected="foo-updated" />
                  )}
                </FooConsumer>
              </FooContext.Provider>
            </BarContext.Provider>

            <FooConsumer>
              {({value}) => <Verify actual={value} expected="foo-initial" />}
            </FooConsumer>
            <BarConsumer>
              {({value}) => <Verify actual={value} expected="bar-initial" />}
            </BarConsumer>
          </>,
        );
        expect(Scheduler).toFlushWithoutYielding();
      });

      it('multiple consumers in different branches', () => {
        const Context = React.createContext(1);
        const Consumer = getConsumer(Context);

        function Provider(props) {
          return (
            <Context.Consumer>
              {contextValue => (
                // Multiply previous context value by 2, unless prop overrides
                <Context.Provider value={props.value || contextValue * 2}>
                  {props.children}
                </Context.Provider>
              )}
            </Context.Consumer>
          );
        }

        class Indirection extends React.Component {
          shouldComponentUpdate() {
            return false;
          }
          render() {
            return this.props.children;
          }
        }

        function App(props) {
          return (
            <Provider value={props.value}>
              <Indirection>
                <Indirection>
                  <Provider>
                    <Consumer>
                      {value => <span prop={'Result: ' + value} />}
                    </Consumer>
                  </Provider>
                </Indirection>
                <Indirection>
                  <Consumer>
                    {value => <span prop={'Result: ' + value} />}
                  </Consumer>
                </Indirection>
              </Indirection>
            </Provider>
          );
        }

        ReactNoop.render(<App value={2} />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([
          span('Result: 4'),
          span('Result: 2'),
        ]);

        // Update
        ReactNoop.render(<App value={3} />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([
          span('Result: 6'),
          span('Result: 3'),
        ]);

        // Another update
        ReactNoop.render(<App value={4} />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([
          span('Result: 8'),
          span('Result: 4'),
        ]);
      });

      it('compares context values with Object.is semantics', () => {
        const Context = React.createContext(1);
        const ContextConsumer = getConsumer(Context);

        function Provider(props) {
          Scheduler.unstable_yieldValue('Provider');
          return (
            <Context.Provider value={props.value}>
              {props.children}
            </Context.Provider>
          );
        }

        function Consumer(props) {
          Scheduler.unstable_yieldValue('Consumer');
          return (
            <ContextConsumer>
              {value => {
                Scheduler.unstable_yieldValue('Consumer render prop');
                return <span prop={'Result: ' + value} />;
              }}
            </ContextConsumer>
          );
        }

        class Indirection extends React.Component {
          shouldComponentUpdate() {
            return false;
          }
          render() {
            Scheduler.unstable_yieldValue('Indirection');
            return this.props.children;
          }
        }

        function App(props) {
          Scheduler.unstable_yieldValue('App');
          return (
            <Provider value={props.value}>
              <Indirection>
                <Indirection>
                  <Consumer />
                </Indirection>
              </Indirection>
            </Provider>
          );
        }

        ReactNoop.render(<App value={NaN} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Provider',
          'Indirection',
          'Indirection',
          'Consumer',
          'Consumer render prop',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Result: NaN')]);

        // Update
        ReactNoop.render(<App value={NaN} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Provider',
          // Consumer should not re-render again
          // 'Consumer render prop',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span('Result: NaN')]);
      });

      it('context unwinds when interrupted', () => {
        const Context = React.createContext('Default');
        const ContextConsumer = getConsumer(Context);

        function Consumer(props) {
          return (
            <ContextConsumer>
              {value => <span prop={'Result: ' + value} />}
            </ContextConsumer>
          );
        }

        function BadRender() {
          throw new Error('Bad render');
        }

        class ErrorBoundary extends React.Component {
          state = {error: null};
          componentDidCatch(error) {
            this.setState({error});
          }
          render() {
            if (this.state.error) {
              return null;
            }
            return this.props.children;
          }
        }

        function App(props) {
          return (
            <>
              <Context.Provider value="Does not unwind">
                <ErrorBoundary>
                  <Context.Provider value="Unwinds after BadRender throws">
                    <BadRender />
                  </Context.Provider>
                </ErrorBoundary>
                <Consumer />
              </Context.Provider>
            </>
          );
        }

        ReactNoop.render(<App value="A" />);
        expect(Scheduler).toFlushWithoutYielding();
        expect(ReactNoop.getChildren()).toEqual([
          // The second provider should use the default value.
          span('Result: Does not unwind'),
        ]);
      });

      it("does not re-render if there's an update in a child", () => {
        const Context = React.createContext(0);
        const Consumer = getConsumer(Context);

        let child;
        class Child extends React.Component {
          state = {step: 0};
          render() {
            Scheduler.unstable_yieldValue('Child');
            return (
              <span
                prop={`Context: ${this.props.context}, Step: ${this.state.step}`}
              />
            );
          }
        }

        function App(props) {
          return (
            <Context.Provider value={props.value}>
              <Consumer>
                {value => {
                  Scheduler.unstable_yieldValue('Consumer render prop');
                  return <Child ref={inst => (child = inst)} context={value} />;
                }}
              </Consumer>
            </Context.Provider>
          );
        }

        // Initial mount
        ReactNoop.render(<App value={1} />);
        expect(Scheduler).toHaveYielded(['Consumer render prop', 'Child']);
        expect(ReactNoop.getChildren()).toEqual([span('Context: 1, Step: 0')]);

        child.setState({step: 1});
        expect(Scheduler).toHaveYielded(['Child']);
        expect(ReactNoop.getChildren()).toEqual([span('Context: 1, Step: 1')]);
      });

      it('consumer bails out if value is unchanged and something above bailed out', () => {
        const Context = React.createContext(0);
        const Consumer = getConsumer(Context);

        function renderChildValue(value) {
          Scheduler.unstable_yieldValue('Consumer');
          return <span prop={value} />;
        }

        function ChildWithInlineRenderCallback() {
          Scheduler.unstable_yieldValue('ChildWithInlineRenderCallback');
          // Note: we are intentionally passing an inline arrow. Don't refactor.
          return <Consumer>{value => renderChildValue(value)}</Consumer>;
        }

        function ChildWithCachedRenderCallback() {
          Scheduler.unstable_yieldValue('ChildWithCachedRenderCallback');
          return <Consumer>{renderChildValue}</Consumer>;
        }

        class PureIndirection extends React.PureComponent {
          render() {
            Scheduler.unstable_yieldValue('PureIndirection');
            return (
              <>
                <ChildWithInlineRenderCallback />
                <ChildWithCachedRenderCallback />
              </>
            );
          }
        }

        class App extends React.Component {
          render() {
            Scheduler.unstable_yieldValue('App');
            return (
              <Context.Provider value={this.props.value}>
                <PureIndirection />
              </Context.Provider>
            );
          }
        }

        // Initial mount
        ReactNoop.render(<App value={1} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'PureIndirection',
          'ChildWithInlineRenderCallback',
          'Consumer',
          'ChildWithCachedRenderCallback',
          'Consumer',
        ]);
        expect(ReactNoop.getChildren()).toEqual([span(1), span(1)]);

        // Update (bailout)
        ReactNoop.render(<App value={1} />);
        expect(Scheduler).toHaveYielded(['App']);
        expect(ReactNoop.getChildren()).toEqual([span(1), span(1)]);

        // Update (no bailout)
        ReactNoop.render(<App value={2} />);
        expect(Scheduler).toHaveYielded(['App', 'Consumer', 'Consumer']);
        expect(ReactNoop.getChildren()).toEqual([span(2), span(2)]);
      });

      // This is a regression case for https://github.com/facebook/react/issues/12389.
      it('does not run into an infinite loop', () => {
        const Context = React.createContext(null);
        const Consumer = getConsumer(Context);

        class App extends React.Component {
          renderItem(id) {
            return (
              <span key={id}>
                <Consumer>{() => <span>inner</span>}</Consumer>
                <span>outer</span>
              </span>
            );
          }
          renderList() {
            const list = [1, 2].map(id => this.renderItem(id));
            if (this.props.reverse) {
              list.reverse();
            }
            return list;
          }
          render() {
            return (
              <Context.Provider value={{}}>
                {this.renderList()}
              </Context.Provider>
            );
          }
        }

        ReactNoop.render(<App reverse={false} />);
        expect(Scheduler).toFlushWithoutYielding();
        ReactNoop.render(<App reverse={true} />);
        expect(Scheduler).toFlushWithoutYielding();
        ReactNoop.render(<App reverse={false} />);
        expect(Scheduler).toFlushWithoutYielding();
      });

      // This is a regression case for https://github.com/facebook/react/issues/12686
      it('does not skip some siblings', () => {
        const Context = React.createContext(0);
        const ContextConsumer = getConsumer(Context);

        class App extends React.Component {
          state = {
            step: 0,
          };

          render() {
            Scheduler.unstable_yieldValue('App');
            return (
              <Context.Provider value={this.state.step}>
                <StaticContent />
                {this.state.step > 0 && <Indirection />}
              </Context.Provider>
            );
          }
        }

        class StaticContent extends React.PureComponent {
          render() {
            return (
              <>
                <>
                  <span prop="static 1" />
                  <span prop="static 2" />
                </>
              </>
            );
          }
        }

        class Indirection extends React.PureComponent {
          render() {
            return (
              <ContextConsumer>
                {value => {
                  Scheduler.unstable_yieldValue('Consumer');
                  return <span prop={value} />;
                }}
              </ContextConsumer>
            );
          }
        }

        // Initial mount
        let inst;
        ReactNoop.render(<App ref={ref => (inst = ref)} />);
        expect(Scheduler).toHaveYielded(['App']);
        expect(ReactNoop.getChildren()).toEqual([
          span('static 1'),
          span('static 2'),
        ]);
        // Update the first time
        inst.setState({step: 1});
        expect(Scheduler).toHaveYielded(['App', 'Consumer']);
        expect(ReactNoop.getChildren()).toEqual([
          span('static 1'),
          span('static 2'),
          span(1),
        ]);
        // Update the second time
        inst.setState({step: 2});
        expect(Scheduler).toHaveYielded(['App', 'Consumer']);
        expect(ReactNoop.getChildren()).toEqual([
          span('static 1'),
          span('static 2'),
          span(2),
        ]);
      });
    });
  }

  describe('Context.Provider', () => {
    it('provider bails out if children and value are unchanged (like sCU)', () => {
      const Context = React.createContext(0);

      function Child() {
        Scheduler.unstable_yieldValue('Child');
        return <span prop="Child" />;
      }

      const children = <Child />;

      function App(props) {
        Scheduler.unstable_yieldValue('App');
        return (
          <Context.Provider value={props.value}>{children}</Context.Provider>
        );
      }

      // Initial mount
      ReactNoop.render(<App value={1} />);
      expect(Scheduler).toHaveYielded(['App', 'Child']);
      expect(ReactNoop.getChildren()).toEqual([span('Child')]);

      // Update
      ReactNoop.render(<App value={1} />);
      expect(Scheduler).toHaveYielded([
        'App',
        // Child does not re-render
      ]);
      expect(ReactNoop.getChildren()).toEqual([span('Child')]);
    });

    it('provider does not bail out if legacy context changed above', () => {
      const Context = React.createContext(0);

      function Child() {
        Scheduler.unstable_yieldValue('Child');
        return <span prop="Child" />;
      }

      const children = <Child />;

      class LegacyProvider extends React.Component {
        state = {legacyValue: 1};
        render() {
          Scheduler.unstable_yieldValue('LegacyProvider');
          return this.props.children;
        }
      }

      class App extends React.Component {
        state = {value: 1};
        render() {
          Scheduler.unstable_yieldValue('App');
          return (
            <Context.Provider value={this.state.value}>
              {this.props.children}
            </Context.Provider>
          );
        }
      }

      const legacyProviderRef = React.createRef();
      const appRef = React.createRef();

      // Initial mount
      ReactNoop.render(
        <LegacyProvider ref={legacyProviderRef}>
          <App ref={appRef} value={1}>
            {children}
          </App>
        </LegacyProvider>,
      );

      expect(Scheduler).toHaveYielded(['LegacyProvider', 'App', 'Child']);
      expect(ReactNoop.getChildren()).toEqual([span('Child')]);

      // Update App with same value (should bail out)
      appRef.current.setState({value: 1});
      expect(Scheduler).toHaveYielded(['App']);
      expect(ReactNoop.getChildren()).toEqual([span('Child')]);

      // Update LegacyProvider (should not bail out)
      legacyProviderRef.current.setState({value: 1});
      expect(Scheduler).toHaveYielded(['LegacyProvider']);
      expect(ReactNoop.getChildren()).toEqual([span('Child')]);

      // Update App with same value (should bail out)
      appRef.current.setState({value: 1});
      expect(Scheduler).toHaveYielded(['App']);
      expect(ReactNoop.getChildren()).toEqual([span('Child')]);
    });
  });

  describe('Context.Consumer', () => {
    it('can read other contexts inside consumer render prop', () => {
      const FooContext = React.createContext(0);
      const BarContext = React.createContext(0);

      function FooAndBar() {
        const bar = useContext(BarContext);
        return (
          <FooContext.Consumer>
            {foo => {
              return <Text text={`Foo: ${foo}, Bar: ${bar}`} />;
            }}
          </FooContext.Consumer>
        );
      }

      class Indirection extends React.Component {
        shouldComponentUpdate() {
          return false;
        }
        render() {
          return this.props.children;
        }
      }

      function App(props) {
        return (
          <FooContext.Provider value={props.foo}>
            <BarContext.Provider value={props.bar}>
              <Indirection>
                <FooAndBar />
              </Indirection>
            </BarContext.Provider>
          </FooContext.Provider>
        );
      }

      ReactNoop.render(<App foo={1} bar={1} />);
      expect(Scheduler).toHaveYielded(['Foo: 1, Bar: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Foo: 1, Bar: 1')]);

      // Update foo
      ReactNoop.render(<App foo={2} bar={1} />);
      expect(Scheduler).toHaveYielded(['Foo: 2, Bar: 1']);
      expect(ReactNoop.getChildren()).toEqual([span('Foo: 2, Bar: 1')]);

      // Update bar
      ReactNoop.render(<App foo={2} bar={2} />);
      expect(Scheduler).toHaveYielded(['Foo: 2, Bar: 2']);
      expect(ReactNoop.getChildren()).toEqual([span('Foo: 2, Bar: 2')]);
    });

    // Context consumer bails out on propagating "deep" updates when `value` hasn't changed.
    // However, it doesn't bail out from rendering if the component above it re-rendered anyway.
    // If we bailed out on referential equality, it would be confusing that you
    // can call this.setState(), but an autobound render callback "blocked" the update.
    // https://github.com/facebook/react/pull/12470#issuecomment-376917711
    it('consumer does not bail out if there were no bailouts above it', () => {
      const Context = React.createContext(0);
      const Consumer = Context.Consumer;

      class App extends React.Component {
        state = {
          text: 'hello',
        };

        renderConsumer = context => {
          Scheduler.unstable_yieldValue('App#renderConsumer');
          return <span prop={this.state.text} />;
        };

        render() {
          Scheduler.unstable_yieldValue('App');
          return (
            <Context.Provider value={this.props.value}>
              <Consumer>{this.renderConsumer}</Consumer>
            </Context.Provider>
          );
        }
      }

      // Initial mount
      let inst;
      ReactNoop.render(<App value={1} ref={ref => (inst = ref)} />);
      expect(Scheduler).toHaveYielded(['App', 'App#renderConsumer']);
      expect(ReactNoop.getChildren()).toEqual([span('hello')]);

      // Update
      inst.setState({text: 'goodbye'});
      expect(Scheduler).toHaveYielded(['App', 'App#renderConsumer']);
      expect(ReactNoop.getChildren()).toEqual([span('goodbye')]);
    });
  });

  describe('useContext', () => {
    xit('throws when used in a class component', () => {
      const Context = React.createContext(0);
      class Foo extends React.Component {
        render() {
          return useContext(Context);
        }
      }

      expect(() => ReactNoop.render(<Foo />)).toThrow(
        'Invalid hook call.',
      );
    });

    // Context consumer bails out on propagating "deep" updates when `value` hasn't changed.
    // However, it doesn't bail out from rendering if the component above it re-rendered anyway.
    // If we bailed out on referential equality, it would be confusing that you
    // can call this.setState(), but an autobound render callback "blocked" the update.
    // https://github.com/facebook/react/pull/12470#issuecomment-376917711
    it('does not bail out if there were no bailouts above it', () => {
      const Context = React.createContext(0);

      function Consumer({children}) {
        const contextValue = useContext(Context);
        return children(contextValue);
      }

      class App extends React.Component {
        state = {
          text: 'hello',
        };

        renderConsumer = context => {
          Scheduler.unstable_yieldValue('App#renderConsumer');
          return <span prop={this.state.text} />;
        };

        render() {
          Scheduler.unstable_yieldValue('App');
          return (
            <Context.Provider value={this.props.value}>
              <Consumer>{this.renderConsumer}</Consumer>
            </Context.Provider>
          );
        }
      }

      // Initial mount
      let inst;
      ReactNoop.render(<App value={1} ref={ref => (inst = ref)} />);
      expect(Scheduler).toHaveYielded(['App', 'App#renderConsumer']);
      expect(ReactNoop.getChildren()).toEqual([span('hello')]);

      // Update
      inst.setState({text: 'goodbye'});
      expect(Scheduler).toHaveYielded(['App', 'App#renderConsumer']);
      expect(ReactNoop.getChildren()).toEqual([span('goodbye')]);
    });
  });

  it('unwinds after errors in complete phase', () => {
    const Context = React.createContext(0);

    // This is a regression test for stack misalignment
    // caused by unwinding the context from wrong point.

    expect(() => {
      ReactNoop.render(
        <errorInCompletePhase>
          <Context.Provider value={null} />
        </errorInCompletePhase>,
      );
    }).toThrow('Error in host config.');
  });

  describe('fuzz test', () => {
    const contextKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    const FLUSH_ALL = 'FLUSH_ALL';
    function flushAll() {
      return {
        type: FLUSH_ALL,
        toString() {
          return `flushAll()`;
        },
      };
    }

    const FLUSH = 'FLUSH';
    function flush(unitsOfWork) {
      return {
        type: FLUSH,
        unitsOfWork,
        toString() {
          return `flush(${unitsOfWork})`;
        },
      };
    }

    const UPDATE = 'UPDATE';
    function update(key, value) {
      return {
        type: UPDATE,
        key,
        value,
        toString() {
          return `update('${key}', ${value})`;
        },
      };
    }

    function randomInteger(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function randomAction() {
      switch (randomInteger(0, 3)) {
        case 0:
          return flushAll();
        case 1:
          return flush(randomInteger(0, 500));
        case 2:
          const key = contextKeys[randomInteger(0, contextKeys.length)];
          const value = randomInteger(1, 10);
          return update(key, value);
        default:
          throw new Error('Switch statement should be exhaustive');
      }
    }

    function randomActions(n) {
      const actions = [];
      for (let i = 0; i < n; i++) {
        actions.push(randomAction());
      }
      return actions;
    }

    function ContextSimulator(maxDepth) {
      const contexts = new Map(
        contextKeys.map(key => {
          const Context = React.createContext(0);
          Context.displayName = 'Context' + key;
          return [key, Context];
        }),
      );

      class ConsumerTree extends React.Component {
        shouldComponentUpdate() {
          return false;
        }
        render() {
          Scheduler.unstable_yieldValue();
          if (this.props.depth >= this.props.maxDepth) {
            return null;
          }
          const consumers = [0, 1, 2].map(i => {
            const randomKey =
              contextKeys[
                this.props.rand.intBetween(0, contextKeys.length - 1)
                ];
            const Context = contexts.get(randomKey);
            return (
              <Context.Consumer key={i}>
                {value => (
                  <>
                    <span prop={`${randomKey}:${value}`} />
                    <ConsumerTree
                      rand={this.props.rand}
                      depth={this.props.depth + 1}
                      maxDepth={this.props.maxDepth}
                    />
                  </>
                )}
              </Context.Consumer>
            );
          });
          return consumers;
        }
      }

      function Root(props) {
        return contextKeys.reduceRight((children, key) => {
          const Context = contexts.get(key);
          const value = props.values[key];
          return <Context.Provider value={value}>{children}</Context.Provider>;
        }, <ConsumerTree rand={props.rand} depth={0} maxDepth={props.maxDepth} />);
      }

      const initialValues = contextKeys.reduce(
        (result, key, i) => ({...result, [key]: i + 1}),
        {},
      );

      function assertConsistentTree(expectedValues = {}) {
        const children = ReactNoop.getChildren();
        children.forEach(child => {
          const text = child.prop;
          const key = text[0];
          const value = parseInt(text[2], 10);
          const expectedValue = expectedValues[key];
          if (expectedValue === undefined) {
            // If an expected value was not explicitly passed to this function,
            // use the first occurrence.
            expectedValues[key] = value;
          } else if (value !== expectedValue) {
            throw new Error(
              `Inconsistent value! Expected: ${key}:${expectedValue}. Actual: ${text}`,
            );
          }
        });
      }

      function simulate(seed, actions) {
        const rand = gen.create(seed);
        let finalExpectedValues = initialValues;
        function updateRoot() {
          ReactNoop.render(
            <Root
              maxDepth={maxDepth}
              rand={rand}
              values={finalExpectedValues}
            />,
          );
        }
        updateRoot();

        actions.forEach(action => {
          switch (action.type) {
            case FLUSH_ALL:
              Scheduler.unstable_flushAllWithoutAsserting();
              break;
            case FLUSH:
              Scheduler.unstable_flushNumberOfYields(action.unitsOfWork);
              break;
            case UPDATE:
              finalExpectedValues = {
                ...finalExpectedValues,
                [action.key]: action.value,
              };
              updateRoot();
              break;
            default:
              throw new Error('Switch statement should be exhaustive');
          }
          assertConsistentTree();
        });

        Scheduler.unstable_flushAllWithoutAsserting();
        assertConsistentTree(finalExpectedValues);
      }

      return {simulate};
    }

    it('hard-coded tests', () => {
      const {simulate} = ContextSimulator(5);
      simulate('randomSeed', [flush(3), update('A', 4)]);
    });

    it('generated tests', () => {
      const {simulate} = ContextSimulator(5);

      const LIMIT = 100;
      for (let i = 0; i < LIMIT; i++) {
        const seed = Math.random()
          .toString(36)
          .substr(2, 5);
        const actions = randomActions(5);
        try {
          simulate(seed, actions);
        } catch (error) {
          console.error(`
Context fuzz tester error! Copy and paste the following line into the test suite:
  simulate('${seed}', ${actions.join(', ')});
`);
          throw error;
        }
      }
    });
  });

  // False positive regression test.
  it('should not warn when using Consumer from React < 16.6 with newer renderer', () => {
    const BarContext = React.createContext({value: 'bar-initial'});
    // React 16.5 and earlier didn't have a separate object.
    BarContext.Consumer = BarContext;

    function Component() {
      return (
        <>
          <BarContext.Provider value={{value: 'bar-updated'}}>
            <BarContext.Consumer>
              {({value}) => <div actual={value} expected="bar-updated" />}
            </BarContext.Consumer>
          </BarContext.Provider>
        </>
      );
    }

    ReactNoop.render(<Component />);
    expect(Scheduler).toFlushWithoutYielding();
  });
});
