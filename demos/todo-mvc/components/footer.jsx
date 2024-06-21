import { REMOVE_COMPLETED_ITEMS } from '../constants';

export function Footer({ todos, dispatch }) {
  let route = window.location.hash;
  window.addEventListener('hashchange', () => {
    console.log('hashchange', window.location.hash);
    route = window.location.hash.slice(1);
  });
  const activeTodos = todos.filter(todo => !todo.completed);

  const removeCompleted = () => dispatch({ type: REMOVE_COMPLETED_ITEMS });

  return (
    <footer className="footer" data-testid="footer">
      <span className="todo-count">{`${activeTodos.length} ${activeTodos.length === 1 ? 'item' : 'items'} left!`}</span>
      <ul className="filters" data-testid="footer-navigation">
        <li>
          <a className={route === '/' ? 'selected' : ''} href="#/">
            All
          </a>
        </li>
        <li>
          <a className={route === '/active' ? 'selected' : ''} href="#/active">
            Active
          </a>
        </li>
        <li>
          <a className={route === '/completed' ? 'selected' : ''} href="#/completed">
            Completed
          </a>
        </li>
      </ul>
      <button className="clear-completed" disabled={activeTodos.length === todos.length} onClick={removeCompleted}>
        Clear completed
      </button>
    </footer>
  );
}
