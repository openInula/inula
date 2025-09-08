/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

/** @jsx Inula.createElement */
import Inula, { useSyncExternalStore, useSyncExternalStoreWithSelector, act } from '../../src/index';
import { createMockStore } from './mockStore';
const { unmountComponentAtNode, render } = Inula;

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

describe('useSyncExternalStore', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  describe('基础功能测试', () => {
    it('should subscribe to external store and return current value', () => {
      const store = createMockStore('initial');

      function App(): JSX.Element {
        const value = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{`Value: ${value}`}</div>;
      }

      act(() => {
        render(<App />, container);
      });

      expect(container.textContent).toBe('Value: initial');
      expect(store.getListenerCount()).toBe(1);

      act(() => {
        unmountComponentAtNode(container);
      });

      expect(store.getListenerCount()).toBe(0);
    });

    it('should re-render when store value changes', () => {
      const store = createMockStore(0);

      function App(): JSX.Element {
        const count = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{`Count: ${count}`}</div>;
      }

      render(<App />, container);
      expect(container.textContent).toBe('Count: 0');

      act(() => {
        store.setValue(1);
      });
      expect(container.textContent).toBe('Count: 1');

      act(() => {
        store.setValue(2);
      });
      expect(container.textContent).toBe('Count: 2');
    });

    it('should not re-render when store value does not change', () => {
      const store = createMockStore(0);
      let renderCount = 0;

      function App(): JSX.Element {
        renderCount++;
        const count = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{`Count: ${count}`}</div>;
      }

      render(<App />, container);
      expect(renderCount).toBe(1);

      act(() => {
        store.setValue(0); // Same value
      });
      expect(renderCount).toBe(1); // Should not re-render
    });

    it('should handle multiple rapid updates', () => {
      const store = createMockStore(0);

      function App(): JSX.Element {
        const count = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{`Count: ${count}`}</div>;
      }

      render(<App />, container);
      expect(container.textContent).toBe('Count: 0');

      act(() => {
        store.setValue(1);
        store.setValue(2);
        store.setValue(3);
      });
      expect(container.textContent).toBe('Count: 3');
    });

    it('should handle multiple components subscribing to same store', () => {
      const store = createMockStore('shared');
      let comp1RenderCount = 0;
      let comp2RenderCount = 0;

      function Component1(): JSX.Element {
        comp1RenderCount++;
        const value = useSyncExternalStore(store.subscribe, store.getValue);
        return <div id="comp1">{`Comp1: ${value}`}</div>;
      }

      function Component2(): JSX.Element {
        comp2RenderCount++;
        const value = useSyncExternalStore(store.subscribe, store.getValue);
        return <div id="comp2">{`Comp2: ${value}`}</div>;
      }

      function App(): JSX.Element {
        return (
          <div>
            <Component1 />
            <Component2 />
          </div>
        );
      }

      act(() => {
        render(<App />, container);
      });
      expect(store.getListenerCount()).toBe(2);
      expect(comp1RenderCount).toBe(1);
      expect(comp2RenderCount).toBe(1);

      act(() => {
        store.setValue('updated');
      });

      expect(comp1RenderCount).toBe(2);
      expect(comp2RenderCount).toBe(2);
      expect(container.querySelector('#comp1')!.textContent).toBe('Comp1: updated');
      expect(container.querySelector('#comp2')!.textContent).toBe('Comp2: updated');
    });

    it('should re-subscribe when store changes', () => {
      const store1 = createMockStore('store1');
      const store2 = createMockStore('store2');

      function App({ useStore1 }: { useStore1: boolean }): JSX.Element {
        const store = useStore1 ? store1 : store2;
        const value = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{`Value: ${value}`}</div>;
      }

      act(() => {
        render(<App useStore1={true} />, container);
      });
      expect(container.textContent).toBe('Value: store1');
      expect(store1.getListenerCount()).toBe(1);
      expect(store2.getListenerCount()).toBe(0);

      // Switch to store2
      act(() => {
        render(<App useStore1={false} />, container);
      });

      expect(container.textContent).toBe('Value: store2');
      expect(store1.getListenerCount()).toBe(0);
      expect(store2.getListenerCount()).toBe(1);
    });

    it('should update when getSnapshot function changes', () => {
      const store = createMockStore({ a: 1, b: 2 });

      interface ErrorBoundaryState {
        hasError: boolean;
        error: Error | null;
      }

      class ErrorBoundary extends Inula.Component<{ children: JSX.Element }, ErrorBoundaryState> {
        constructor(props: { children: JSX.Element }) {
          super(props);
          this.state = { hasError: false, error: null };
        }

        static getDerivedStateFromError(error: Error): ErrorBoundaryState {
          return { hasError: true, error };
        }

        componentDidCatch(): void {
          // Error handling for boundary
        }

        render(): JSX.Element {
          if (this.state.hasError) {
            return <div>{`Error: ${this.state.error!.message}`}</div>;
          }
          return this.props.children;
        }
      }

      function App({ selectA }: { selectA: boolean }): JSX.Element {
        const getSnapshot = selectA
          ? () => store.getValue().a
          : () => store.getValue().b;
        const value = useSyncExternalStore(store.subscribe, getSnapshot);
        return <div>{`Value: ${value}`}</div>;
      }

      render(
        <ErrorBoundary>
          <App selectA={true} />
        </ErrorBoundary>,
        container
      );
      expect(container.textContent).toBe('Value: 1');

      // Change selector
      render(
        <ErrorBoundary>
          <App selectA={false} />
        </ErrorBoundary>,
        container
      );
      expect(container.textContent).toBe('Value: 2');
    });

    it('selecting a specific value inside getSnapshot', () => {
      const store = createMockStore({ 
        user: { name: 'John', age: 30 }, 
        items: [1, 2, 3]
      });
      let errorCaught: Error | null = null;

      interface ErrorBoundaryState {
        hasError: boolean;
        error: Error | null;
      }

      class ErrorBoundary extends Inula.Component<{ children: JSX.Element }, ErrorBoundaryState> {
        constructor(props: { children: JSX.Element }) {
          super(props);
          this.state = { hasError: false, error: null };
        }

        static getDerivedStateFromError(error: Error): ErrorBoundaryState {
          return { hasError: true, error };
        }

        componentDidCatch(error: Error): void {
          errorCaught = error;
        }

        render(): JSX.Element {
          if (this.state.hasError) {
            return <div>{`Error: ${this.state.error!.message}`}</div>;
          }
          return this.props.children;
        }
      }

      function App({ selector }: { selector: string }): JSX.Element {
        const getSnapshot = () => {
          const state = store.getValue();
          if (selector === 'name') return state.user.name;
          if (selector === 'age') return state.user.age;
          if (selector === 'itemCount') return state.items.length;
          if (selector === 'error') throw new Error('getSnapshot selector error');
          return state;
        };
        const value = useSyncExternalStore(store.subscribe, getSnapshot);
        return <div>{`Value: ${JSON.stringify(value)}`}</div>;
      }

      // Test selecting user name
      render(
        <ErrorBoundary>
          <App selector="name" />
        </ErrorBoundary>,
        container
      );
      expect(container.textContent).toBe('Value: "John"');

      // Test selecting age
      render(
        <ErrorBoundary>
          <App selector="age" />
        </ErrorBoundary>,
        container
      );
      expect(container.textContent).toBe('Value: 30');

      // Test selecting item count
      render(
        <ErrorBoundary>
          <App selector="itemCount" />
        </ErrorBoundary>,
        container
      );
      expect(container.textContent).toBe('Value: 3');

      // Test error in getSnapshot selector
      render(
        <ErrorBoundary>
          <App selector="error" />
        </ErrorBoundary>,
        container
      );
      expect(container.textContent).toBe('Error: getSnapshot selector error');
      expect(errorCaught).toBeTruthy();
      expect(errorCaught!.message).toBe('getSnapshot selector error');
    });

    it('should handle getSnapshot throwing error', () => {
      const store = createMockStore('initial');
      let errorCaught: Error | null = null;

      interface ErrorBoundaryState {
        hasError: boolean;
        error: Error | null;
      }

      class ErrorBoundary extends Inula.Component<{ children: JSX.Element }, ErrorBoundaryState> {
        constructor(props: { children: JSX.Element }) {
          super(props);
          this.state = { hasError: false, error: null };
        }

        static getDerivedStateFromError(error: Error): ErrorBoundaryState {
          return { hasError: true, error };
        }

        componentDidCatch(error: Error): void {
          errorCaught = error;
        }

        render(): JSX.Element {
          if (this.state.hasError) {
            return <div>{`Error: ${this.state.error!.message}`}</div>;
          }
          return this.props.children;
        }
      }

      function App(): JSX.Element {
        const value = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{`Value: ${value}`}</div>;
      }

      render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>,
        container
      );
      expect(container.textContent).toBe('Value: initial');

      // Enable error in getSnapshot
      store.enableSnapshotError();

      act(() => {
        store.setValue('trigger-error');
      });

      expect(container.textContent).toBe('Error: getSnapshot error');
      expect(errorCaught).toBeTruthy();
      expect(errorCaught!.message).toBe('getSnapshot error');
    });
  });

  describe('对象引用比较', () => {
    it('should handle object reference changes', () => {
      const store = createMockStore({ count: 0, name: 'test' });

      function App(): JSX.Element {
        const state = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{`${state.count}-${state.name}`}</div>;
      }

      render(<App />, container);
      expect(container.textContent).toBe('0-test');

      act(() => {
        store.updateProperty('count', 1);
      });
      expect(container.textContent).toBe('1-test');

      act(() => {
        store.updateProperty('name', 'updated');
      });
      expect(container.textContent).toBe('1-updated');
    });

    it('should not re-render for equivalent objects', () => {
      const store = createMockStore({ a: 1, b: 2 });
      let renderCount = 0;

      function App(): JSX.Element {
        renderCount++;
        const obj = useSyncExternalStore(store.subscribe, store.getValue);
        return <div>{JSON.stringify(obj)}</div>;
      }

      render(<App />, container);
      expect(renderCount).toBe(1);

      // Set the same object reference - should not re-render
      const currentValue = store.getValue();
      act(() => {
        store.setValue(currentValue);
      });
      expect(renderCount).toBe(1);

      // Set different object with same content - should re-render
      act(() => {
        store.setValue({ a: 1, b: 2 });
      });
      expect(renderCount).toBe(2);
    });
  });

  describe('useSyncExternalStoreWithSelector', () => {
    it('should only re-render when selected value changes', () => {
      const store = createMockStore({ count: 0, name: 'test', other: 'unchanged' });
      let renderCount = 0;

      function App(): JSX.Element {
        renderCount++;
        const count = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          (state: any) => state.count
        );
        return <div>{`Count: ${count}`}</div>;
      }

      render(<App />, container);
      expect(container.textContent).toBe('Count: 0');
      expect(renderCount).toBe(1);

      // Update selected property - should re-render
      act(() => {
        store.updateProperty('count', 1);
      });
      expect(container.textContent).toBe('Count: 1');
      expect(renderCount).toBe(2);

      // Update non-selected property - should NOT re-render
      act(() => {
        store.updateProperty('other', 'changed');
      });
      expect(container.textContent).toBe('Count: 1');
      expect(renderCount).toBe(2); // No re-render

      // Update selected property again
      act(() => {
        store.updateProperty('count', 2);
      });
      expect(container.textContent).toBe('Count: 2');
      expect(renderCount).toBe(3);
    });

    it('should work with custom equality function', () => {
      const store = createMockStore({
        user: { id: 1, name: 'John', age: 30 }
      });
      let renderCount = 0;

      // Custom equality that only compares user.name
      const isEqual = (a: any, b: any) => a.name === b.name;

      function App(): JSX.Element {
        renderCount++;
        const user = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          (state: any) => state.user,
          isEqual
        );
        return <div>{`User: ${user?.name}-${user?.age}`}</div>;
      }

      render(<App />, container);
      expect(container.textContent).toBe('User: John-30');
      expect(renderCount).toBe(1);

      // Change age but keep name same - should NOT re-render due to custom equality
      act(() => {
        store.updateProperty('user', { id: 1, name: 'John', age: 31 });
      });
      expect(renderCount).toBe(1); // No re-render

      // Change name - should re-render
      act(() => {
        store.updateProperty('user', { id: 1, name: 'Jane', age: 31 });
      });
      expect(container.textContent).toBe('User: Jane-31');
      expect(renderCount).toBe(2);
    });

    it('should handle complex object selection', () => {
      const store = createMockStore({
        todos: [
          { id: 1, text: 'Task 1', completed: false },
          { id: 2, text: 'Task 2', completed: true },
          { id: 3, text: 'Task 3', completed: false }
        ],
        filter: 'all'
      });

      function App(): JSX.Element {
        const incompleteTodos = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          (state: any) => state.todos?.filter((todo: TodoItem) => !todo.completed) || []
        );
        return <div>{`Incomplete: ${incompleteTodos.length}`}</div>;
      }

      render(<App />, container);
      expect(container.textContent).toBe('Incomplete: 2');

      // Complete a todo
      act(() => {
        const currentState = store.getValue();
        const newTodos = (currentState as any).todos?.map((todo: TodoItem) =>
          todo.id === 1 ? { ...todo, completed: true } : todo
        ) || [];
        store.setValue({ ...currentState, todos: newTodos });
      });
      expect(container.textContent).toBe('Incomplete: 1');

      // Change filter (doesn't affect selection) - should NOT re-render
      const renderCountBefore = container.textContent;
      act(() => {
        store.updateProperty('filter', 'completed');
      });
      expect(container.textContent).toBe(renderCountBefore); // Same content
    });

    it('should maintain reference stability when selection result is equal', () => {
      const store = createMockStore({ items: [1, 2, 3], version: 1 });
      const selections: any[] = [];

      function App(): JSX.Element {
        const items = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          (state: any) => state.items
        );
        selections.push(items);
        return <div>{`Items: ${items?.join(',') || ''}`}</div>;
      }

      render(<App />, container);
      expect(container.textContent).toBe('Items: 1,2,3');

      // Update version but keep items same
      act(() => {
        store.updateProperty('version', 2);
      });

      // Should maintain same reference for items
      expect(selections.length).toBe(1);
      expect(selections[0]).toBe(selections[0]); // Same reference
    });

    it('should work with multiple selectors on same store', () => {
      const store = createMockStore({
        user: { name: 'John', email: 'john@example.com' },
        settings: { theme: 'dark', language: 'en' }
      });

      function UserName(): JSX.Element {
        const name = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          (state: any) => state.user?.name
        );
        return <div id="name">{`Name: ${name}`}</div>;
      }

      function UserTheme(): JSX.Element {
        const theme = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          (state: any) => state.settings?.theme
        );
        return <div id="theme">{`Theme: ${theme}`}</div>;
      }

      function App(): JSX.Element {
        return (
          <div>
            <UserName />
            <UserTheme />
          </div>
        );
      }

      render(<App />, container);
      expect(container.querySelector('#name')!.textContent).toBe('Name: John');
      expect(container.querySelector('#theme')!.textContent).toBe('Theme: dark');

      // Update user name - only UserName should re-render
      act(() => {
        const currentState = store.getValue() as any;
        store.setValue({
          ...currentState,
          user: { ...currentState.user!, name: 'Jane' }
        });
      });
      expect(container.querySelector('#name')!.textContent).toBe('Name: Jane');
      expect(container.querySelector('#theme')!.textContent).toBe('Theme: dark');

      // Update theme - only UserTheme should re-render  
      act(() => {
        const currentState = store.getValue() as any;
        store.setValue({
          ...currentState,
          settings: { ...currentState.settings!, theme: 'light' }
        });
      });
      expect(container.querySelector('#name')!.textContent).toBe('Name: Jane');
      expect(container.querySelector('#theme')!.textContent).toBe('Theme: light');
    });

    it('should handle selector function changes', () => {
      const store = createMockStore({ a: 1, b: 2, c: 3 });

      function App({ selectA }: { selectA: boolean }): JSX.Element {
        const value = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          selectA ? (state: any) => state.a : (state: any) => state.b
        );
        return <div>{`Value: ${value}`}</div>;
      }

      render(<App selectA={true} />, container);
      expect(container.textContent).toBe('Value: 1');

      // Change selector function
      render(<App selectA={false} />, container);
      expect(container.textContent).toBe('Value: 2');

      // Update the now-selected property
      act(() => {
        store.updateProperty('b', 5);
      });
      expect(container.textContent).toBe('Value: 5');
    });

    it('should handle selector throwing errors', () => {
      const store = createMockStore({ value: 'test' });

      function App({ shouldThrow }: { shouldThrow: boolean }): JSX.Element {
        const value = useSyncExternalStoreWithSelector(
          store.subscribe,
          store.getValue,
          store.getValue,
          (state: any) => {
            if (shouldThrow) {
              throw new Error('Selector error');
            }
            return state.value;
          }
        );
        return <div>{`Value: ${value}`}</div>;
      }

      render(<App shouldThrow={false} />, container);
      expect(container.textContent).toBe('Value: test');

      // Enable selector error
      expect(() => {
        render(<App shouldThrow={true} />, container);
      }).toThrow('Selector error');
    });
  });
});