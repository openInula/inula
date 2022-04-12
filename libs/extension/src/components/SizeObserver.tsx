import { useEffect, useState, useRef } from 'horizon';
import { addResizeListener, removeResizeListener } from './ResizeEvent';


export function SizeObserver(props) {
  const { children, ...rest } = props;
  const containerRef = useRef();
  const [size, setSize] = useState();
  const notifyChild = (element) => {
    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  };
  useEffect(() => {
    const element = containerRef.current;
    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
    addResizeListener(element, notifyChild);
    return () => {
      removeResizeListener(element, notifyChild);
    };
  }, []);
  const myChild = size ? children(size.width, size.height) : null;

  return (
    <div ref={containerRef} {...rest}>
      {myChild}
    </div>
  );
}