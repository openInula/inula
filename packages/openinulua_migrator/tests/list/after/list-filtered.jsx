function ActiveUserList() {
  const users = [
    { id: 1, name: '张三', active: true },
    { id: 2, name: '李四', active: false },
    { id: 3, name: '王五', active: true }
  ];
  
  const activeUsers = users.filter(user => user.active);
  
  return (
    <ul>
      <for each={activeUsers}>
        {(user) => <li>{user.name}</li>}
      </for>
    </ul>
  );
}


