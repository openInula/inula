import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount, reset, clearHistory, selectCounter, selectCounterHistory } from '../store';

function Counter() {
  const count = useSelector(selectCounter);
  const history = useSelector(selectCounterHistory);
  const dispatch = useDispatch();

  return (
    <div className="counter-container">
      <h2>Counter Test Component</h2>
      <div className="counter-display">
        <h3>Count: {count}</h3>
      </div>
      <div className="counter-buttons">
        <button onClick={() => dispatch(increment())}>
          +1
        </button>
        <button onClick={() => dispatch(decrement())}>
          -1
        </button>
        <button onClick={() => dispatch(incrementByAmount(5))}>
          +5
        </button>
        <button onClick={() => dispatch(reset())}>
          Reset
        </button>
      </div>
      <div className="counter-history">
        <h4>History:</h4>
        <button onClick={() => dispatch(clearHistory())}>
          Clear History
        </button>
        <ul>
          {history.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Counter;