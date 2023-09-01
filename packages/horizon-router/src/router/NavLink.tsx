import * as React from 'react';
import { useContext } from 'react';
import type { LinkProps } from './Link';
import Link from './Link';
import { Location, matchPath } from './index';
import { Matched } from './matcher/parser';
import Context from './context';
import { parsePath } from '../history/utils';
import { escapeStr } from './matcher/utils';

type NavLinkProps = {
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  isActive?: (match: Matched | null, location: Location) => boolean;
  // compat react-router NavLink props type
  [key: string]: any;
} & LinkProps;

type Page = 'page';

function NavLink<P extends NavLinkProps>(props: P) {
  const { to, isActive, ...rest } = props;
  const context = useContext(Context);

  const toLocation = typeof to === 'function' ? to(context.location) : to;

  const { pathname: path } = typeof toLocation === 'string' ? parsePath(toLocation) : toLocation;
  // 把正则表达式的特殊符号加两个反斜杠进行转义
  const escapedPath = path ? escapeStr(path) : '';
  const match = escapedPath ? matchPath(context.location.pathname, escapedPath) : null;

  const isLinkActive = match && isActive ? isActive(match, context.location) : false;

  const page: Page = 'page';
  const otherProps = {
    'aria-current': isLinkActive ? page : false,
    ...rest,
  };

  return <Link to={to} {...otherProps} />;
}

export default NavLink;
