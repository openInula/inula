export function RadioGroup({ onChange, modelValue, ['onUpdate:modelValue']: onUpdate, children }) {
  const processedChildren = children.map(child => {
    return window.horizon.cloneElement(child, { checkedId: modelValue, onUpdate });
  });

  return <div>{processedChildren}</div>;
}

export function Radio({ label, id, children, onUpdate, checkedId }) {
  return (
    <label
      style={{
        cursor: 'pointer',
        padding: '5px',
      }}
      onClick={() => {
        onUpdate(label);
      }}
    >
      <div
        style={{
          height: '1em',
          width: '1em',
          border: '1px solid currentColor',
          backgroundColor: 'transparent',
          borderRadius: '0.5em',
          display: 'inline-block',
          margin: '0 5px 0 0',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: 'calc(1em - 5px)',
            width: 'calc(1em - 5px)',
            backgroundColor: checkedId === label ? 'currentColor' : 'transparent',
            borderRadius: 'calc(0.5em)',
            padding: '0',
            display: 'inline-block',
            position: 'absolute',
            top: '2px',
            left: '2px',
          }}
        ></div>
      </div>
      <span>{children}</span>
    </label>
  );
}
