import { Tooltip } from './tooltip';

export function Option({ id, key, value, label }) {
  // return <p>this should be input</p>;
  return (
    <div key={key} value={value} id={id}>
      {label}
    </div>
  );
}

function isChildOf(parent, child) {
  let target = child;
  while (target) {
    if (target.parentNode === parent) return true;

    target = target.parentNode;
  }
  return false;
}

export function Select(props) {
  const [visible, setVisible] = window.horizon.useState(false);

  const tooltipRef = window.horizon.useRef();
  const referenceRef = window.horizon.useRef();

  const onChange = props['onUpdate:modelValue'];

  window.horizon.useEffect(() => {
    let listener;
    if (visible) {
      listener = document.body.addEventListener('click', e => {
        if (!isChildOf(tooltipRef.current, e.target) && !isChildOf(referenceRef.current, e.target)) {
          setVisible(false);
        }
      });
    }

    return () => {
      if (listener) document.body.removeEventListener(listener);
    };
  });

  const referenceIdRef = window.horizon.useRef(`Select${Date.now() + Math.random()}`.replace('.', '-'));

  return (
    <div ref={referenceRef}>
      <div
        id={referenceIdRef.current}
        onClick={() => setVisible(!visible)}
        style={{
          border: '1px solid rgb(72, 87, 106)',
          padding: '5px 10px',
          display: 'inline-block',
        }}
      >
        {(props.children?.length && props.children.find(child => child.props.value === props.modelValue)) ||
          '<no options>'}
      </div>
      {props.children?.length ? (
        <Tooltip position={props.position || 'bottom'} visible={visible} referenceId={referenceIdRef.current}>
          <div ref={tooltipRef}>
            {props.children.map(child => {
              return (
                <div
                  onClick={() => {
                    setVisible(false);
                    if (child.props.value !== props.modelValue) {
                      onChange(child.props.value);
                    }
                  }}
                >
                  {child}
                </div>
              );
            })}
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}
