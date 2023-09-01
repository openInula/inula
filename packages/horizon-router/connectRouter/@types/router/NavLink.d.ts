import type { LinkProps } from './Link';
import { Location } from './index';
import { Matched } from './matcher/parser';
type NavLinkProps = {
    to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
    isActive?: (match: Matched | null, location: Location) => boolean;
    [key: string]: any;
} & LinkProps;
declare function NavLink<P extends NavLinkProps>(props: P): JSX.Element;
export default NavLink;
