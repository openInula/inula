function ActiveUserList() {
  const users = [
    { id: 1, name: '张三', active: true },
    { id: 2, name: '李四', active: false },
    { id: 3, name: '王五', active: true }
  ];
  
  const activeUsers = users.filter(user => user.active);
  
  return (
    <ul>
      {activeUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}


