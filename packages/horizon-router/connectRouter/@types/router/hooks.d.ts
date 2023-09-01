import { Matched, Params } from './matcher/parser';
import { History } from '../history/types';
import { Location } from './index';
declare function useHistory<S>(): History<S>;
declare function useLocation<S>(): Location<S>;
declare function useParams<P>(): Params<P> | {};
declare function useRouteMatch<P>(path?: string): Matched<P> | null;
export { useHistory, useLocation, useParams, useRouteMatch };
