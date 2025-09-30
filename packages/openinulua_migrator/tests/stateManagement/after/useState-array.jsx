function TodoList() {
  let todos = [
    { id: 1, text: '学习 OpenInula', done: false },
    { id: 2, text: '写文档', done: false }
  ];
  
  function addTodo(text) {
    todos = [
      ...todos,
      {
        id: todos.length + 1,
        text,
        done: false
      }
    ];
  }
  
  function toggleTodo(id) {
    todos = todos.map(todo =>
      todo.id === id
        ? { ...todo, done: !todo.done }
        : todo
    );
  }
  
  return (
    <div>
      <button onClick={() => addTodo('新任务')}>
        添加任务
      </button>
      <ul>
        <for each={todos}>
          {(todo) => (
            <li
              onClick={() => toggleTodo(todo.id)}
              style={{
                textDecoration: todo.done ? 'line-through' : 'none'
              }}
            >
              {todo.text}
            </li>
          )}
        </for>
      </ul>
    </div>
  );
}