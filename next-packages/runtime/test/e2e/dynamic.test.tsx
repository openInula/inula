import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render, willUnmount, Dynamic, didUnmount, createContext, useContext } from '../../src';

vi.mock('../../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('dynamic', () => {
  it('should render', ({ container }) => {
    function Hello() {
      return <div>Hello</div>;
    }
    function App() {
      return <Dynamic component={Hello} />;
    }

    render(App(), container);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          Hello
        </div>
      </div>
    `);
  });

  it('should call unmount', ({ container }) => {
    const fn = vi.fn();
    function Hello() {
      didUnmount(() => {
        fn();
      });
      willUnmount(() => {
        fn();
      });

      return <div>Hello</div>;
    }
    function World() {
      return <div>World</div>;
    }

    let change: () => void;
    function App() {
      let index = 0;
      change = () => {
        index = index + 1;
      };
      return <Dynamic component={index % 2 === 0 ? Hello : World} />;
    }

    render(App(), container);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          Hello
        </div>
      </div>
    `);
    change!();

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          World
        </div>
      </div>
    `);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should get the context', ({ container }) => {
    const CurrentContext = createContext(0);

    function Hello() {
      return <div>Hello</div>;
    }

    function World() {
      const { index } = useContext(CurrentContext);
      return <div>{index}</div>;
    }
    let changeComp: () => void;
    let changeContext: () => void;
    function App() {
      let index = 0;
      let context = 0;
      changeComp = () => {
        index = index + 1;
      };
      changeContext = () => {
        context = context + 1;
      };
      const Component = index % 2 === 0 ? Hello : World;
      return (
        <CurrentContext index={context}>
          <Dynamic component={Component} />
        </CurrentContext>
      );
    }

    render(App(), container);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          Hello
        </div>
      </div>
    `);
    changeComp!();

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          0
        </div>
      </div>
    `);
    changeContext!();

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          1
        </div>
      </div>
    `);
  });

  it('should support dynamic components with props', ({ container }) => {
    function Hello({ name }: { name: string }) {
      return <div>Hello {name}</div>;
    }
    function World({ count }: { count: number }) {
      return <div>Count: {count}</div>;
    }

    let changeComp: () => void;
    let updateProps: () => void;
    function App() {
      let index = 0;
      let props = { name: 'World', count: 0 };

      changeComp = () => {
        index = index + 1;
      };
      updateProps = () => {
        props = { name: 'Inula', count: 42 };
      };

      const Component = index % 2 === 0 ? Hello : World;
      const componentProps = index % 2 === 0 ? { name: props.name } : { count: props.count };

      return <Dynamic component={Component} {...componentProps} />;
    }

    render(App(), container);

    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Hello World</div>"`);

    updateProps!();
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Hello Inula</div>"`);

    changeComp!();
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Count: 42</div>"`);
  });

  it('should handle null/undefined components gracefully', ({ container }) => {
    let setComp: (comp: any) => void;
    function App() {
      let comp = null;
      setComp = c => (comp = c);
      return <Dynamic component={comp} />;
    }

    render(App(), container);
    expect(container.innerHTML).toBe('');

    function TestComp() {
      return <div>Test</div>;
    }
    setComp!(TestComp);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Test</div>"`);

    setComp!(undefined);
    expect(container.innerHTML).toBe('');
  });

  it('should update when component props change', ({ container }) => {
    function Counter({ count, label }: { count: number; label: string }) {
      return (
        <div>
          {label}: {count}
        </div>
      );
    }

    let updateCount: () => void;
    function App() {
      let count = 0;
      updateCount = () => count++;
      return <Dynamic component={Counter} count={count} label="Count" />;
    }

    render(App(), container);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Count: 0</div>"`);

    updateCount!();
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Count: 1</div>"`);
  });

  it('should handle component returning multiple elements', ({ container }) => {
    function MultipleElements() {
      return (
        <>
          <div>First</div>
          <div>Second</div>
        </>
      );
    }

    render(<Dynamic component={MultipleElements} />, container);
    expect(container.innerHTML).toMatchInlineSnapshot(`
      "<div>First</div><div>Second</div>"
    `);
  });

  it('should handle dynamic components with rest props', ({ container }) => {
    function Hello({ name, ...rest }: { name: string; [key: string]: any }) {
      return (
        <div>
          Hello {name} {JSON.stringify(rest)}
        </div>
      );
    }

    let updateProps: () => void;
    function App() {
      let props = { name: 'World', count: 1 };
      updateProps = () => {
        props = { name: 'Inula', count: 2 };
      };
      return <Dynamic component={Hello} {...props} />;
    }

    render(App(), container);
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Hello World {"count":1}</div>"`);

    updateProps!();
    expect(container.innerHTML).toMatchInlineSnapshot(`"<div>Hello Inula {"count":2}</div>"`);
  });
});
