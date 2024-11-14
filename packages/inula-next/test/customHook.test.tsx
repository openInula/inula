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
/**
 * @jsxImportSource @openinula/next
 */
import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';

import { didMount, didUnmount, render } from '../src';
import { useContext, createContext } from '../src/ContextNode';

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

    it('should support derived by state', ({ container }) => {
      let updateCount: (max: number) => void;
      function TestComponent() {
        let init = 15;
        updateCount = (value: number) => (init = value);
        const { count } = useCounterWithMultipleParams(init, 3, 20);
        return <div>{count}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>15</div>');
      updateCount(10);
      expect(container.innerHTML).toBe('<div>10</div>');
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
    it('should run effects on mount and cleanup on unmount', ({ container }) => {
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
        return <div />;
      }

      render(TestComponent, container);

      expect(mockEffect).toHaveBeenCalledTimes(1);
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

describe('Hook and Watch Combined Tests', () => {
  it('should update watched value when hook state changes', ({ container }) => {
    let setCount;
    function useCounter(initial = 0) {
      let count = initial;
      setCount = n => {
        count = n;
      };
      return { count };
    }

    function TestComponent() {
      const { count } = useCounter(0);
      let watchedCount = 0;

      watch(() => {
        watchedCount = count * 2;
      });

      return <div>{watchedCount}</div>;
    }

    render(TestComponent, container);
    expect(container.innerHTML).toBe('<div>0</div>');
    setCount(5);
    expect(container.innerHTML).toBe('<div>10</div>');
  });

  it('should handle multiple watches in a custom hook', ({ container }) => {
    let setX, setY;
    function usePosition() {
      let x = 0,
        y = 0;
      setX = newX => {
        x = newX;
      };
      setY = newY => {
        y = newY;
      };

      let position = '';
      watch(() => {
        position = `(${x},${y})`;
      });

      let quadrant = 0;
      watch(() => {
        quadrant = x >= 0 && y >= 0 ? 1 : x < 0 && y >= 0 ? 2 : x < 0 && y < 0 ? 3 : 4;
      });

      return { position, quadrant };
    }

    function TestComponent() {
      const { position, quadrant } = usePosition();
      return (
        <div>
          {position} Q{quadrant}
        </div>
      );
    }

    render(TestComponent, container);
    expect(container.innerHTML).toBe('<div>(0,0) Q1</div>');
    setX(-5);
    setY(10);
    expect(container.innerHTML).toBe('<div>(-5,10) Q2</div>');
  });

  it('should correctly handle watch dependencies in hooks', ({ container }) => {
    let setItems;
    function useFilteredList(initialItems = []) {
      let items = initialItems;
      setItems = newItems => {
        items = newItems;
      };

      let evenItems = [];
      let oddItems = [];

      watch(() => {
        evenItems = items.filter(item => item % 2 === 0);
      });

      watch(() => {
        oddItems = items.filter(item => item % 2 !== 0);
      });

      return { evenItems, oddItems };
    }

    function TestComponent() {
      const { evenItems, oddItems } = useFilteredList([1, 2, 3, 4, 5]);
      return (
        <div>
          Even: {evenItems.join(',')} Odd: {oddItems.join(',')}
        </div>
      );
    }

    render(TestComponent, container);
    expect(container.innerHTML).toBe('<div>Even: 2,4 Odd: 1,3,5</div>');
    setItems([2, 4, 6, 8, 10]);
    expect(container.innerHTML).toBe('<div>Even: 2,4,6,8,10 Odd: </div>');
  });
});

describe('Advanced Hook Tests', () => {
  // Hook return tests
  describe('Hook Return Tests', () => {
    it('should handle expression return', ({ container }) => {
      function useExpression(a: number, b: number) {
        return a + b * 2;
      }

      function TestComponent() {
        const result = useExpression(3, 4);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>11</div>');
    });

    it('should handle object spread return', ({ container }) => {
      function useObjectSpread(obj: object) {
        return { ...obj, newProp: 'added' };
      }

      function TestComponent() {
        const result = useObjectSpread({ existingProp: 'original' });
        return <div>{JSON.stringify(result)}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>{"existingProp":"original","newProp":"added"}</div>');
    });

    it('should handle function call return', ({ container }) => {
      function useFunction() {
        const innerFunction = () => 42;
        return innerFunction();
      }

      function TestComponent() {
        const result = useFunction();
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>42</div>');
    });

    it('should handle conditional expression return', ({ container }) => {
      function useConditional(condition: boolean) {
        return condition ? 'True' : 'False';
      }

      function TestComponent() {
        const result = useConditional(true);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>True</div>');
    });

    it('should handle array computation return', ({ container }) => {
      function useArrayComputation(arr: number[]) {
        return arr.reduce((sum, num) => sum + num, 0);
      }

      function TestComponent() {
        const result = useArrayComputation([1, 2, 3, 4, 5]);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>15</div>');
    });

    it('should handle ternary expression return', ({ container }) => {
      function useTernary(value: number) {
        return value > 5 ? 'High' : value < 0 ? 'Low' : 'Medium';
      }

      function TestComponent() {
        const result = useTernary(7);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>High</div>');
    });

    it('should handle member expression return', ({ container }) => {
      function useMemberExpression(obj: { prop: string }) {
        return obj.prop;
      }

      function TestComponent() {
        const result = useMemberExpression({ prop: 'test' });
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>test</div>');
    });
  });

  // Hook input tests
  describe('Hook Input Tests', () => {
    it('should handle expression input', ({ container }) => {
      function useExpression(value: number) {
        return value * 2;
      }

      function TestComponent() {
        const result = useExpression(3 + 4);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>14</div>');
    });

    it('should handle object spread input', ({ container }) => {
      function useObjectSpread(obj: { a: number; b: number }) {
        return obj.a + obj.b;
      }

      function TestComponent() {
        const baseObj = { a: 1, c: 3 };
        const result = useObjectSpread({ ...baseObj, b: 2 });
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>3</div>');
    });

    it('should handle function call input', ({ container }) => {
      function useFunction(value: number) {
        return value * 2;
      }

      function getValue() {
        return 21;
      }

      function TestComponent() {
        const result = useFunction(getValue());
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>42</div>');
    });

    it('should handle conditional expression input', ({ container }) => {
      function useConditional(value: string) {
        return `Received: ${value}`;
      }

      function TestComponent() {
        const condition = true;
        const result = useConditional(condition ? 'Yes' : 'No');
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>Received: Yes</div>');
    });

    it('should handle array computation input', ({ container }) => {
      function useArraySum(sum: number) {
        return `Sum: ${sum}`;
      }

      function TestComponent() {
        const numbers = [1, 2, 3, 4, 5];
        const result = useArraySum(numbers.reduce((sum, num) => sum + num, 0));
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>Sum: 15</div>');
    });

    it('should handle ternary expression input', ({ container }) => {
      function useStatus(status: string) {
        return `Current status: ${status}`;
      }

      function TestComponent() {
        const value = 7;
        const result = useStatus(value > 5 ? 'High' : value < 0 ? 'Low' : 'Medium');
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>Current status: High</div>');
    });

    it('should handle member expression input', ({ container }) => {
      function useName(name: string) {
        return `Hello, ${name}!`;
      }

      function TestComponent() {
        const user = { name: 'Alice' };
        const result = useName(user.name);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>Hello, Alice!</div>');
    });
  });

  // Additional tests
  describe('Additional Hook Tests', () => {
    it('should handle input based on other variables', ({ container }) => {
      function useComputed(value: number) {
        return value * 2;
      }

      function TestComponent() {
        let baseValue = 5;
        let multiplier = 3;
        const result = useComputed(baseValue * multiplier);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>30</div>');
    });

    it('should handle function input and output', ({ container }) => {
      function useFunction(fn: (x: number) => number) {
        return (y: number) => fn(y) * 2;
      }

      function TestComponent() {
        const inputFn = (x: number) => x + 1;
        const resultFn = useFunction(inputFn);
        const result = resultFn(5);
        return <div>{result}</div>;
      }

      render(TestComponent, container);
      expect(container.innerHTML).toBe('<div>12</div>');
    });
  });
});
