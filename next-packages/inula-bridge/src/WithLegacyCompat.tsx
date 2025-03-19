import { createElement, memo, useEffect, useRef, useCallback } from 'openinula';
import { render, Component } from '@openinula/next';

function useEventCallback(fn: (...args: any[]) => void) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: any[]) => ref.current(...args), [ref]);
}

function isJSXElement(element: any): boolean {
  return typeof element === 'object' && 'type' in element && 'props' in element;
}

/**
 * Wrapper for next component to be used in legacy component
 * @param component
 * @returns
 */
export default function withLegacyCompat(component: Component) {
  function LegacyComponent(props) {
    if (props.children && isJSXElement(props.children)) {
      throw new Error('JSX children is not allowed in hybrid component');
    }
    const compNode = useRef(null);

    // use stale callback to avoid being called in every update
    const refCallback = useEventCallback((container: HTMLDivElement) => {
      if (container) {
        compNode.current = component(props);
        render(compNode.current, container);
      } else {
        // unmount the component
        console.log('container is null');
      }
    });

    if (compNode.current) {
      compNode.current.owner = {
        dirtyBits: 1,
      };
      for (const prop in props) {
        compNode.current.updateProp(prop, () => props[prop], [props[prop]], 1);
      }
    }

    return createElement('div', { ref: refCallback, key: 'next-wrapper' }, '');
  }

  return LegacyComponent;
}
