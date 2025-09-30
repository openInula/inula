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
      <for each={users}>
        {(user) => <UserCard user={user} />}
      </for>
    </div>
  );
}


