import { useLayoutEffect, useRef } from 'openinula';

export type LifeCycleProps = {
  onMount?: () => void;
  onUpdate?: (prevProps?: LifeCycleProps) => void;
  onUnmount?: () => void;
  data?: any;
};

export function LifeCycle(props: LifeCycleProps) {
  // 使用ref保存上一次的props，防止重新渲染
  const prevProps = useRef<LifeCycleProps | null>(null);
  const isMount = useRef(false);

  const { onMount, onUpdate, onUnmount } = props;

  useLayoutEffect(() => {
    // 首次挂载 模拟componentDidMount
    if (!isMount.current) {
      isMount.current = true;
      if (onMount) {
        onMount();
      }
    } else {
      // 不是首次渲染 模拟componentDidUpdate
      if (onUpdate) {
        prevProps.current ? onUpdate(prevProps.current) : onUpdate();
      }
    }
    prevProps.current = props;
  });

  // 模拟componentWillUnmount
  useLayoutEffect(() => {
    return () => {
      if (onUnmount) {
        onUnmount();
      }
    };
  }, []);

  return null;
}
