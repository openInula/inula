import * as React from 'react';
import { useContext, Children, isValidElement, cloneElement } from 'react';

import { Location } from './index';
import RouterContext from './context';
import { Matched, matchPath } from './matcher/parser';
import Route, { RouteProps } from './Route';
import Redirect, { RedirectProps } from './Redirect';

export type SwitchProps = {
  location?: Location;
  children?: React.ReactNode;
};

function Switch<P extends SwitchProps>(props: P): React.ReactElement | null {
  const context = useContext(RouterContext);
  const location = props.location || context.location;

  let element: React.ReactElement | null = null;
  let match: Matched | null = null;

  // 使用forEach不会给React.ReactNode增加key属性,防止重新渲染
  Children.forEach(props.children, node => {
    if (match === null && isValidElement(node)) {
      element = node;

      let strict: boolean | undefined;
      let sensitive: boolean | undefined;
      let path: string | string[] | undefined;
      let from: string | undefined;

      // node可能是Route和Redirect
      if (node.type === Route) {
        ({ strict, sensitive, path } = node.props as RouteProps);
      } else if (node.type === Redirect) {
        ({ path, strict, from } = node.props as RedirectProps);
      }

      const exact = node.props.exact;
      const target = path || from;

      // 更新匹配状态，一旦匹配到停止遍历
      if (target) {
        match = matchPath(location.pathname, target, {
          strictMode: strict,
          caseSensitive: sensitive,
          exact: exact,
        });
      } else {
        match = context.match;
      }
    }
  });

  if (match && element) {
    // 使用cloneElement复制已有组件并更新其Props
    return cloneElement(element, { location: location, computed: match });
  }
  return null;
}

export default Switch;
