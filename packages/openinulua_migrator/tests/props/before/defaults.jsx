function UserProfile({ name = '匿名', age = 0 }) {
  return (
    <div>
      <p>姓名：{name}</p>
      <p>年龄：{age}</p>
    </div>
  );
}


