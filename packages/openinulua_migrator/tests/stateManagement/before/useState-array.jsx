import React, { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 OpenInula', done: false },
    { id: 2, text: '写文档', done: false }
  ]);

  function addTodo(text) {
    setTodos(prevTodos => [
      ...prevTodos,
      {
        id: prevTodos.length + 1,
        text,
        done: false
      }
    ]);
  }

  function toggleTodo(id) {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done }
          : todo
      )
    );
  }

  return (
    <div>
      <button onClick={() => addTodo('新任务')}>
        添加任务
      </button>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{
              textDecoration: todo.done ? 'line-through' : 'none',
              cursor: 'pointer'
            }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
