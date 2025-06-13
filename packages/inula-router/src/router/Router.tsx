import Inula from '@cloudsop/horizon';
import { useLayoutEffect, useMemo, useRef, useState, InulaNode } from '@cloudsop/horizon';

import { History, Location } from '../history/types';

import RouterContext, { RouterContextValue } from './context';

export type RouterProps = {
  history: History;
  children?: InulaNode;
};

function Router<P extends RouterProps>(props: P) {
  const { history, children = null } = props;
  const [location, setLocation] = useState(props.history.location);
  const pendingLocation = useRef<Location | null>(null);
  const unListen = useRef<null | (() => void)>(null);
  const isMount = useRef<boolean>(false);

  // 在Router加载时就监听history地址变化，以保证在始渲染时重定向能正确触发
  if (unListen.current === null)
    unListen.current = history.listen(arg => {
      pendingLocation.current = arg.location;
    });

  // 模拟componentDidMount和componentWillUnmount
  useLayoutEffect(() => {
    isMount.current = true;
    if (unListen.current) {
      unListen.current();
    }
    // 监听history中的位置变化
    unListen.current = history.listen(arg => {
      if (isMount.current) {
        setLocation(arg.location);
      }
    });

    if (pendingLocation.current) {
      setLocation(pendingLocation.current);
    }

    return () => {
      if (unListen.current) {
        isMount.current = false;
        unListen.current();
        unListen.current = null;
        pendingLocation.current = null;
      }
    };
  }, []);

  const initContextValue: RouterContextValue = useMemo(
    () => ({
      history: history,
      location: location,
      match: { isExact: location.pathname === '/', params: {}, path: '/', score: [], url: '/' },
    }),
    [location],
  );

  return <RouterContext.Provider value={initContextValue} children={children} />;
}

export default Router;
