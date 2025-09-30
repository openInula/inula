function LoginStatus({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button onClick={() => {/* logout */}}>退出登录</button>
      ) : (
        <button onClick={() => {/* login */}}>登录</button>
      )}
    </div>
  );
}


