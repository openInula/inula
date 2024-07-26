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

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render, didMount } from '../src';

vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('Computed Properties', () => {
  describe('Basic Functionality', () => {
    it('should correctly compute a value based on a single dependency', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let count = 0;
        const doubleCount = count * 2;

        function onClick() {
          count = count + 1;
        }

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        return (
          <div>
            <p data-testid="result">{doubleCount}</p>
            <button onClick={onClick}>Increment</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('0');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('2');
    });

    it('should update computed value when dependency changes', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let width = 5;
        let height = 10;
        const area = width * height;

        function onClick() {
          width = width + 1;
        }

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        return (
          <div>
            <p data-testid="result">{area}</p>
            <button onClick={onClick}>Increase Width</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('50');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('60');
    });
  });

  describe('Multiple Dependencies', () => {
    it('should compute correctly with multiple dependencies', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let x = 5;
        let y = 10;
        let z = 2;
        const result = x * y + z;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        return <p data-testid="result">{result}</p>;
      }

      render(App, container);

      expect(resultElement.textContent).toBe('52');
    });

    it('should update when any dependency changes', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let x = 5;
        let y = 10;
        const sum = x + y;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function onClickX() {
          x = x + 1;
        }

        function onClickY() {
          y = y + 1;
        }

        return (
          <div>
            <p data-testid="result">{sum}</p>
            <button onClick={onClickX}>Increase X</button>
            <button onClick={onClickY}>Increase Y</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('15');
      container.querySelectorAll('button')[0].click();
      expect(resultElement.textContent).toBe('16');
      container.querySelectorAll('button')[1].click();
      expect(resultElement.textContent).toBe('17');
    });
  });

  describe('Nested Computed Properties', () => {
    it('should handle nested computed properties correctly', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let base = 5;
        const square = base * base;
        const cube = square * base;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function onClick() {
          base = base + 1;
        }

        return (
          <div>
            <p data-testid="result">{cube}</p>
            <button onClick={onClick}>Increase Base</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('125');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('216');
    });
  });

  describe('Conditional Dependence', () => {
    it('should handle conditional dependencies correctly', ({ container }) => {
      let resultElement: HTMLElement;
      let toggleButton: HTMLElement;
      let incrementValue1Button: HTMLElement;
      let incrementValue2Button: HTMLElement;

      function App() {
        let useAlternative = false;
        let value1 = 10;
        let value2 = 20;

        // This computed property has conditional dependencies
        const result = useAlternative ? value2 * 2 : value1 * 2;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
          toggleButton = container.querySelector('[data-testid="toggle"]')!;
          incrementValue1Button = container.querySelector('[data-testid="increment-value1"]')!;
          incrementValue2Button = container.querySelector('[data-testid="increment-value2"]')!;
        });

        function toggle() {
          useAlternative = !useAlternative;
        }

        const onClick1 = () => {
          value1 += 5;
        };

        const onClick2 = () => {
          value2 += 5;
        };
        return (
          <div>
            <p data-testid="result">{result}</p>
            <button data-testid="toggle" onClick={toggle}>
              Toggle Alternative
            </button>
            <button data-testid="increment-value1" onClick={onClick1}>
              Increment Value1
            </button>
            <button data-testid="increment-value2" onClick={onClick2}>
              Increment Value2
            </button>
          </div>
        );
      }

      render(App, container);

      // Check initial state
      expect(resultElement.textContent).toBe('20');

      // Switch to alternative value
      toggleButton.click();
      expect(resultElement.textContent).toBe('40');

      // Increment value1 (should not affect result as we're using value2)
      incrementValue1Button.click();
      expect(resultElement.textContent).toBe('40');

      // Increment value2 (should affect result)
      incrementValue2Button.click();
      expect(resultElement.textContent).toBe('50');

      // Switch back to original value
      toggleButton.click();
      expect(resultElement.textContent).toBe('30'); // value1 was incremented earlier
    });
  });
});
