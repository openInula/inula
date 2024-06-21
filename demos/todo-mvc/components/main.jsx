import { TOGGLE_ALL } from '../constants';
import { Item } from './item.jsx';

export function Main({ todos, dispatch }) {
  // listen for route changes
  let route = window.location.hash;
  window.addEventListener('hashchange', () => {
    console.log('hashchange', window.location.hash);
    route = window.location.hash.slice(1);
  });

  const visibleTodos = todos.filter(todo => {
    if (route === '/active') return !todo.completed;

    if (route === '/completed') return todo.completed;

    return todo;
  });

  const toggleAll = e => dispatch({ type: TOGGLE_ALL, payload: { completed: e.target.checked } });

  return (
    <main className="main" data-testid="main">
      <if cond={visibleTodos.length > 0}>
        <div className="toggle-all-container">
          <input
            className="toggle-all"
            type="checkbox"
            data-testid="toggle-all"
            checked={visibleTodos.every(todo => todo.completed)}
            onChange={toggleAll}
          />
          <label className="toggle-all-label" htmlFor="toggle-all">
            Toggle All Input
          </label>
        </div>
      </if>
      <ul className="todo-list" data-testid="todo-list">
        <for each={visibleTodos}>{todo => <Item todo={todo} key={todo.id} dispatch={dispatch} />}</for>
      </ul>
    </main>
  );
}
