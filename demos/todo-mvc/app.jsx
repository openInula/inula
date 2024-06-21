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
import { render } from '@openinula/next';
import { Header } from './components/header';
import { Main } from './components/main';
import {
  ADD_ITEM,
  UPDATE_ITEM,
  REMOVE_ITEM,
  TOGGLE_ITEM,
  REMOVE_ALL_ITEMS,
  TOGGLE_ALL,
  REMOVE_COMPLETED_ITEMS,
} from './constants';
import './app.css';
import { Footer } from './components/footer.jsx';
// This alphabet uses `A-Za-z0-9_-` symbols.
// The order of characters is optimized for better gzip and brotli compression.
// References to the same file (works both for gzip and brotli):
// `'use`, `andom`, and `rict'`
// References to the brotli default dictionary:
// `-26T`, `1983`, `40px`, `75px`, `bush`, `jack`, `mind`, `very`, and `wolf`
let urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

function nanoid(size = 21) {
  let id = '';
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size;
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id;
}

export function App() {
  let todos = [];
  const todoReducer = (state, action) => {
    switch (action.type) {
      case ADD_ITEM:
        return state.concat({ id: nanoid(), title: action.payload.title, completed: false });
      case UPDATE_ITEM:
        return state.map(todo => (todo.id === action.payload.id ? { ...todo, title: action.payload.title } : todo));
      case REMOVE_ITEM:
        return state.filter(todo => todo.id !== action.payload.id);
      case TOGGLE_ITEM:
        return state.map(todo => (todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo));
      case REMOVE_ALL_ITEMS:
        return [];
      case TOGGLE_ALL:
        return state.map(todo =>
          todo.completed !== action.payload.completed
            ? {
                ...todo,
                completed: action.payload.completed,
              }
            : todo
        );
      case REMOVE_COMPLETED_ITEMS:
        return state.filter(todo => !todo.completed);
    }

    throw Error(`Unknown action: ${action.type}`);
  };
  const dispatch = action => {
    todos = todoReducer(todos, action);
  };

  return (
    <>
      <Header dispatch={dispatch} />
      <Main todos={todos} dispatch={dispatch} />
      <Footer todos={todos} dispatch={dispatch} />
    </>
  );
}

render(App, 'main');
