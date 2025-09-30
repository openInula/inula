function SortedUserList() {
  const users = [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', age: 30 },
    { id: 3, name: '王五', age: 28 }
  ];
  
  const sortedUsers = [...users].sort((a, b) => a.age - b.age);
  
  return (
    <ul>
      <for each={sortedUsers}>
        {(user) => (
          <li>{user.name}({user.age}岁)</li>
        )}
      </for>
    </ul>
  );
}


