import { Tooltip } from './tooltip';

export function Dropdown(props) {
  const [visible, setVisible] = window.horizon.useState(false);

  const tooltipRef = window.horizon.useRef();
  const referenceRef = window.horizon.useRef();

  const content = props.children.filter(child => child.vtype !== 12);
  const drop = props.children.find(child => child.vtype === 12 && child.props.name === 'dropdown');
  let children = drop.props.children();
  if (!children) {
    children = [];
  }
  if (!Array.isArray(children)) {
    children = [children];
  }
  const referenceIdRef = window.horizon.useRef(`Dropdown${Date.now() + Math.random()}`.replace('.', '-'));
  const enhancedClassName = Array.isArray(props.classname)
    ? props.className.concat('el-dropdown')
    : typeof props.className === 'object'
      ? { ...props.className, 'el-dropdown': true }
      : props.className
        ? [props.className, 'el-dropdown']
        : 'el-dropdown';
  return (
    <div ref={referenceRef} className={enhancedClassName}>
      <div
        id={referenceIdRef.current}
        onClick={() => setVisible(!visible)}
        style={{
          border: '1px solid rgb(72, 87, 106)',
          padding: '5px 10px',
          display: 'inline-block',
        }}
        class="dropdown-text"
      >
        {content}
      </div>
      {children ? (
        <Tooltip position={props.position || 'bottom'} visible={visible} referenceId={referenceIdRef.current}>
          <div ref={tooltipRef}>
            {children.map(child => window.horizon.cloneElement(child, { onCommand: props.onCommand }))}
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function DropdownMenu({ id, children, onCommand }) {
  if (!children) {
    children = [];
  }
  if (!Array.isArray(children)) {
    children = [children];
  }
  return (
    <div id={id}>
      {children.map(child => {
        return window.horizon.cloneElement(child, { onCommand });
      })}
    </div>
  );
}

export function DropdownItem({ id, children, disabled, command, onCommand }) {
  return disabled ? (
    <div id={id} style={{ opacity: 0.5 }}>
      {children}
    </div>
  ) : (
    <div
      id={id}
      onClick={() => {
        onCommand(command);
      }}
    >
      {children}
    </div>
  );
}
