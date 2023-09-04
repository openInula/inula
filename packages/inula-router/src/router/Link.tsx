import * as React from 'react';
import { useContext } from 'react';
import RouterContext from './context';
import { Location } from './index';
import { createPath, parsePath } from '../history/utils';
import { Path } from '../history/types';

export type LinkProps = {
  component?: React.ComponentType<any>;
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  replace?: boolean;
  tag?: string;
  /**
   * @deprecated
   * React16以后不再需要该属性
   **/
  innerRef?: React.Ref<HTMLAnchorElement>;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const isModifiedEvent = (event: React.MouseEvent) => {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};

const checkTarget = (target?: React.HTMLAttributeAnchorTarget) => {
  return !target || target === '_self';
};


function Link<P extends LinkProps>(props: P) {
  const { to, replace, component, onClick, target, ...other } = props;

  const tag = props.tag || 'a';

  const context = useContext(RouterContext);
  const history = context.history;

  let location = typeof to === 'function' ? to(context.location) : to;

  let state: any;
  let path: Partial<Path>;
  if (typeof location === 'string') {
    path = parsePath(location);
  } else {
    const { pathname, hash, search } = location;
    path = { pathname, hash, search };
    state = location.state;
  }
  const href = history.createHref(path);

  const linkClickEvent = (event: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      if (onClick) {
        onClick(event);
      }
    } catch (e) {
      event.preventDefault();
      throw e;
    }

    if (!event.defaultPrevented && event.button === 0 && checkTarget(target) && !isModifiedEvent(event)) {
      // 不是相同的路径执行push操作，是相同的路径执行replace
      const isSamePath = createPath(context.location) === createPath(path);
      const navigate = replace || isSamePath ? history.replace : history.push;
      event.preventDefault();
      navigate(path, state);
    }
  };

  const linkProps = { href: href, onClick: linkClickEvent, ...other };
  return React.createElement(tag, linkProps);
}

export default Link;