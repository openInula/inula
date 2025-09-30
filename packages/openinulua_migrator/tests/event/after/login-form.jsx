function LoginForm() {
  let username = '';
  let password = '';
  
  function handleSubmit(e) {
    e.preventDefault();
    console.log('提交登录:', { username, password });
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onInput={e => username = e.target.value}
        placeholder="用户名"
      />
      <input
        type="password"
        value={password}
        onInput={e => password = e.target.value}
        placeholder="密码"
      />
      <button type="submit">登录</button>
    </form>
  );
}


