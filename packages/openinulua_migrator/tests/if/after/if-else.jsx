function LoginStatus({ isLoggedIn }) {
  return (
    <div>
      <if cond={isLoggedIn}>
        <button onClick={() => {/* logout */}}>退出登录</button>
      </if>
      <else>
        <button onClick={() => {/* login */}}>登录</button>
      </else>
    </div>
  );
}


