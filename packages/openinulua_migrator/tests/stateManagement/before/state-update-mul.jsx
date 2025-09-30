import { useState } from "react";

function UserForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    age: 0,
  });

  function resetForm() {
    // 一次性更新多个字段
    setFormData({
      username: "",
      email: "",
      age: 0,
    });
  }

  function updateField(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value, // 更新单个字段
    }));
  }

  return (
    <form>
      <input
        value={formData.username}
        onChange={e => updateField("username", e.target.value)}
      />
      <input
        value={formData.email}
        onChange={e => updateField("email", e.target.value)}
      />
      <input
        type="number"
        value={formData.age}
        onChange={e => updateField("age", parseInt(e.target.value))}
      />
      <button type="button" onClick={resetForm}>
        重置
      </button>
    </form>
  );
}

export default UserForm;
