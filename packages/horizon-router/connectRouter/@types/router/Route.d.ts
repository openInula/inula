import * as React from 'react';
import { History, Location } from './index';
import { Matched } from './matcher/parser';
import { GetURLParams } from './matcher/types';
export type RouteComponentProps<P extends Record<string, any> = {}, S = unknown> = RouteChildrenProps<P, S>;
export type RouteChildrenProps<P extends Record<string, any> = {}, S = unknown> = {
    history: History<S>;
    location: Location<S>;
    match: Matched<P> | null;
};
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
declare function Route<Path extends string, P extends Record<string, any> = GetURLParams<Path>>(props: RouteProps<P, Path>): JSX.Element;
export default Route;
