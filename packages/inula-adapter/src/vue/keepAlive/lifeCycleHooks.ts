import { useContext, useRef, useEffect } from 'openinula';
import { NodeKeeperLifeCycleContext } from './context';

export enum KEEP_ALIVE_LIFECYCLE {
  ACTIVATE = 'componentDidActivate',
  UNACTIVATE = 'componentWillUnactivate',
}

export type LifeCycleFunc = () => unknown;
const useActivation = (lifeCycleName: KEEP_ALIVE_LIFECYCLE, func: LifeCycleFunc) => {
  const keeperCtx = useContext(NodeKeeperLifeCycleContext);

  // 未处于 KeepAlive 中
  if (!keeperCtx) {
    return;
  }

  const preCallback = useRef<LifeCycleFunc>(func);
  useEffect(() => {
    const preIndex = keeperCtx[lifeCycleName].indexOf(preCallback.current);
    if (preIndex >= 0) {
      keeperCtx[lifeCycleName].splice(preIndex, 1, func);
    } else {
      keeperCtx[lifeCycleName].push(func);
    }
    preCallback.current = func;
  }, [func]);
};

export const useActivatePro = useActivation.bind(null, KEEP_ALIVE_LIFECYCLE.ACTIVATE);

export const useUnActivatePro = useActivation.bind(null, KEEP_ALIVE_LIFECYCLE.UNACTIVATE);

export type LifeCycleListener = Record<KEEP_ALIVE_LIFECYCLE, Array<LifeCycleFunc>>;
