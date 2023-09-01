import * as React from 'react';
import { Location } from './index';
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
declare function Link<P extends LinkProps>(props: P): React.DOMElement<{
    href: string;
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
} & Omit<P, "replace" | "to" | "component" | "onClick" | "target">, Element>;
export default Link;
