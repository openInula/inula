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

    it('Should correctly compute and render a derived string state', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let firstName = 'John';
        let lastName = 'Doe';
        const fullName = `${firstName} ${lastName}`;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateName() {
          firstName = 'Jane';
        }

        return (
          <div>
            <p data-testid="result">{fullName}</p>
            <button onClick={updateName}>Update Name</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('John Doe');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Jane Doe');
    });

    it('Should correctly compute and render a derived number state', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let price = 10;
        let quantity = 2;
        const total = price * quantity;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function increaseQuantity() {
          quantity += 1;
        }

        return (
          <div>
            <p data-testid="result">Total: ${total}</p>
            <button onClick={increaseQuantity}>Add Item</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Total: $20');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Total: $30');
    });

    it('Should correctly compute and render a derived boolean state', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let age = 17;
        const isAdult = age >= 18;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function increaseAge() {
          age += 1;
        }

        return (
          <div>
            <p data-testid="result">Is Adult: {isAdult ? 'Yes' : 'No'}</p>
            <button onClick={increaseAge}>Have Birthday</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Is Adult: No');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Is Adult: Yes');
    });

    it('Should correctly compute and render a derived array state', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let numbers = [1, 2, 3, 4, 5];
        const evenNumbers = numbers.filter(n => n % 2 === 0);

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function addNumber() {
          numbers.push(6);
        }

        return (
          <div>
            <p data-testid="result">Even numbers: {evenNumbers.join(', ')}</p>
            <button onClick={addNumber}>Add Number</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Even numbers: 2, 4');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Even numbers: 2, 4, 6');
    });

    it('Should correctly compute and render a derived object state', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let user = { name: 'John', age: 30 };
        const userSummary = { ...user, isAdult: user.age >= 18 };

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateAge() {
          user.age = 17;
        }

        return (
          <div>
            <p data-testid="result">
              {userSummary.name} is {userSummary.isAdult ? 'an adult' : 'not an adult'}
            </p>
            <button onClick={updateAge}>Update Age</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('John is an adult');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('John is not an adult');
    });

    it('Should correctly compute state based on array index', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let items = ['Apple', 'Banana', 'Cherry'];
        let index = 0;
        const currentItem = items[index];

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function nextItem() {
          index = (index + 1) % items.length;
        }

        return (
          <div>
            <p data-testid="result">Current item: {currentItem}</p>
            <button onClick={nextItem}>Next Item</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Current item: Apple');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Current item: Banana');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Current item: Cherry');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Current item: Apple');
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

    it.fails('should compute correctly with functional dependencies', ({ container }) => {
      function App() {
        let x = 1;
        const double = x * 2;
        const quadruple = double * 2;
        const getQuadruple = () => quadruple;
        const result = getQuadruple() + x;
        return <div>{result}</div>;
      }

      render(App, container);

      expect(container.innerHTML).toBe('<div>5</div>');
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
    it('Should correctly compute and render a derived string state from multi dependency', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let firstName = 'John';
        let lastName = 'Doe';
        let title = 'Mr.';
        const fullName = `${title} ${firstName} ${lastName}`;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateName() {
          firstName = 'Jane';
          title = 'Ms.';
        }

        return (
          <div>
            <p data-testid="result">{fullName}</p>
            <button onClick={updateName}>Update Name</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Mr. John Doe');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Ms. Jane Doe');
    });

    it('Should correctly compute and render a derived number state from multi dependency', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let length = 5;
        let width = 3;
        let height = 2;
        const volume = length * width * height;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateDimensions() {
          length += 1;
          width += 2;
        }

        return (
          <div>
            <p data-testid="result">Volume: {volume}</p>
            <button onClick={updateDimensions}>Update Dimensions</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Volume: 30');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Volume: 60');
    });

    it('Should correctly compute and render a derived boolean state from multi dependency', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let age = 20;
        let hasLicense = false;
        let hasCar = true;
        const canDrive = age >= 18 && hasLicense && hasCar;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateStatus() {
          hasLicense = true;
        }

        return (
          <div>
            <p data-testid="result">Can Drive: {canDrive ? 'Yes' : 'No'}</p>
            <button onClick={updateStatus}>Get License</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Can Drive: No');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Can Drive: Yes');
    });

    it('Should correctly compute and render a derived array state from multi dependency', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let numbers1 = [1, 2, 3];
        let numbers2 = [4, 5, 6];
        let filterEven = true;
        const result = [...numbers1, ...numbers2].filter(n => (filterEven ? n % 2 === 0 : n % 2 !== 0));

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function toggleFilter() {
          filterEven = !filterEven;
        }

        return (
          <div>
            <p data-testid="result">Filtered numbers: {result.join(', ')}</p>
            <button onClick={toggleFilter}>Toggle Filter</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Filtered numbers: 2, 4, 6');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Filtered numbers: 1, 3, 5');
    });

    it('Should correctly compute and render a derived object state from multi dependency', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let user = { name: 'John', age: 30 };
        let settings = { theme: 'dark', fontSize: 14 };
        let isLoggedIn = true;
        const userProfile = {
          ...user,
          ...settings,
          status: isLoggedIn ? 'Online' : 'Offline',
        };

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateStatus() {
          isLoggedIn = false;
          settings.theme = 'light';
        }

        return (
          <div>
            <p data-testid="result">
              {userProfile.name} ({userProfile.age}) - {userProfile.status} - Theme: {userProfile.theme}
            </p>
            <button onClick={updateStatus}>Logout</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('John (30) - Online - Theme: dark');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('John (30) - Offline - Theme: light');
    });
  });

  describe('Advanced Computed States', () => {
    it('Should support basic arithmetic operations', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let a = 10;
        let b = 5;
        const sum = a + b;
        const difference = a - b;
        const product = a * b;
        const quotient = a / b;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        return (
          <div data-testid="result">
            <p>Sum: {sum}</p>
            <p>Difference: {difference}</p>
            <p>Product: {product}</p>
            <p>Quotient: {quotient}</p>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.innerHTML).toBe('<p>Sum: 15</p><p>Difference: 5</p><p>Product: 50</p><p>Quotient: 2</p>');
    });

    it('Should support array indexing', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let arr = [10, 20, 30, 40, 50];
        let index = 2;
        const value = arr[index];

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateIndex() {
          index = 4;
        }

        return (
          <div>
            <p data-testid="result">Value: {value}</p>
            <button onClick={updateIndex}>Update Index</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Value: 30');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Value: 50');
    });

    it('Should support property access', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let obj = { name: 'John', age: 30 };
        const name = obj.name;

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateName() {
          obj.name = 'Jane';
        }

        return (
          <div>
            <p data-testid="result">Name: {name}</p>
            <button onClick={updateName}>Update Name</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Name: John');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Name: Jane');
    });

    it('Should support function calls', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let numbers = [1, 2, 3, 4, 5];
        const sum = numbers.reduce((a, b) => a + b, 0);

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        return <p data-testid="result">Sum: {sum}</p>;
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Sum: 15');
    });

    it('Should support various number operations', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let num = 3.14159;
        const rounded = Math.round(num);
        const floored = Math.floor(num);
        const ceiled = Math.ceil(num);
        const squared = Math.pow(num, 2);

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        return (
          <div data-testid="result">
            <p>Rounded: {rounded}</p>
            <p>Floored: {floored}</p>
            <p>Ceiled: {ceiled}</p>
            <p>Squared: {squared.toFixed(2)}</p>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.innerHTML).toBe('<p>Rounded: 3</p><p>Floored: 3</p><p>Ceiled: 4</p><p>Squared: 9.87</p>');
    });

    it('Should support map operations', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let numbers = [1, 2, 3, 4, 5];
        const squaredNumbers = numbers.map(n => n * n);

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        return <p data-testid="result">Squared: {squaredNumbers.join(', ')}</p>;
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Squared: 1, 4, 9, 16, 25');
    });

    it('Should support conditional expressions', ({ container }) => {
      let resultElement: HTMLElement;

      function App() {
        let age = 20;
        let hasLicense = true;
        const canDrive = age >= 18 ? (hasLicense ? 'Yes' : 'No, needs license') : 'No, too young';

        didMount(() => {
          resultElement = container.querySelector('[data-testid="result"]')!;
        });

        function updateAge() {
          age = 16;
        }

        return (
          <div>
            <p data-testid="result">Can Drive: {canDrive}</p>
            <button onClick={updateAge}>Update Age</button>
          </div>
        );
      }

      render(App, container);

      expect(resultElement.textContent).toBe('Can Drive: Yes');
      container.querySelector('button')!.click();
      expect(resultElement.textContent).toBe('Can Drive: No, too young');
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
