export function Tabs({ children, modelValue, id, ...props }) {
  const onUpdate = props['onUpdate:modelValue'];
  const onTabChange = props['onTab-change'];
  let activeChildren = null;
  return (
    <div className="el-tabs el-tabs--top el-tabs--card" id={id}>
      {children.map(child => {
        const active = modelValue === child.props.name;
        child.props.modelValue = modelValue;
        child.props.onClick = name => {
          if (name === modelValue) return;
          onUpdate(name);
          onTabChange();
        };
        if (active) {
          activeChildren = child.props.children;
        }
        return child;
      })}
      <div
        className="el-tabs__content"
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          id="pane-released"
          className="el-tab-pane"
          role="tabpanel"
          aria-hidden="false"
          aria-labelledby="tab-released"
        >
          {activeChildren}
        </div>
      </div>
    </div>
  );
}

export function TabPane({ name, label, children, modelValue, onClick }) {
  let labelTemplate;
  const filteredChildren = (Array.isArray(children) ? children : children ? [children] : []).filter(child => {
    if (child.props.name !== 'label') return true;
    labelTemplate = child.props.is?.();
  });
  return (
    <div
      className={{
        'el-tabs__item': true,
        'is-top': true,
        isActive: name === modelValue,
      }}
      onClick={() => onClick(name)}
      role="tablist"
      id={name}
    >
      {labelTemplate || label}
      {/* {name === modelValue ? filteredChildren : null} */}
    </div>
  );
}
