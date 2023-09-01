import * as React from 'react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { History, Location } from '../history/types';

import RouterContext, { RouterContextValue } from './context';

export type RouterProps = {
  history: History;
  children?: React.ReactNode;
};

function Router<P extends RouterProps>(props: P) {
  const { history, children = null } = props;
  const [location, setLocation] = useState(props.history.location);
  const pendingLocation = useRef<Location | null>(null);

  // 在Router加载时就监听history地址变化，以保证在始渲染时重定向能正确触发
  const unListen = useRef<null | (() => void)>(
    history.listen(arg => {
      pendingLocation.current = arg.location;
    }),
  );

  // 模拟componentDidMount和componentWillUnmount
  useLayoutEffect(() => {
    if (unListen.current) {
      unListen.current();
    }
    // 监听history中的位置变化
    unListen.current = history.listen(arg => {
      setLocation(arg.location);
    });

    if (pendingLocation.current) {
      setLocation(pendingLocation.current);
    }

    return () => {
      if (unListen.current) {
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
