function UserForm() {
  let formData = {
    username: '',
    email: '',
    age: 0
  };
  
  function resetForm() {
    // 一次性更新多个字段
    formData = {
      username: '',
      email: '',
      age: 0
    };
  }
  
  function updateField(field, value) {
    formData[field] = value;  // 更新单个字段
  }
  
  return (
    <form>
      <input
        value={formData.username}
        onInput={e => updateField('username', e.target.value)}
      />
      <input
        value={formData.email}
        onInput={e => updateField('email', e.target.value)}
      />
      <input
        type="number"
        value={formData.age}
        onInput={e => updateField('age', parseInt(e.target.value))}
      />
      <button type="button" onClick={resetForm}>
        重置
      </button>
    </form>
  );
}