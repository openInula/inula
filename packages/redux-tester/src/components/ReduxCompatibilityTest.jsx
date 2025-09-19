import { useSelector, useDispatch, useStore } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { selectCounter, selectTodos, increment } from '../store';

function ReduxCompatibilityTest() {
  const dispatch = useDispatch();
  const store = useStore();
  
  const count = useSelector(selectCounter);
  const todos = useSelector(selectTodos);
  
  const memoizedCount = useSelector(useCallback(state => state.counter.value, []));
  
  const computedStats = useMemo(() => {
    return {
      totalTodos: todos.length,
      completedTodos: todos.filter(todo => todo.completed).length,
      countDoubled: count * 2
    };
  }, [todos, count]);

  const testBatchedUpdates = () => {
    dispatch(increment());
    dispatch(increment());
    dispatch(increment());
  };

  return (
    <div className="compatibility-test">
      <h2>React-Redux Compatibility Test</h2>
      
      <div className="test-section">
        <h3>Hook Tests</h3>
        <p><strong>useSelector:</strong> ✅ Count: {count}</p>
        <p><strong>useSelector (memoized):</strong> ✅ Count: {memoizedCount}</p>
        <p><strong>useDispatch:</strong> ✅ Available</p>
        <p><strong>useStore:</strong> ✅ Store available: {store ? 'Yes' : 'No'}</p>
      </div>

      <div className="test-section">
        <h3>Computed Values (useMemo)</h3>
        <p>Total Todos: {computedStats.totalTodos}</p>
        <p>Completed Todos: {computedStats.completedTodos}</p>
        <p>Count Doubled: {computedStats.countDoubled}</p>
      </div>

      <div className="test-section">
        <h3>Batched Updates Test</h3>
        <button onClick={testBatchedUpdates}>
          Dispatch 3 increments (should batch)
        </button>
        <p>Current count: {count}</p>
      </div>

      <div className="test-section">
        <h3>Store State Inspection</h3>
        <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(store?.getState(), null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default ReduxCompatibilityTest;