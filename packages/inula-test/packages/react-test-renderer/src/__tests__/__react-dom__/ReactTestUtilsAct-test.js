/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

let React;
let ReactDOM;
let ReactTestUtils;
let Scheduler;
let act;
let container;

jest.useRealTimers();

function sleep(period) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, period);
  });
}

describe('ReactTestUtils.act()', () => {
  // and then in legacy mode

  let legacyDom = null;
  function renderLegacy(el, dom) {
    legacyDom = dom;
    ReactDOM.render(el, dom);
  }

  function unmountLegacy(dom) {
    legacyDom = null;
    ReactDOM.unmountComponentAtNode(dom);
  }

  function rerenderLegacy(el) {
    ReactDOM.render(el, legacyDom);
  }

  runActTests('legacy mode', renderLegacy, unmountLegacy, rerenderLegacy);


  describe('unacted effects', () => {
    function App() {
      React.useEffect(() => {}, []);
      return null;
    }

    it('does not warn in legacy mode', () => {
      expect(() => {
        ReactDOM.render(<App />, document.createElement('div'));
      }).toErrorDev([]);
    });
  });
});

function runActTests(label, render, unmount, rerender) {
  describe(label, () => {
    beforeEach(() => {
      jest.resetModules();
      React = require('horizon-external');
      ReactDOM = require('horizon');
      ReactTestUtils = require('react-test-renderer/test-utils');
      Scheduler = require('scheduler');
      act = ReactTestUtils.act;
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      unmount(container);
      document.body.removeChild(container);
    });

    describe('sync', () => {
      it('can use act to flush effects', () => {
        function App() {
          React.useEffect(() => {
            Scheduler.unstable_yieldValue(100);
          });
          return null;
        }

        act(() => {
          render(<App />, container);
        });

        expect(Scheduler).toHaveYielded([100]);
      });

      it('flushes effects on every call', () => {
        function App() {
          const [ctr, setCtr] = React.useState(0);
          React.useEffect(() => {
            Scheduler.unstable_yieldValue(ctr);
          });
          return (
            <button id="button" onClick={() => setCtr(x => x + 1)}>
              {ctr}
            </button>
          );
        }

        act(() => {
          render(<App />, container);
        });
        expect(Scheduler).toHaveYielded([0]);
        const button = container.querySelector('#button');
        function click() {
          button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        }

        act(() => {
          click();
          click();
          click();
        });
        // it consolidates the 3 updates, then fires the effect
        expect(Scheduler).toHaveYielded([3]);
        act(click);
        expect(Scheduler).toHaveYielded([4]);
        act(click);
        expect(Scheduler).toHaveYielded([5]);
        expect(button.innerHTML).toBe('5');
      });

      it("should keep flushing effects until they're done", () => {
        function App() {
          const [ctr, setCtr] = React.useState(0);
          React.useEffect(() => {
            if (ctr < 5) {
              setCtr(x => x + 1);
            }
          });
          return ctr;
        }

        act(() => {
          render(<App />, container);
        });

        expect(container.innerHTML).toBe('5');
      });

      it('should flush effects only on exiting the outermost act', () => {
        function App() {
          React.useEffect(() => {
            Scheduler.unstable_yieldValue(0);
          });
          return null;
        }
        // let's nest a couple of act() calls
        act(() => {
          act(() => {
            render(<App />, container);
          });
          // the effect wouldn't have yielded yet because
          // we're still inside an act() scope
          expect(Scheduler).toHaveYielded([]);
        });
        // but after exiting the last one, effects get flushed
        expect(Scheduler).toHaveYielded([0]);
      });

      describe('fake timers', () => {
        beforeEach(() => {
          jest.useFakeTimers();
        });

        afterEach(() => {
          jest.useRealTimers();
        });

        it('lets a ticker update', () => {
          function App() {
            const [toggle, setToggle] = React.useState(0);
            React.useEffect(() => {
              const timeout = setTimeout(() => {
                setToggle(1);
              }, 200);
              return () => clearTimeout(timeout);
            }, []);
            return toggle;
          }

          act(() => {
            render(<App />, container);
          });
          act(() => {
            jest.runAllTimers();
          });

          expect(container.innerHTML).toBe('1');
        });

        it('can use the async version to catch microtasks', async () => {
          function App() {
            const [toggle, setToggle] = React.useState(0);
            React.useEffect(() => {
              // just like the previous test, except we
              // use a promise and schedule the update
              // after it resolves
              sleep(200).then(() => setToggle(1));
            }, []);
            return toggle;
          }

          act(() => {
            render(<App />, container);
          });
          await act(async () => {
            jest.runAllTimers();
          });

          expect(container.innerHTML).toBe('1');
        });

        it('can handle cascading promises with fake timers', async () => {
          // this component triggers an effect, that waits a tick,
          // then sets state. repeats this 5 times.
          function App() {
            const [state, setState] = React.useState(0);
            async function ticker() {
              await null;
              setState(x => x + 1);
            }
            React.useEffect(() => {
              ticker();
            }, [Math.min(state, 4)]);
            return state;
          }

          await act(async () => {
            render(<App />, container);
          });

          // all 5 ticks present and accounted for
          expect(container.innerHTML).toBe('5');
        });

        it('flushes immediate re-renders with act', () => {
          function App() {
            const [ctr, setCtr] = React.useState(0);
            React.useEffect(() => {
              if (ctr === 0) {
                setCtr(1);
              }
              const timeout = setTimeout(() => setCtr(2), 1000);
              return () => clearTimeout(timeout);
            });
            return ctr;
          }

          act(() => {
            render(<App />, container);
            // Since effects haven't been flushed yet, this does not advance the timer
            jest.runAllTimers();
          });

          expect(container.innerHTML).toBe('1');

          act(() => {
            jest.runAllTimers();
          });

          expect(container.innerHTML).toBe('2');
        });
      });

      it('warns if you return a value inside act', () => {
        expect(() => act(() => null)).toErrorDev(
          [
            'The callback passed to act(...) function must return undefined, or a Promise.',
          ],
          {withoutStack: true},
        );
        expect(() => act(() => 123)).toErrorDev(
          [
            'The callback passed to act(...) function must return undefined, or a Promise.',
          ],
          {withoutStack: true},
        );
      });

      it('warns if you try to await a sync .act call', () => {
        expect(() => act(() => {}).then(() => {})).toErrorDev(
          [
            'Do not await the result of calling act(...) with sync logic, it is not a Promise.',
          ],
          {withoutStack: true},
        );
      });
    });

    describe('asynchronous tests', () => {
      it('works with timeouts', async () => {
        function App() {
          const [ctr, setCtr] = React.useState(0);
          function doSomething() {
            setTimeout(() => {
              setCtr(1);
            }, 50);
          }

          React.useEffect(() => {
            doSomething();
          }, []);
          return ctr;
        }

        await act(async () => {
          render(<App />, container);
          // flush a little to start the timer
          expect(Scheduler).toFlushAndYield([]);
          await sleep(100);
        });
        expect(container.innerHTML).toBe('1');
      });

      it('flushes microtasks before exiting', async () => {
        function App() {
          const [ctr, setCtr] = React.useState(0);
          async function someAsyncFunction() {
            // queue a bunch of promises to be sure they all flush
            await null;
            await null;
            await null;
            setCtr(1);
          }
          React.useEffect(() => {
            someAsyncFunction();
          }, []);
          return ctr;
        }

        await act(async () => {
          render(<App />, container);
        });
        expect(container.innerHTML).toEqual('1');
      });

      it('warns if you do not await an act call', async () => {
        spyOnDevAndProd(console, 'error');
        act(async () => {});
        // it's annoying that we have to wait a tick before this warning comes in
        await sleep(0);
        if (isDev) {
          expect(console.error.calls.count()).toEqual(1);
          expect(console.error.calls.argsFor(0)[0]).toMatch(
            'You called act(async () => ...) without await.',
          );
        }
      });

      it('warns if you try to interleave multiple act calls', async () => {
        spyOnDevAndProd(console, 'error');
        // let's try to cheat and spin off a 'thread' with an act call
        (async () => {
          await act(async () => {
            await sleep(50);
          });
        })();

        await act(async () => {
          await sleep(100);
        });

        await sleep(150);
        if (isDev) {
          expect(console.error).toHaveBeenCalledTimes(1);
        }
      });

      it('async commits and effects are guaranteed to be flushed', async () => {
        function App() {
          const [state, setState] = React.useState(0);
          async function something() {
            await null;
            setState(1);
          }
          React.useEffect(() => {
            something();
          }, []);
          React.useEffect(() => {
            Scheduler.unstable_yieldValue(state);
          });
          return state;
        }

        await act(async () => {
          render(<App />, container);
        });
        // exiting act() drains effects and microtasks

        expect(Scheduler).toHaveYielded([0, 1]);
        expect(container.innerHTML).toBe('1');
      });

      it('can handle cascading promises', async () => {
        // this component triggers an effect, that waits a tick,
        // then sets state. repeats this 5 times.
        function App() {
          const [state, setState] = React.useState(0);
          async function ticker() {
            await null;
            setState(x => x + 1);
          }
          React.useEffect(() => {
            Scheduler.unstable_yieldValue(state);
            ticker();
          }, [Math.min(state, 4)]);
          return state;
        }

        await act(async () => {
          render(<App />, container);
        });
        // all 5 ticks present and accounted for
        expect(Scheduler).toHaveYielded([0, 1, 2, 3, 4]);
        expect(container.innerHTML).toBe('5');
      });
    });

    describe('error propagation', () => {
      it('propagates errors - sync', () => {
        let err;
        try {
          act(() => {
            throw new Error('some error');
          });
        } catch (_err) {
          err = _err;
        } finally {
          expect(err instanceof Error).toBe(true);
          expect(err.message).toBe('some error');
        }
      });

      // it('should propagate errors from effects - sync', () => {
      //   function App() {
      //     React.useEffect(() => {
      //       throw new Error('oh no');
      //     });
      //     return null;
      //   }
      //   let error;
      //
      //   try {
      //     act(() => {
      //       render(<App />, container);
      //     });
      //   } catch (_error) {
      //     error = _error;
      //   } finally {
      //     expect(error instanceof Error).toBe(true);
      //     expect(error.message).toBe('oh no');
      //   }
      // });

      it('propagates errors - async', async () => {
        let err;
        try {
          await act(async () => {
            await sleep(100);
            throw new Error('some error');
          });
        } catch (_err) {
          err = _err;
        } finally {
          expect(err instanceof Error).toBe(true);
          expect(err.message).toBe('some error');
        }
      });

      it('should cleanup after errors - sync', () => {
        function App() {
          React.useEffect(() => {
            Scheduler.unstable_yieldValue('oh yes');
          });
          return null;
        }
        let error;
        try {
          act(() => {
            throw new Error('oh no');
          });
        } catch (_error) {
          error = _error;
        } finally {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe('oh no');
          // should be able to render components after this tho
          act(() => {
            render(<App />, container);
          });
          expect(Scheduler).toHaveYielded(['oh yes']);
        }
      });

      it('should cleanup after errors - async', async () => {
        function App() {
          async function somethingAsync() {
            await null;
            Scheduler.unstable_yieldValue('oh yes');
          }
          React.useEffect(() => {
            somethingAsync();
          });
          return null;
        }
        let error;
        try {
          await act(async () => {
            await sleep(100);
            throw new Error('oh no');
          });
        } catch (_error) {
          error = _error;
        } finally {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe('oh no');
          // should be able to render components after this tho
          await act(async () => {
            render(<App />, container);
          });
          expect(Scheduler).toHaveYielded(['oh yes']);
        }
      });
    });

    describe('suspense', () => {
      if (isDev && __EXPERIMENTAL__) {
        // todo - remove isDev check once we start using testing builds

        it('triggers fallbacks if available', async () => {
          if (label !== 'legacy mode') {
            // FIXME: Support for Blocking* and Concurrent Mode were
            // intentionally removed from the public version of `act`. It will
            // be added back in a future major version, before Blocking and and
            // Concurrent Mode are officially released. Consider disabling all
            // non-Legacy tests in this suite until then.
            //
            // *Blocking Mode actually does happen to work, though
            // not "officially" since it's an unreleased feature.
            return;
          }

          let resolved = false;
          let resolve;
          const promise = new Promise(_resolve => {
            resolve = _resolve;
          });

          function Suspends() {
            if (resolved) {
              return 'was suspended';
            }
            throw promise;
          }

          function App(props) {
            return (
              <React.Suspense
                fallback={<span data-test-id="spinner">loading...</span>}>
                {props.suspend ? <Suspends /> : 'content'}
              </React.Suspense>
            );
          }

          // render something so there's content
          act(() => {
            render(<App suspend={false} />, container);
          });

          // trigger a suspendy update
          act(() => {
            rerender(<App suspend={true} />);
          });
          expect(
            document.querySelector('[data-test-id=spinner]'),
          ).not.toBeNull();

          // now render regular content again
          act(() => {
            rerender(<App suspend={false} />);
          });
          expect(document.querySelector('[data-test-id=spinner]')).toBeNull();
        });
      }
    });
    describe('warn in prod mode', () => {
      it('warns if you try to use act() in prod mode', () => {
        const spy = spyOnDevAndProd(console, 'error');

        act(() => {});

        if (!isDev) {
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error.calls.argsFor(0)[0]).toContain(
            'act(...) is not supported in production builds of React',
          );
        } else {
          expect(console.error).toHaveBeenCalledTimes(0);
        }

        spy.calls.reset();
        // does not warn twice
        act(() => {});
        expect(console.error).toHaveBeenCalledTimes(0);
      });
    });
  });
}
