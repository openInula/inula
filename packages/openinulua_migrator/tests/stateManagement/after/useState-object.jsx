function UserProfile() {
  let user = {
    name: '张三',
    age: 25,
    preferences: {
      theme: 'dark',
      language: 'zh'
    }
  };
  
  function updateTheme(newTheme) {
    user.preferences.theme = newTheme;
  }
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>年龄：{user.age}</p>
      <div>
        主题：{user.preferences.theme}
        <button onClick={() => updateTheme('light')}>
          切换主题
        </button>
      </div>
    </div>
  );
}