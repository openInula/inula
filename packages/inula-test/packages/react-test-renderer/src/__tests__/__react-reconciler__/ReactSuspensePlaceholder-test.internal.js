/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

let React;
let ReactNoop;
let Scheduler;
let ReactCache;
let Suspense;
let TextResource;
let textResourceShouldFail;

describe('ReactSuspensePlaceholder', () => {
  beforeEach(() => {
    jest.resetModules();

    ReactNoop = require('react-noop-renderer');
    React = require('horizon-external');
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

  function Text({fakeRenderDuration = 0, text = 'Text'}) {
    Scheduler.unstable_advanceTime(fakeRenderDuration);
    Scheduler.unstable_yieldValue(text);
    return text;
  }

  function AsyncText({fakeRenderDuration = 0, ms, text}) {
    Scheduler.unstable_advanceTime(fakeRenderDuration);
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

  describe('profiler durations', () => {
    let App;

    beforeEach(() => {
      // Order of parameters: id, phase, actualDuration, treeBaseDuration

      const Fallback = () => {
        Scheduler.unstable_yieldValue('Fallback');
        Scheduler.unstable_advanceTime(10);
        return 'Loading...';
      };

      const Suspending = () => {
        Scheduler.unstable_yieldValue('Suspending');
        Scheduler.unstable_advanceTime(2);
        return <AsyncText ms={1000} text="Loaded" fakeRenderDuration={1} />;
      };

      App = ({shouldSuspend, text = 'Text', textRenderDuration = 5}) => {
        Scheduler.unstable_yieldValue('App');
        return (
          <Suspense fallback={<Fallback />}>
            {shouldSuspend && <Suspending />}
            <Text fakeRenderDuration={textRenderDuration} text={text} />
          </Suspense>
        );
      };
    });

    describe('when suspending during mount', () => {
      it('properly accounts for base durations when a suspended times out in a legacy tree', () => {
        ReactNoop.renderLegacySyncRoot(<App shouldSuspend={true} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Suspending',
          'Suspend! [Loaded]',
          'Text',
          'Fallback',
        ]);
        expect(ReactNoop).toMatchRenderedOutput('Loading...');

        // Initial mount only shows the "Loading..." Fallback.
        // The treeBaseDuration then should be 10ms spent rendering Fallback,
        // but the actualDuration should also include the 8ms spent rendering the hidden tree.

        jest.advanceTimersByTime(1000);

        expect(Scheduler).toHaveYielded(['Promise resolved [Loaded]']);
        expect(Scheduler).toFlushExpired(['Loaded']);
        expect(ReactNoop).toMatchRenderedOutput('LoadedText');
      });
    });

    describe('when suspending during update', () => {
      it('properly accounts for base durations when a suspended times out in a legacy tree', () => {
        ReactNoop.renderLegacySyncRoot(
          <App shouldSuspend={false} textRenderDuration={5} />,
        );
        expect(Scheduler).toHaveYielded(['App', 'Text']);
        expect(ReactNoop).toMatchRenderedOutput('Text');

        ReactNoop.render(<App shouldSuspend={true} textRenderDuration={5} />);
        expect(Scheduler).toHaveYielded([
          'App',
          'Suspending',
          'Suspend! [Loaded]',
          'Text',
          'Fallback',
        ]);
        expect(ReactNoop).toMatchRenderedOutput('Loading...');

        ReactNoop.renderLegacySyncRoot(
          <App shouldSuspend={true} text="New" textRenderDuration={6} />,
        );
        expect(Scheduler).toHaveYielded([
          'App',
          'Suspending',
          'Suspend! [Loaded]',
          'New',
          'Fallback',
        ]);
        expect(ReactNoop).toMatchRenderedOutput('Loading...');

        jest.advanceTimersByTime(1000);

        expect(Scheduler).toHaveYielded(['Promise resolved [Loaded]']);
        expect(Scheduler).toFlushExpired(['Loaded']);
        expect(ReactNoop).toMatchRenderedOutput('LoadedNew');
      });
    });
  });
});
