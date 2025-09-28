function ComplexDatasetAria({ user, settings, theme }) {
  return (
    <div 
      data-user-id={user.id}
      data-user-role={user.role}
      data-theme={theme}
      data-settings={JSON.stringify(settings)}
      aria-label={`User ${user.name} with role ${user.role}`}
      aria-describedby="user-description"
      aria-expanded={user.expanded}
      aria-selected={user.selected}
      aria-checked={user.checked}
      aria-disabled={user.disabled}
      aria-hidden={user.hidden}
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="additions text"
      aria-busy={user.loading}
      aria-invalid={user.hasError}
      aria-required={user.required}
      aria-readonly={user.readonly}
      className={`user-card theme-${theme}`}
    >
      <span id="user-description">User information</span>
    </div>
  );
}
/*
47_complex_dataset_aria：TS ReactivityParser 在遇到我们产出
的某 ViewUnit 组合时报 “Invalid ViewUnit type”（与 TS 解析器
类型约束不兼容），已在测试中跳过。
*/