import { useCallback, useRef, useEffect } from 'react';

export function useEventCallback(fn) {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args) => {
    const fn = ref.current;
    return fn(...args);
  }, []);
}
