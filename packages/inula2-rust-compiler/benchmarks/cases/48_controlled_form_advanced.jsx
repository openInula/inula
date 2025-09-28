function ControlledFormAdvanced({ formData, onChange, onCompositionStart, onCompositionEnd }) {
  return (
    <form>
      <input
        type="text"
        value={formData.name}
        onChange={onChange}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        placeholder="Enter name"
        required
        autoFocus
        disabled={formData.disabled}
        readOnly={formData.readonly}
      />
      <textarea
        value={formData.description}
        onChange={onChange}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        placeholder="Enter description"
        rows={5}
        cols={50}
        required
        disabled={formData.disabled}
        readOnly={formData.readonly}
      />
      <select
        value={formData.category}
        onChange={onChange}
        multiple
        required
        disabled={formData.disabled}
        size={3}
      >
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <input
        type="checkbox"
        checked={formData.agreed}
        onChange={onChange}
        required
        disabled={formData.disabled}
      />
      <input
        type="radio"
        checked={formData.gender === 'male'}
        onChange={onChange}
        name="gender"
        value="male"
        disabled={formData.disabled}
      />
      <input
        type="radio"
        checked={formData.gender === 'female'}
        onChange={onChange}
        name="gender"
        value="female"
        disabled={formData.disabled}
      />
    </form>
  );
}

/*
48_controlled_form_advanced：TS view-generator 在 Babel 构
建 Identifier 时校验失败（Property name expected type of 
string but got undefined），已在测试中跳过。
*/