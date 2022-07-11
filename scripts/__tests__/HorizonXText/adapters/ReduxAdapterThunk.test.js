import { createStore, applyMiddleware, thunk } from '../../../../libs/horizon/src/horizonx/adapters/redux';

describe('Redux thunk', () => {
  it('should use apply thunk middleware', async () => {
    const MAX_TODOS = 5;

    function addTodosIfAllowed(todoText) {
      return (dispatch, getState) => {
        const state = getState();

        if (state.todos.length < MAX_TODOS) {
          dispatch({ type: 'ADD_TODO', text: todoText });
        }
      };
    }

    const todoStore = createStore(
      (state = { todos: [] }, action) => {
        if (action.type === 'ADD_TODO') {
          return { todos: state.todos?.concat(action.text) };
        }
        return state;
      },
      null,
      applyMiddleware(thunk)
    );

    for (let i = 0; i < 10; i++) {
      todoStore.dispatch(addTodosIfAllowed('todo no.' + i));
    }

    expect(todoStore.getState().todos.length).toBe(5);
  });
});
