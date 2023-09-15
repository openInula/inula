import Inula from 'inulajs';
import { useContext } from 'inulajs';
import type { LinkProps } from './Link';
import Link from './Link';
import { Location, matchPath } from './index';
import { Matched } from './matcher/parser';
import Context from './context';
import { parsePath } from '../history/utils';

type NavLinkProps = {
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  isActive?: (match: Matched | null, location: Location) => boolean;
  [key: string]: any;
} & LinkProps;

type Page = 'page';

function NavLink<P extends NavLinkProps>(props: P) {
  const { to, isActive, ...rest } = props;
  const context = useContext(Context);

  const toLocation = typeof to === 'function' ? to(context.location) : to;

  const { pathname } = typeof toLocation === 'string' ? parsePath(toLocation) : toLocation;

  const match = pathname ? matchPath(context.location.pathname, pathname) : null;

  const isLinkActive = match && isActive ? isActive(match, context.location) : false;

  const page: Page = 'page';
  const otherProps = {
    'aria-current': isLinkActive ? page : false,
    ...rest,
  };

  return <Link to={to} {...otherProps} />;
}

export default NavLink;
