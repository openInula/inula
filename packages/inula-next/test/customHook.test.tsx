/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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
import { describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { domTest as it } from './utils';

import { didMount, didUnmount, render, useContext, createContext } from '../src';

// 模拟调度器
vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

// 自定义 Hook
function useCounter(initialValue = 0) {
  let count = initialValue;
  const setCount = () => {
    count += 1;
  };
  return { count, setCount };
}

describe('Custom Hook Tests', () => {
  // 1. Basic Functionality
  describe('Basic Functionality', () => {
    it('should initialize with the correct value', ({ container }) => {
      function TestComponent() {
        const { count } = useCounter(5);
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>5</div>');
    });

    it('should update state correctly', ({ container }) => {
      let setCountFromHook: () => void;

      function TestComponent() {
        const { count, setCount } = useCounter();
        setCountFromHook = setCount;
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>0</div>');
      setCountFromHook();
      expect(container.innerHTML).toBe('<div>1</div>');
    });

    // Version accepting an object parameter
    function useCounterWithObject({ initial = 0, step = 1 }) {
      let count = initial;
      const setCount = () => {
        count += step;
      };
      return { count, setCount };
    }

    // Version accepting multiple parameters
    function useCounterWithMultipleParams(initial = 0, step = 1, max = Infinity) {
      let count = initial;
      const setCount = () => {
        count = Math.min(count + step, max);
      };
      return { count, setCount };
    }

    // Version returning an array
    function useCounterReturningArray(initial = 0) {
      let count = initial;
      const setCount = () => {
        count += 1;
      };
      return [count, setCount];
    }

    // Test object input
    it('should initialize with an object input', ({ container }) => {
      function TestComponent() {
        const { count } = useCounterWithObject({ initial: 10, step: 2 });
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>10</div>');
    });

    // Test multiple variable inputs
    it('should initialize with multiple variable inputs', ({ container }) => {
      function TestComponent() {
        const { count } = useCounterWithMultipleParams(15, 3, 20);
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>15</div>');
    });

    // Test single variable output
    it('should return a single variable output', ({ container }) => {
      function TestComponent() {
        const { count } = useCounter();
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>0</div>');
    });

    // Test object output
    it('should return an object output', ({ container }) => {
      let setCountFromHook: () => void;

      function TestComponent() {
        const { count, setCount } = useCounter();
        setCountFromHook = setCount;
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>0</div>');
      setCountFromHook();
      expect(container.innerHTML).toBe('<div>1</div>');
    });

    // Test object input and update
    it('should initialize with an object input and update correctly', ({ container }) => {
      let incrementFromHook;

      function TestComponent() {
        const { count, setCount } = useCounterWithObject({ initial: 10, step: 2 });
        incrementFromHook = setCount;
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>10</div>');
      incrementFromHook();
      expect(container.innerHTML).toBe('<div>12</div>');
    });

    // Test array output
    it('should return an array output', ({ container }) => {
      let setCountFromHook: () => void;

      function TestComponent() {
        const [count, setCount] = useCounterReturningArray();
        setCountFromHook = setCount;
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>0</div>');
      setCountFromHook();
      expect(container.innerHTML).toBe('<div>1</div>');
    });

    // Test array output and update
    it('should return an array output and update correctly', ({ container }) => {
      let incrementFromHook;

      function TestComponent() {
        const [count, increment] = useCounterReturningArray(5);
        incrementFromHook = increment;
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>5</div>');
      incrementFromHook();
      expect(container.innerHTML).toBe('<div>6</div>');
    });

    // Test complex variable updates
    it('should update state correctly with complex inputs', ({ container }) => {
      let setCountFromHook: () => void;

      function TestComponent() {
        const { count, setCount } = useCounterWithMultipleParams(5, 2, 10);
        setCountFromHook = setCount;
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>5</div>');
      setCountFromHook();
      expect(container.innerHTML).toBe('<div>7</div>');
      setCountFromHook();
      expect(container.innerHTML).toBe('<div>9</div>');
      setCountFromHook();
      expect(container.innerHTML).toBe('<div>10</div>'); // Max value reached
    });
  });

  // 2. Multiple Instances
  describe('Multiple Instances', () => {
    it('should maintain separate state for multiple instances', ({ container }) => {
      let setCount1: () => void, setCount2: () => void;

      function TestComponent() {
        const { count: count1, setCount: setCount1Hook } = useCounter(0);
        const { count: count2, setCount: setCount2Hook } = useCounter(10);
        setCount1 = setCount1Hook;
        setCount2 = setCount2Hook;
        return (
          <div>
            {count1}-{count2}
          </div>
        );
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>0-10</div>');
      setCount1();
      setCount2();
      expect(container.innerHTML).toBe('<div>1-11</div>');
    });
  });

  // 3. Lifecycle and Effects
  describe('Lifecycle and Effects', () => {
    it.fails('should run effects on mount and cleanup on unmount', ({ container }) => {
      const mockEffect = vi.fn();
      const mockCleanup = vi.fn();

      function useEffectTest() {
        didMount(() => {
          mockEffect();
        });
        didUnmount(() => {
          mockCleanup();
        });
      }

      function TestComponent() {
        useEffectTest();
        return null;
      }

      render(TestComponent, container);

      expect(mockEffect).toHaveBeenCalledTimes(1);
      // unmount();
      // expect(mockCleanup).toHaveBeenCalledTimes(1);
    });
  });

  // 4. Context Integration
  describe('Context Integration', () => {
    it('should consume context correctly', ({ container }) => {
      const CountContext = createContext(0);

      function useContextCounter() {
        const count = useContext(CountContext);
        return count;
      }

      function TestComponent() {
        const { count } = useContextCounter();
        return <div>{count}</div>;
      }

      function App() {
        return (
          <CountContext count={5}>
            <TestComponent />
          </CountContext>
        );
      }

      render(App, container);
      expect(container.innerHTML).toBe('<div>5</div>');
    });
  });

  // 5. Props Handling
  describe('Props Handling', () => {
    it('should update when props change', ({ container }) => {
      function usePropsTest({ initial }: { initial: number }) {
        const value = initial;
        return value * 2;
      }

      let update: (n: number) => void;

      function TestComponent() {
        let value = 5;
        const hookValue = usePropsTest({ initial: value });
        update = (n: number) => (value = n);
        return <div>{hookValue}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>10</div>');
      update(10);
      expect(container.innerHTML).toBe('<div>20</div>');
    });
  });

  // 6. Hook Nesting
  describe('Hook Nesting', () => {
    it('should handle nested hook calls correctly', ({ container }) => {
      function useNestedCounter(initial: number) {
        const { count, setCount } = useCounter(initial);
        const doubleCount = count * 2;
        return { count, doubleCount, setCount };
      }

      let setCountFromHook: () => void;

      function TestComponent() {
        const { count, doubleCount, setCount } = useNestedCounter(5);
        setCountFromHook = setCount;
        return (
          <div>
            {count}-{doubleCount}
          </div>
        );
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>5-10</div>');
      // @ts-ignore
      setCountFromHook();
      expect(container.innerHTML).toBe('<div>6-12</div>');
    });
  });

  // 7. Hook Computation
  describe('hook return value computation', () => {
    it('should receive props and output value', ({ container }) => {
      let updateValue: (n: number) => void;

      function usePropsTest({ initial }: { initial: number }) {
        return initial * 2;
      }

      function TestComponent() {
        let value = 1;
        const hookValue = usePropsTest({ initial: value });
        let computed = hookValue * 2;
        updateValue = n => (value = n);
        return <div>{computed}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>4</div>');
      updateValue(2);
      expect(container.innerHTML).toBe('<div>8</div>');
    });
  });
});
