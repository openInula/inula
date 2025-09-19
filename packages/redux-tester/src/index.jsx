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

import Inula from 'openinula';
import { Provider } from 'react-redux';
import { store } from './store';
import Counter from './components/Counter';
import TodoList from './components/TodoList';
import ReduxCompatibilityTest from './components/ReduxCompatibilityTest';
import ComprehensiveCompatibilityTest from './tests/CompatibilityTests';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <div className="app-container">
        <header className="app-header">
          <h1>OpenInula + React-Redux 9.0.0 Compatibility Test</h1>
          <p>Testing openInula framework compatibility with react-redux</p>
        </header>
        
        <main className="app-main">
          <div className="test-grid">
            <div className="test-panel">
              <Counter />
            </div>
            
            <div className="test-panel">
              <TodoList />
            </div>
            
            <div className="test-panel full-width">
              <ReduxCompatibilityTest />
            </div>
            
            <div className="test-panel full-width">
              <ComprehensiveCompatibilityTest />
            </div>
          </div>
        </main>
        
        <footer className="app-footer">
          <p>
            OpenInula framework with react-redux@9.0.0 compatibility test
          </p>
        </footer>
      </div>
    </Provider>
  );
}

Inula.render(<App />, document.getElementById('root'));
