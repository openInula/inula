/**
 * @jsxImportSource @openinula/next
 */
import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render } from '../src';

vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});
describe('Fragment Tests', () => {
  it('should render multiple elements using Fragment', ({ container }) => {
    function App() {
      return (
        <>
          <div>First</div>
          <div>Second</div>
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>First</div><div>Second</div>');
  });

  it('should render an empty Fragment', ({ container }) => {
    function App() {
      return <></>;
    }

    render(App, container);
    expect(container.innerHTML).toBe('');
  });
  it('should support nested Fragments', ({ container }) => {
    function ChildComponent() {
      return (
        <>
          <span>Child</span>
        </>
      );
    }

    function App() {
      return (
        <>
          <div>Start</div>
          <>
            <p>Nested</p>
            <ChildComponent />
          </>
          <div>End</div>
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>Start</div><p>Nested</p><span>Child</span><div>End</div>');
  });

  it('should support conditional rendering with Fragments', ({ container }) => {
    function App() {
      let showExtra = false;

      function toggleExtra() {
        showExtra = !showExtra;
      }

      return (
        <>
          <div>Always</div>
          {showExtra && (
            <>
              <div>Extra 1</div>
              <div>Extra 2</div>
            </>
          )}
          <button onClick={toggleExtra}>Toggle</button>
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>Always</div><button>Toggle</button>');

    container.querySelector('button')?.click();
    expect(container.innerHTML).toBe('<div>Always</div><div>Extra 1</div><div>Extra 2</div><button>Toggle</button>');
  });

  it('should support ternary operators with Fragments', ({ container }) => {
    function App() {
      let condition = true;

      function toggleCondition() {
        condition = !condition;
      }

      return (
        <>
          {condition ? (
            <>
              <div>True 1</div>
              <div>True 2</div>
            </>
          ) : (
            <>
              <div>False 1</div>
              <div>False 2</div>
            </>
          )}
          <button onClick={toggleCondition}>Toggle</button>
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>True 1</div><div>True 2</div><button>Toggle</button>');

    container.querySelector('button')?.click();
    expect(container.innerHTML).toBe('<div>False 1</div><div>False 2</div><button>Toggle</button>');
  });

  it('should support state updates within Fragments', ({ container }) => {
    function App() {
      let count = 0;

      function increment() {
        count += 1;
      }

      return (
        <>
          <div>Count: {count}</div>
          <button onClick={increment}>Increment</button>
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<div>Count: 0</div><button>Increment</button>');

    container.querySelector('button')?.click();
    expect(container.innerHTML).toBe('<div>Count: 1</div><button>Increment</button>');
  });

  it('should support event handling within Fragments', ({ container }) => {
    function App() {
      let clicked = false;

      function handleClick() {
        clicked = true;
      }

      return (
        <>
          <button onClick={handleClick}>Click me</button>
          <div>{clicked ? 'Clicked' : 'Not clicked'}</div>
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe('<button>Click me</button><div>Not clicked</div>');

    container.querySelector('button')?.click();
    expect(container.innerHTML).toBe('<button>Click me</button><div>Clicked</div>');
  });

  it('should not affect CSS styling', ({ container }) => {
    function App() {
      return (
        <>
          <div className="styled">Styled div</div>
          <span style={{ color: 'red' }}>Red span</span>
        </>
      );
    }

    render(App, container);
    const styledDiv = container.querySelector('.styled');
    const redSpan = container.querySelector('span');

    expect(styledDiv).not.toBeNull();
    expect(redSpan).not.toBeNull();
    expect(redSpan?.style.color).toBe('red');
  });

  it('should support mixing text and JSX expression containers within Fragments', ({ container }) => {
    function App() {
      const name = 'World';
      const age = 42;
      const hobbies = ['reading', 'coding', 'gaming'];

      return (
        <>
          Hello, {name}! You are {age} years old.Your hobbies include:
          {hobbies.map(h => (
            <span>{h}</span>
          ))}
        </>
      );
    }

    render(App, container);
    expect(container.innerHTML).toBe(
      'Hello, World! You are 42 years old.Your hobbies include:<span>reading</span><span>coding</span><span>gaming</span>'
    );
  });
});
