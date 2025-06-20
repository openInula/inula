import { useContext } from 'openinula';
import RouterContext from './context';
import { Matched, matchPath, Params } from '../matcher/parser';
import { History } from '../history/types';
import { Location } from './index';

function useHistory<S>(): History<S>;
function useHistory() {
  return useContext(RouterContext).history;
}

function useLocation<S>(): Location<S>;
function useLocation() {
  return useContext(RouterContext).location;
}

function useParams<P>(): Params<P> | {};
function useParams() {
  const match = useContext(RouterContext).match;
  return match ? match.params : {};
}

function useRouteMatch<P>(path?: string): Matched<P> | null;
function useRouteMatch(path?: string) {
  const pathname = useLocation().pathname;
  const match = useContext(RouterContext).match;
  if (path) {
    return matchPath(pathname, path);
  }
  return match;
}

export { useHistory, useLocation, useParams, useRouteMatch };
