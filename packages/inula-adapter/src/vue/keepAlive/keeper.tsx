import React, { useRef, useEffect } from '@cloudsop/horizon';
import { NodeKeeperLifeCycleContext } from './context';
import { KEEP_ALIVE_LIFECYCLE, LifeCycleFunc } from './lifeCycleHooks';

interface KeeperProps {
  active: boolean;
  key?: any;
  children?: any;
}
const Keeper = ({ children, active }: KeeperProps) => {
  const wrapper = useRef<HTMLElement>(null);
  const childrenNode = useRef<Element[]>([]);
  const nodeKeeperLifeCycleValue = useRef({
    [KEEP_ALIVE_LIFECYCLE.ACTIVATE]: [] as LifeCycleFunc[],
    [KEEP_ALIVE_LIFECYCLE.UNACTIVATE]: [] as LifeCycleFunc[],
  });

  useEffect(() => {
    return () => {
      childrenNode.current.forEach(child => {
        child.remove();
      });
      nodeKeeperLifeCycleValue.current[KEEP_ALIVE_LIFECYCLE.UNACTIVATE].forEach(callback => {
        callback();
      });
    };
  }, []);

  useEffect(() => {
    if (active) {
      childrenNode.current = Array.from(wrapper.current?.children || []);
      childrenNode.current.forEach(child => {
        wrapper.current?.parentElement?.insertBefore(child, wrapper.current);
      });
      nodeKeeperLifeCycleValue.current[KEEP_ALIVE_LIFECYCLE.ACTIVATE].forEach(callback => {
        callback();
      });
    } else {
      childrenNode.current.forEach(child => {
        wrapper.current?.appendChild(child);
      });
      nodeKeeperLifeCycleValue.current[KEEP_ALIVE_LIFECYCLE.UNACTIVATE].forEach(callback => {
        callback();
      });
    }
  }, [active]);

  return (
    <NodeKeeperLifeCycleContext.Provider value={nodeKeeperLifeCycleValue.current}>
      {
        <div style={{ display: 'none' }} ref={wrapper}>
          {children}
        </div>
      }
    </NodeKeeperLifeCycleContext.Provider>
  );
};

export default Keeper;
