function UserProfile({ user }) {
  return (
    <div>
      {(user && user.age >= 18) && <h2>成年用户</h2>}
      {user?.premium && !user.suspended && <h3>高级会员</h3>}
    </div>
  );
}


