/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import Inula from 'openinula';
import { useContext } from 'openinula';
import type { LinkProps } from './Link';
import Link from './Link';
import { Location, matchPath } from './index';
import { Matched } from './matcher/parser';
import Context from './context';
import { parsePath } from '../history/utils';

type NavLinkProps = {
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  isActive?<P extends { [K in keyof P]?: string }>(match: Matched<P> | null, location: Location): boolean;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  className?: string | ((isActive: boolean) => string);
  activeClassName?: string;
  [key: string]: any;
} & Omit<LinkProps, 'className'>;

type Page = 'page';

function NavLink<P extends NavLinkProps>(props: P) {
  const { to, isActive, exact, strict, sensitive, className, activeClassName, ...rest } = props;
  const context = useContext(Context);

  const toLocation = typeof to === 'function' ? to(context.location) : to;

  const { pathname } = typeof toLocation === 'string' ? parsePath(toLocation) : toLocation;

  const match = pathname
    ? matchPath(context.location.pathname, pathname, {
        exact: exact,
        strictMode: strict,
        caseSensitive: sensitive,
      })
    : null;

  const isLinkActive = !!(isActive ? isActive(match, context.location) : match);

  let classNames = typeof className === 'function' ? className(isLinkActive) : className;
  if (isLinkActive) {
    classNames = [activeClassName, classNames].filter(Boolean).join('');
  }

  const page: Page = 'page';
  const otherProps = {
    className: classNames,
    'aria-current': isLinkActive ? page : undefined,
    ...rest,
  };

  return <Link to={to} {...otherProps} />;
}

export default NavLink;
