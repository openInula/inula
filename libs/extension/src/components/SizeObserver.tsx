import { useEffect, useState, useRef } from 'horizon';
import { addResizeListener, removeResizeListener } from './ResizeEvent';


export function SizeObserver(props) {
  const { children, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>();
  const [size, setSize] = useState<{width: number, height: number}>();
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