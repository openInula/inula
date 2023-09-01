import * as React from 'react';
import { useContext } from 'react';
import RouterContext from './context';
import { LifeCycle, LifeCycleProps } from './lifeCycleHook';
import { Matched, createPathParser } from './matcher/parser';
import { addHeadSlash, isLocationEqual, parsePath } from '../history/utils';
import { Location } from './index';

export type RedirectProps = {
  to: string | Partial<Location>;
  push?: boolean;
  path?: string;
  from?: string;
  exact?: boolean;
  strict?: boolean;

  // 由Switch计算得到
  readonly computed?: Matched | null;
};

function Redirect<P extends RedirectProps>(props: P) {
  const { to, push = false, computed } = props;

  const context = useContext(RouterContext);
  const { history } = context;

  const calcLocation = (): Partial<Location> => {
    if (computed) {
      if (typeof to === 'string') {
        const parser = createPathParser(to);
        const target = parser.compile(computed.params);
        return parsePath(target);
      } else {
        const pathname = to.pathname ? addHeadSlash(to.pathname) : '/';
        const parser = createPathParser(pathname);
        const target = parser.compile(computed.params);
        return { ...to, pathname: target };
      }
    }
    return typeof to === 'string' ? parsePath(to) : to;
  };

  const navigate = push ? history.push : history.replace;
  const { state, ...path } = calcLocation();

  const onMountFunc = () => {
    navigate(path, state);
  };

  const onUpdateFunc = (prevProps?: LifeCycleProps) => {
    // 如果当前页面与重定向前页面不一致，执行跳转
    const prevPath = prevProps?.data as Location;
    if (!isLocationEqual(prevPath, path)) {
      navigate(path, state);
    }
  };

  return <LifeCycle onMount={onMountFunc} onUpdate={onUpdateFunc} data={path} />;
}

export default Redirect;
