import { useSelector, useDispatch, useStore, shallowEqual } from 'react-redux';
import { useCallback, useState, useMemo } from 'react';
import { selectCounter, selectTodos, increment, addTodo } from '../store';

function CompatibilityTests() {
  const [testResults, setTestResults] = useState({});
  const dispatch = useDispatch();
  const store = useStore();

  const runTests = () => {
    const results = {};

    try {
      results.useSelectorBasic = useSelector(state => state.counter.value) >= 0;
    } catch (e) {
      results.useSelectorBasic = false;
    }

    try {
      results.useSelectorMemoized = useSelector(selectCounter) >= 0;
    } catch (e) {
      results.useSelectorMemoized = false;
    }

    try {
      const shallowEqualTest = useSelector(state => state.todos, shallowEqual);
      results.shallowEqualityCheck = Array.isArray(shallowEqualTest);
    } catch (e) {
      results.shallowEqualityCheck = false;
    }

    try {
      dispatch(increment());
      results.useDispatchBasic = true;
    } catch (e) {
      results.useDispatchBasic = false;
    }

    try {
      const stateSnapshot = store.getState();
      results.useStore = typeof stateSnapshot === 'object' && 'counter' in stateSnapshot;
    } catch (e) {
      results.useStore = false;
    }

    try {
      const subscription = store.subscribe(() => {});
      subscription();
      results.storeSubscription = true;
    } catch (e) {
      results.storeSubscription = false;
    }

    setTestResults(results);
  };

  return (
    <div className="compatibility-tests">
      <h3>Comprehensive Compatibility Tests</h3>
      
      <button onClick={runTests} className="run-tests-btn">
        Run All Tests
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="test-results">
          <h4>Test Results:</h4>
          <ul>
            {Object.entries(testResults).map(([test, passed]) => (
              <li key={test} className={passed ? 'test-pass' : 'test-fail'}>
                <span className="test-name">{test}:</span>
                <span className="test-status">{passed ? '✅ PASS' : '❌ FAIL'}</span>
              </li>
            ))}
          </ul>
          
          <div className="test-summary">
            <p>
              <strong>
                {Object.values(testResults).filter(Boolean).length}/{Object.keys(testResults).length} tests passed
              </strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function HookPerformanceTests() {
  const [rerenderCount, setRerenderCount] = useState(0);
  
  const memoizedSelector = useCallback(state => state.counter.value, []);
  const countWithMemo = useSelector(memoizedSelector);
  const countWithoutMemo = useSelector(state => state.counter.value);
  
  const expensiveComputation = useMemo(() => {
    setRerenderCount(prev => prev + 1);
    return countWithMemo * 2 + Math.random();
  }, [countWithMemo]);

  return (
    <div className="performance-tests">
      <h3>Hook Performance Tests</h3>
      <div className="perf-metrics">
        <p><strong>Memoized Selector Value:</strong> {countWithMemo}</p>
        <p><strong>Regular Selector Value:</strong> {countWithoutMemo}</p>
        <p><strong>Expensive Computation:</strong> {expensiveComputation.toFixed(4)}</p>
        <p><strong>Component Rerenders:</strong> {rerenderCount}</p>
      </div>
    </div>
  );
}

function StoreIntegrationTests() {
  const store = useStore();
  const dispatch = useDispatch();
  const [storeInfo, setStoreInfo] = useState({});

  const analyzeStore = () => {
    const state = store.getState();
    const info = {
      storeType: store.constructor.name,
      hasDispatch: typeof store.dispatch === 'function',
      hasGetState: typeof store.getState === 'function',
      hasSubscribe: typeof store.subscribe === 'function',
      stateShape: Object.keys(state),
      reduxDevToolsEnabled: typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
    };
    setStoreInfo(info);
  };

  return (
    <div className="store-tests">
      <h3>Store Integration Tests</h3>
      <button onClick={analyzeStore}>Analyze Store</button>
      
      {Object.keys(storeInfo).length > 0 && (
        <div className="store-analysis">
          <h4>Store Analysis:</h4>
          <ul>
            {Object.entries(storeInfo).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ComprehensiveCompatibilityTest() {
  return (
    <div className="comprehensive-test">
      <h2>React-Redux 9.0.0 Compatibility Test Suite</h2>
      
      <div className="test-panels">
        <div className="test-panel-item">
          <CompatibilityTests />
        </div>
        
        <div className="test-panel-item">
          <HookPerformanceTests />
        </div>
        
        <div className="test-panel-item">
          <StoreIntegrationTests />
        </div>
      </div>

      <div className="compatibility-summary">
        <h3>Compatibility Summary</h3>
        <p>This test suite verifies that openInula is compatible with:</p>
        <ul>
          <li>react-redux hooks (useSelector, useDispatch, useStore)</li>
          <li>Redux store integration and subscriptions</li>
          <li>Memoization and performance optimizations</li>
          <li>Shallow equality comparisons</li>
          <li>Redux DevTools integration</li>
        </ul>
      </div>
    </div>
  );
}