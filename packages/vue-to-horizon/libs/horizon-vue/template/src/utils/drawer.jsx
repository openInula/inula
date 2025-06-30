const speed = 300;

export function Drawer({ children, modelValue, size, show, onClose, ...props }) {
  if (undefined === show) {
    show = modelValue;
  }
  if (undefined === onClose) {
    onClose = () => {
      props['onUpdate:modelValue'](false);
    };
  }
  if (!Array.isArray(children)) {
    children = children ? [children] : [];
  }
  const contentTemplate = children.filter(child => {
    return child.vtype === 12 && child.props.name === 'default';
  })[0];
  const footerTemplate = children.filter(child => {
    return child.vtype === 12 && child.props.name === 'footer';
  })[0];

  return (
    <div className={'el-drawer'}>
      {show
        ? window.horizon.createPortal(
            <DrawerOverlay content={contentTemplate} footer={footerTemplate} size={size} onClose={onClose} />,
            window.document.body
          )
        : null}
    </div>
  );
}

function DrawerOverlay({ content, footer, size, onClose }) {
  const drawerContentRef = window.horizon.useRef(null);
  content = content.props.is();
  footer = footer?.props.is();
  const close = () => {
    drawerContentRef.current.style.left = '100%';
    setTimeout(() => {
      onClose();
    }, speed);
  };

  setTimeout(() => {
    drawerContentRef.current.style.left = `calc(100% - ${size})`;
  }, 10);

  return (
    <div
      onClick={close}
      style={{
        position: 'absolute',
        display: 'block',
        width: '100%',
        height: '100%',
        left: '0px',
        top: '0px',
        zIndex: '2000',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      className={'el-drawer__header'}
    >
      <div
        style={{
          left: '100%',
          width: size,
          height: '100%',
          transition: `${speed}ms left`,
          backgroundColor: 'rgb(31, 35, 41)',
          position: 'absolute',
          boxShadow: '0px 16px 48px 16px rgba(0, 0, 0, 0.72),0px 12px 32px #000000,0px 8px 16px -8px #000000;',
        }}
        ref={drawerContentRef}
      >
        <div
          style={{
            height: '100%',
            display: 'block',
            position: 'relative',
            padding: '10px',
          }}
        >
          {content}
          {footer ? (
            <div
              className={'el-drawer__footer'}
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                width: 'calc(100% - 20px)',
                textAlign: 'center',
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
