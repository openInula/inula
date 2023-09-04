import * as React from 'react';
import { History, Location } from './index';
import { Matched, matchPath } from './matcher/parser';
import { useContext, Children, createElement } from 'react';
import RouterContext from './context';
import { GetURLParams } from './matcher/types';

export type RouteComponentProps<P extends Record<string, any> = {}, S = unknown> = RouteChildrenProps<P, S>;

export type RouteChildrenProps<P extends Record<string, any> = {}, S = unknown> = {
  history: History<S>;
  location: Location<S>;
  match: Matched<P> | null
}

export type RouteProps<P extends Record<string, any> = {}, Path extends string = string> = {
  location?: Location;
  component?: React.ComponentType<RouteComponentProps<P>> | React.ComponentType<any> | undefined;
  children?: ((props: RouteChildrenProps<P>) => React.ReactNode) | React.ReactNode;
  render?: (props: RouteComponentProps<P>) => React.ReactNode;
  path?: Path | Path[];
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;
  computed?: Matched<P>;
};

function Route<Path extends string, P extends Record<string, any> = GetURLParams<Path>>(props: RouteProps<P, Path>) {
  const context = useContext(RouterContext);

  const { computed, location, path } = props;
  let { children, component, render } = props;
  let match: Matched<P> | null;

  const routeLocation = location || context.location;
  if (computed) {
    match = computed;
  } else if (path) {
    match = matchPath<P>(routeLocation.pathname, path);
  } else {
    match = context.match;
  }
  const newProps = { ...context, location: routeLocation, match: match };

  if (Array.isArray(children) && Children.count(children) === 0) {
    children = null;
  }

  /**
   * 按顺序获取需要渲染的组件
   * 1.children
   * 2.component
   * 3.render
   * 都没有匹配到返回Null
   */
  const getChildren = (): React.ReactNode | null => {
    // 如果 match 存在
    if (newProps.match) {
      if (children) {
        if (typeof children === 'function') {
          return children(newProps);
        }
        return children;
      }

      if (component) {
        return createElement(component, newProps);
      } else if (render) {
        return render(newProps);
      } else {
        return null;
      }
    } else {
      // match为null
      if (typeof children === 'function') {
        return children(newProps);
      }
      return null;
    }
  };

  return <RouterContext.Provider value={newProps}>{getChildren()}</RouterContext.Provider>;
}

export default Route;
