import Inula from '@cloudsop/horizon';
import { History, Location } from './index';
import { type Matched, matchPath } from '../matcher/parser';
import { useContext, Children, createElement, InulaNode, ComponentType } from '@cloudsop/horizon';
import RouterContext from './context';
import type { GetURLParams } from '../matcher/types';

export type RouteComponentProps<P extends Record<string, any> = {}, S = unknown> = RouteChildrenProps<P, S>;

export type RouteChildrenProps<P extends Record<string, any> = {}, S = unknown> = {
  history: History<S>;
  location: Location<S>;
  match: Matched<P> | null;
};

export type RouteProps<P extends Record<string, any> = {}, Path extends string = string> = {
  location?: Location;
  component?: ComponentType<RouteComponentProps<P>> | ComponentType<any> | undefined;
  children?: ((props: RouteChildrenProps<P>) => InulaNode) | InulaNode;
  render?: (props: RouteComponentProps<P>) => InulaNode;
  path?: Path | Path[];
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;
  computed?: Matched<P>;
};

function Route<Path extends string, P extends Record<string, any> = GetURLParams<Path>>(props: RouteProps<P, Path>) {
  const context = useContext(RouterContext);

  const { computed, location, path, component, render, strict, sensitive, exact } = props;
  let { children } = props;
  let match: Matched<P> | null;

  const routeLocation = location || context.location;
  if (computed) {
    match = computed;
  } else if (path) {
    match = matchPath<P>(routeLocation.pathname, path, {
      strictMode: strict,
      caseSensitive: sensitive,
      exact: exact,
    });
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
  const getChildren = (): InulaNode | null => {
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
