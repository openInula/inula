export function Tooltip(props) {
  // const content = props.children.find(child => {
  //   return child.type === 'template' && child.props.name === 'content';
  // })?.props?.children;
  function getReference() {
    return props.customReferenceId ? props.customReferenceId : props.referenceId;
  }

  return (
    <div>
      {
        props.visible
          ? window.horizon.createPortal(
              <Overlay
                position={props.position}
                popperClass={props.popperClass}
                getReference={getReference}
                onMouseOver={props.onMouseOver}
                onMouseOut={props.onMouseOut}
                id={props.id ? props.id + 'Overlay' : ''}
              >
                {props.children}
              </Overlay>,
              document.body
            )
          : null
        // <Tooltip className={props.class} effect={props.effect} content={content} placement={props.placement}>
        //   {props.children.filter(child => child !== content)}
        // </Tooltip>
      }
    </div>
  );
}

function getOffsetPosition(element) {
  if (!element)
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    right: rect.left + element.offsetWidth,
    bottom: rect.top + element.offsetHeight,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

const invisibleStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px',
  opacity: 0,
  display: 'block',
  zIndex: 0,
};

function Overlay(props) {
  const [b, r] = window.horizon.useState('invisible');
  const selfRef = window.horizon.useRef(null);
  const countRef = window.horizon.useRef(0);
  let style = window.horizon.useRef(invisibleStyle);
  window.horizon.useRenderEffect(() => {
    if (b === props.position) return;
    function tryDisplayTooltip() {
      const referenceElement = document.getElementById(props.getReference());
      const selfElement = selfRef.current;
      if (!referenceElement || !selfElement) {
        countRef.current++;
        if (countRef.current > 10) return;
        setTimeout(tryDisplayTooltip, 10);
        style.current = invisibleStyle;
        r('invisible');
        return;
      }
      const offset = getOffsetPosition(referenceElement);

      if (props.position === 'right') {
        style.current = {
          position: 'absolute',
          top: offset.top + (offset.height - selfRef.current.offsetHeight) / 2,
          left: offset.right,
          zIndex: 10000,
          color: 'white',
        };
        r('right');
      } else if (props.position === 'left') {
        style.current = {
          position: 'absolute',
          top: offset.top + (offset.height - selfRef.current.offsetHeight) / 2,
          left: offset.left - selfRef.current.offsetWidth,
          zIndex: 10000,
          color: 'white',
        };
        r('left');
      } else if (props.position === 'top') {
        style.current = {
          position: 'absolute',
          top: offset.top - selfRef.current.offsetHeight,
          left: offset.left + (offset.width - selfRef.current.offsetWidth) / 2,
          zIndex: 10000,
          color: 'white',
        };
        r('top');
      } else if (props.position === 'bottomLeft') {
        style.current = {
          position: 'absolute',
          top: offset.bottom,
          left: offset.left,
          zIndex: 9999,
          color: 'white',
        };
        r('bottomLeft');
      } else if (props.position === 'bottomRight') {
        style.current = {
          position: 'absolute',
          top: offset.bottom,
          left: offset.left + offset.width - selfRef.current.offsetWidth,
          zIndex: 10000,
          color: 'white',
        };
        r('bottomLeft');
      } else {
        style.current = {
          position: 'absolute',
          top: offset.bottom,
          left: offset.left + (offset.width - selfRef.current.offsetWidth) / 2,
          zIndex: 10000,
          color: 'white',
        };
        r('bottom');
      }
    }
    setTimeout(() => {
      countRef.current = 0;
      tryDisplayTooltip();
    }, 10);
  });

  return (
    <div
      ref={selfRef}
      style={style.current}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
      className={props.popperClass}
      id={props.id}
    >
      <div
        style={{
          padding: '10px',
          border: '1px solid white',
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
