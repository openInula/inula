function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>邮箱：{user.email}</p>
    </div>
  );
}

function UserList({ users }) {
  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id ?? user.email ?? user.name} user={user} />
      ))}
    </div>
  );
}


