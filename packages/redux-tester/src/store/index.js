import { configureStore, createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    history: []
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
      state.history.push(`Incremented to ${state.value}`);
    },
    decrement: (state) => {
      state.value -= 1;
      state.history.push(`Decremented to ${state.value}`);
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      state.history.push(`Incremented by ${action.payload} to ${state.value}`);
    },
    reset: (state) => {
      state.value = 0;
      state.history.push('Reset to 0');
    },
    clearHistory: (state) => {
      state.history = [];
    }
  }
});

const todoSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    filter: 'all'
  },
  reducers: {
    addTodo: (state, action) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    removeTodo: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount, reset, clearHistory } = counterSlice.actions;
export const { addTodo, toggleTodo, removeTodo, setFilter } = todoSlice.actions;

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todoSlice.reducer
  }
});

export const selectCounter = (state) => state.counter.value;
export const selectCounterHistory = (state) => state.counter.history;
export const selectTodos = (state) => state.todos.items;
export const selectTodosFilter = (state) => state.todos.filter;
export const selectFilteredTodos = (state) => {
  const { items, filter } = state.todos;
  switch (filter) {
    case 'completed':
      return items.filter(todo => todo.completed);
    case 'active':
      return items.filter(todo => !todo.completed);
    default:
      return items;
  }
};