function UserProfile({ user }) {
  return (
    <div>
      <if cond={user && user.age >= 18}>
        <h2>成年用户</h2>
      </if>
      <if cond={user?.premium && !user.suspended}>
        <h3>高级会员</h3>
      </if>
    </div>
  );
}


