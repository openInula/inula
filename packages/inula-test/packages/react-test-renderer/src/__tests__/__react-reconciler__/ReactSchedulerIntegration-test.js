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
let ImmediatePriority;
let UserBlockingPriority;
let NormalPriority;
let LowPriority;
let IdlePriority;
let runSync;

describe('ReactSchedulerIntegration', () => {
  beforeEach(() => {
    jest.resetModules();

    ReactNoop = require('react-noop-renderer');
    React = require('horizon-external');
    Scheduler = require('scheduler');
    ImmediatePriority = Scheduler.ImmediatePriority;
    UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
    NormalPriority = Scheduler.NormalPriority;
    LowPriority = Scheduler.unstable_LowPriority;
    IdlePriority = Scheduler.unstable_IdlePriority;
    runSync = Scheduler.runSync;
  });

  function getCurrentPriorityAsString() {
    const priorityLevel = Scheduler.getCurrentPriorityLevel();
    switch (priorityLevel) {
      case ImmediatePriority:
        return 'Immediate';
      case UserBlockingPriority:
        return 'UserBlocking';
      case NormalPriority:
        return 'Normal';
      case LowPriority:
        return 'Low';
      case IdlePriority:
        return 'Idle';
      default:
        throw Error('Unknown priority level: ' + priorityLevel);
    }
  }

  // Concurrent
  xit('has correct priority during rendering', () => {
    function ReadPriority() {
      Scheduler.unstable_yieldValue(
        'Priority: ' + getCurrentPriorityAsString(),
      );
      return null;
    }
    ReactNoop.render(<ReadPriority />);
    expect(Scheduler).toFlushAndYield(['Priority: Normal']);

    runSync(() => {
      ReactNoop.render(<ReadPriority />);
    }, UserBlockingPriority);
    expect(Scheduler).toFlushAndYield(['Priority: UserBlocking']);

    runSync(() => {
      ReactNoop.render(<ReadPriority />);
    }, IdlePriority);
    expect(Scheduler).toFlushAndYield(['Priority: Idle']);
  });

  // Concurrent
  xit('has correct priority when continuing a render after yielding', () => {
    function ReadPriority() {
      Scheduler.unstable_yieldValue(
        'Priority: ' + getCurrentPriorityAsString(),
      );
      return null;
    }

    runSync(() => {
      ReactNoop.render(
        <>
          <ReadPriority />
          <ReadPriority />
          <ReadPriority />
        </>,
      );
    }, UserBlockingPriority);

    // Render part of the tree
    expect(Scheduler).toFlushAndYieldThrough(['Priority: UserBlocking']);

    // Priority is set back to normal when yielding
    expect(getCurrentPriorityAsString()).toEqual('Normal');

    // Priority is restored to user-blocking when continuing
    expect(Scheduler).toFlushAndYield([
      'Priority: UserBlocking',
      'Priority: UserBlocking',
    ]);
  });

  // Concurrent
  xit('layout effects have immediate priority', () => {
    const {useLayoutEffect} = React;
    function ReadPriority() {
      Scheduler.unstable_yieldValue(
        'Render priority: ' + getCurrentPriorityAsString(),
      );
      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue(
          'Layout priority: ' + getCurrentPriorityAsString(),
        );
      });
      return null;
    }

    ReactNoop.render(<ReadPriority />);
    expect(Scheduler).toHaveYielded([
      'Render priority: Normal',
      'Layout priority: Immediate',
    ]);
  });

  // Concurrent
  xit('passive effects never have higher than normal priority', async () => {
    const {useEffect} = React;
    function ReadPriority({step}) {
      Scheduler.unstable_yieldValue(
        `Render priority: ${getCurrentPriorityAsString()}`,
      );
      useEffect(() => {
        Scheduler.unstable_yieldValue(
          `Effect priority: ${getCurrentPriorityAsString()}`,
        );
        return () => {
          Scheduler.unstable_yieldValue(
            `Effect clean-up priority: ${getCurrentPriorityAsString()}`,
          );
        };
      });
      return null;
    }

    // High priority renders spawn effects at normal priority
    await ReactNoop.act(async () => {
      Scheduler.runSync(() => {
        ReactNoop.render(<ReadPriority />);
      }, ImmediatePriority);
    });
    expect(Scheduler).toHaveYielded([
      'Render priority: Immediate',
      'Effect priority: Normal',
    ]);
    await ReactNoop.act(async () => {
      Scheduler.runSync(() => {
        ReactNoop.render(<ReadPriority />);
      }, UserBlockingPriority);
    });
    expect(Scheduler).toHaveYielded([
      'Render priority: UserBlocking',
      'Effect clean-up priority: Normal',
      'Effect priority: Normal',
    ]);

    // Renders lower than normal priority spawn effects at the same priority
    await ReactNoop.act(async () => {
      Scheduler.runSync(() => {
        ReactNoop.render(<ReadPriority />);
      }, IdlePriority);
    });
    expect(Scheduler).toHaveYielded([
      'Render priority: Idle',
      'Effect clean-up priority: Idle',
      'Effect priority: Idle',
    ]);
  });

  // Concurrent
  xit('passive effects have correct priority even if they are flushed early', async () => {
    const {useEffect} = React;
    function ReadPriority({step}) {
      Scheduler.unstable_yieldValue(
        `Render priority [step ${step}]: ${getCurrentPriorityAsString()}`,
      );
      useEffect(() => {
        Scheduler.unstable_yieldValue(
          `Effect priority [step ${step}]: ${getCurrentPriorityAsString()}`,
        );
      });
      return null;
    }
    await ReactNoop.act(async () => {
      ReactNoop.render(<ReadPriority step={1} />);
      Scheduler.unstable_flushUntilNextPaint();
      expect(Scheduler).toHaveYielded(['Render priority [step 1]: Normal']);
      Scheduler.runSync(() => {
        ReactNoop.render(<ReadPriority step={2} />);
      }, UserBlockingPriority);
    });
    expect(Scheduler).toHaveYielded([
      'Effect priority [step 1]: Normal',
      'Render priority [step 2]: UserBlocking',
      'Effect priority [step 2]: Normal',
    ]);
  });

  // Concurrent
  xit('passive effect clean-up functions have correct priority even when component is deleted', async () => {
    const {useEffect} = React;
    function ReadPriority({step}) {
      useEffect(() => {
        return () => {
          Scheduler.unstable_yieldValue(
            `Effect clean-up priority: ${getCurrentPriorityAsString()}`,
          );
        };
      });
      return null;
    }

    await ReactNoop.act(async () => {
      ReactNoop.render(<ReadPriority />);
    });
    await ReactNoop.act(async () => {
      Scheduler.runSync(() => {
        ReactNoop.render(null);
      }, ImmediatePriority);
    });
    expect(Scheduler).toHaveYielded(['Effect clean-up priority: Normal']);

    await ReactNoop.act(async () => {
      ReactNoop.render(<ReadPriority />);
    });
    await ReactNoop.act(async () => {
      Scheduler.runSync(() => {
        ReactNoop.render(null);
      }, UserBlockingPriority);
    });
    expect(Scheduler).toHaveYielded(['Effect clean-up priority: Normal']);

    // Renders lower than normal priority spawn effects at the same priority
    await ReactNoop.act(async () => {
      ReactNoop.render(<ReadPriority />);
    });
    await ReactNoop.act(async () => {
      Scheduler.runSync(() => {
        ReactNoop.render(null);
      }, IdlePriority);
    });
    expect(Scheduler).toHaveYielded(['Effect clean-up priority: Idle']);
  });

  // Concurrent
  xit('passive effects are called before Normal-pri scheduled in layout effects', async () => {
    const {useEffect, useLayoutEffect} = React;
    function Effects({step}) {
      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue('Layout Effect');
        Scheduler.runAsync(() =>
          Scheduler.unstable_yieldValue(
            'Scheduled Normal Callback from Layout Effect',
          ),
          NormalPriority
        );
      });
      useEffect(() => {
        Scheduler.unstable_yieldValue('Passive Effect');
      });
      return null;
    }
    function CleanupEffect() {
      useLayoutEffect(() => () => {
        Scheduler.unstable_yieldValue('Cleanup Layout Effect');
        Scheduler.runAsync(() =>
          Scheduler.unstable_yieldValue(
            'Scheduled Normal Callback from Cleanup Layout Effect',
          ),
          NormalPriority
        );
      });
      return null;
    }
    await ReactNoop.act(async () => {
      ReactNoop.render(<CleanupEffect />);
    });
    expect(Scheduler).toHaveYielded([]);
    await ReactNoop.act(async () => {
      ReactNoop.render(<Effects />);
    });
    expect(Scheduler).toHaveYielded([
      'Cleanup Layout Effect',
      'Layout Effect',
      'Passive Effect',
      // These callbacks should be scheduled after the passive effects.
      'Scheduled Normal Callback from Cleanup Layout Effect',
      'Scheduled Normal Callback from Layout Effect',
    ]);
  });

  // Concurrent
  xit('after completing a level of work, infers priority of the next batch based on its expiration time', () => {
    function App({label}) {
      Scheduler.unstable_yieldValue(
        `${label} [${getCurrentPriorityAsString()}]`,
      );
      return label;
    }

    // Schedule two separate updates at different priorities
    runSync(() => {
      ReactNoop.render(<App label="A" />);
    }, UserBlockingPriority);
    ReactNoop.render(<App label="B" />);

    // The second update should run at normal priority
    expect(Scheduler).toHaveYielded(['A [UserBlocking]', 'B [Normal]']);
  });

  // Concurrent
  xit('requests a paint after committing', () => {
    const runAsync = Scheduler.runAsync;

    ReactNoop.render('Initial');
    Scheduler.unstable_flushAll();

    runAsync(() => Scheduler.unstable_yieldValue('A'), NormalPriority);
    runAsync(() => Scheduler.unstable_yieldValue('B'), NormalPriority);
    runAsync(() => Scheduler.unstable_yieldValue('C'), NormalPriority);

    // Schedule a React render. React will request a paint after committing it.
    ReactNoop.render('Update');

    // Advance time just to be sure the next tasks have lower priority
    Scheduler.unstable_advanceTime(2000);

    runAsync(NormalPriority, () => Scheduler.unstable_yieldValue('D'));
    runAsync(NormalPriority, () => Scheduler.unstable_yieldValue('E'));

    // Flush everything up to the next paint. Should yield after the
    // React commit.
    Scheduler.unstable_flushUntilNextPaint();
    expect(Scheduler).toHaveYielded(['A', 'B', 'C']);
  });
});

describe(
  'regression test: does not infinite loop if `shouldYield` returns ' +
    'true after a partial tree expires',
  () => {
    let logDuringShouldYield = false;

    beforeEach(() => {
      jest.resetModules();

      jest.mock('scheduler', () => {
        const actual = require.requireActual('react-test-renderer/src/Scheduler_mock');
        return {
          ...actual,
          unstable_shouldYield() {
            if (logDuringShouldYield) {
              actual.unstable_yieldValue('shouldYield');
            }
            return actual.unstable_shouldYield();
          },
        };
      });

      React = require('horizon-external');
      ReactNoop = require('react-noop-renderer');
      Scheduler = require('scheduler');
    });

    afterEach(() => {
      jest.mock('scheduler', () =>
        require.requireActual('react-test-renderer/src/Scheduler_mock'),
      );
    });
  },
);
