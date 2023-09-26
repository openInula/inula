/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let Scheduler;
let runSync;
let ImmediatePriority;
let NormalPriority;
let LowPriority;
let IdlePriority;
let runAsync;
let cancelTask;
let getCurrentPriorityLevel;
let shouldYield;

describe('Scheduler', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.mock('scheduler', () => require('react-test-renderer/src/Scheduler_mock'));

    Scheduler = require('scheduler');

    runSync = Scheduler.runSync;
    ImmediatePriority = Scheduler.ImmediatePriority;
    NormalPriority = Scheduler.NormalPriority;
    LowPriority = Scheduler.unstable_LowPriority;
    IdlePriority = Scheduler.unstable_IdlePriority;
    runAsync = Scheduler.runAsync;
    cancelTask = Scheduler.cancelTask;
    getCurrentPriorityLevel = Scheduler.getCurrentPriorityLevel;
    shouldYield = Scheduler.unstable_shouldYield;
  });

  it('flushes work incrementally', () => {
    runAsync(() => Scheduler.unstable_yieldValue('A'), NormalPriority);
    runAsync(() => Scheduler.unstable_yieldValue('B'), NormalPriority);
    runAsync(() => Scheduler.unstable_yieldValue('C'), NormalPriority);
    runAsync(() => Scheduler.unstable_yieldValue('D'), NormalPriority);

    expect(Scheduler).toFlushAndYieldThrough(['A', 'B']);
    expect(Scheduler).toFlushAndYieldThrough(['C']);
    expect(Scheduler).toFlushAndYield(['D']);
  });

  it('cancels work', () => {
    runAsync(() => Scheduler.unstable_yieldValue('A'), NormalPriority);
    const callbackHandleB = runAsync(NormalPriority, () =>
      Scheduler.unstable_yieldValue('B'),
    );
    runAsync(() => Scheduler.unstable_yieldValue('C'), NormalPriority);

    cancelTask(callbackHandleB);

    expect(Scheduler).toFlushAndYield([
      'A',
      // B should have been cancelled
      'C',
    ]);
  });

  it('has a default expiration of ~5 seconds', () => {
    runAsync(() => Scheduler.unstable_yieldValue('A'), NormalPriority);

    Scheduler.unstable_advanceTime(4999);
    expect(Scheduler).toHaveYielded([]);

    Scheduler.unstable_advanceTime(1);
    expect(Scheduler).toFlushExpired(['A']);
  });

  xit(
    'continuations do not block higher priority work scheduled ' +
      'inside an executing callback',
    () => {
      const tasks = [
        ['A', 100],
        ['B', 100],
        ['C', 100],
        ['D', 100],
      ];
      const work = () => {
        while (tasks.length > 0) {
          const task = tasks.shift();
          const [label, ms] = task;
          Scheduler.unstable_advanceTime(ms);
          Scheduler.unstable_yieldValue(label);
          if (label === 'B') {
            // Schedule high pri work from inside another callback
            Scheduler.unstable_yieldValue('Schedule high pri');
            runAsync(() => {
              Scheduler.unstable_advanceTime(100);
              Scheduler.unstable_yieldValue('High pri');
            }, ImmediatePriority);
          }
          if (tasks.length > 0) {
            // Return a continuation
            return work;
          }
        }
      };
      runAsync(work, NormalPriority);
      expect(Scheduler).toFlushAndYield([
        'A',
        'B',
        'Schedule high pri',
        // The high pri callback should fire before the continuation of the
        // lower pri work
        'High pri',
        // Continue low pri work
        'C',
        'D',
      ]);
    },
  );

  it('cancelling a continuation', () => {
    const task = runAsync(() => {
      Scheduler.unstable_yieldValue('Yield');
      return () => {
        Scheduler.unstable_yieldValue('Continuation');
      };
    }, NormalPriority);

    expect(Scheduler).toFlushAndYieldThrough(['Yield']);
    cancelTask(task);
    expect(Scheduler).toFlushWithoutYielding();
  });

  it('top-level immediate callbacks fire in a subsequent task', () => {
    runAsync(() =>
      Scheduler.unstable_yieldValue('A'),
      ImmediatePriority
    );
    runAsync(() =>
      Scheduler.unstable_yieldValue('B'),
      ImmediatePriority
    );
    runAsync(() =>
      Scheduler.unstable_yieldValue('C'),
      ImmediatePriority
    );
    runAsync(() =>
      Scheduler.unstable_yieldValue('D'),
      ImmediatePriority
    );
    // Immediate callback hasn't fired, yet.
    expect(Scheduler).toHaveYielded([]);
    // They all flush immediately within the subsequent task.
    expect(Scheduler).toFlushExpired(['A', 'B', 'C', 'D']);
  });

  it('nested immediate callbacks are added to the queue of immediate callbacks', () => {
    runAsync(() =>
      Scheduler.unstable_yieldValue('A'),
      ImmediatePriority
    );
    runAsync(() => {
      Scheduler.unstable_yieldValue('B');
      // This callback should go to the end of the queue
      runAsync(() =>
        Scheduler.unstable_yieldValue('C'),
        ImmediatePriority
      );
    }, ImmediatePriority);
    runAsync(() =>
      Scheduler.unstable_yieldValue('D'),
      ImmediatePriority
    );
    expect(Scheduler).toHaveYielded([]);
    // C should flush at the end
    expect(Scheduler).toFlushExpired(['A', 'B', 'D', 'C']);
  });

  it("immediate callbacks fire even if there's an error", () => {
    runAsync(() => {
      Scheduler.unstable_yieldValue('A');
      throw new Error('Oops A');
    }, ImmediatePriority);
    runAsync(() => {
      Scheduler.unstable_yieldValue('B');
    }, ImmediatePriority);
    runAsync(() => {
      Scheduler.unstable_yieldValue('C');
      throw new Error('Oops C');
    }, ImmediatePriority);

    expect(() => expect(Scheduler).toFlushExpired()).toThrow('Oops A');
    expect(Scheduler).toHaveYielded(['A']);

    // B and C flush in a subsequent event. That way, the second error is not
    // swallowed.
    expect(() => expect(Scheduler).toFlushExpired()).toThrow('Oops C');
    expect(Scheduler).toHaveYielded(['B', 'C']);
  });

  it('multiple immediate callbacks can throw and there will be an error for each one', () => {
    runAsync(() => {
      throw new Error('First error');
    }, ImmediatePriority);
    runAsync(() => {
      throw new Error('Second error');
    }, ImmediatePriority);
    expect(() => Scheduler.unstable_flushAll()).toThrow('First error');
    // The next error is thrown in the subsequent event
    expect(() => Scheduler.unstable_flushAll()).toThrow('Second error');
  });

  xit('exposes the current priority level', () => {
    Scheduler.unstable_yieldValue(getCurrentPriorityLevel());
    runSync(() => {
      Scheduler.unstable_yieldValue(getCurrentPriorityLevel());
      runSync(() => {
        Scheduler.unstable_yieldValue(getCurrentPriorityLevel());
      }, NormalPriority);
      Scheduler.unstable_yieldValue(getCurrentPriorityLevel());
    }, ImmediatePriority);

    expect(Scheduler).toHaveYielded([
      NormalPriority,
      ImmediatePriority,
      NormalPriority,
      ImmediatePriority,
    ]);
  });

  if (isDev) {
    // Function names are minified in prod, though you could still infer the
    // priority if you have sourcemaps.
    // TODO: Feature temporarily disabled while we investigate a bug in one of
    // our minifiers.
    it.skip('adds extra function to the JS stack whose name includes the priority level', () => {
      function inferPriorityFromCallstack() {
        try {
          throw Error();
        } catch (e) {
          const stack = e.stack;
          const lines = stack.split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            const found = line.match(
              /scheduler_flushTaskAtPriority_([A-Za-z]+)/,
            );
            if (found !== null) {
              const priorityStr = found[1];
              switch (priorityStr) {
                case 'Immediate':
                  return ImmediatePriority;
                case 'UserBlocking':
                  return UserBlockingPriority;
                case 'Normal':
                  return NormalPriority;
                case 'Low':
                  return LowPriority;
                case 'Idle':
                  return IdlePriority;
              }
            }
          }
          return null;
        }
      }

      runAsync(ImmediatePriority, () =>
        Scheduler.unstable_yieldValue(
          'Immediate: ' + inferPriorityFromCallstack(),
        ),
      );
      runAsync(UserBlockingPriority, () =>
        Scheduler.unstable_yieldValue(
          'UserBlocking: ' + inferPriorityFromCallstack(),
        ),
      );
      runAsync(NormalPriority, () =>
        Scheduler.unstable_yieldValue(
          'Normal: ' + inferPriorityFromCallstack(),
        ),
      );
      runAsync(LowPriority, () =>
        Scheduler.unstable_yieldValue('Low: ' + inferPriorityFromCallstack()),
      );
      runAsync(IdlePriority, () =>
        Scheduler.unstable_yieldValue('Idle: ' + inferPriorityFromCallstack()),
      );

      expect(Scheduler).toFlushAndYield([
        'Immediate: ' + ImmediatePriority,
        'UserBlocking: ' + UserBlockingPriority,
        'Normal: ' + NormalPriority,
        'Low: ' + LowPriority,
        'Idle: ' + IdlePriority,
      ]);
    });
  }
});
