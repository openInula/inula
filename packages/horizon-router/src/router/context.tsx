import { createContext } from 'react';
import { History, Location } from './index';
import { Matched } from './matcher/parser';

function createNamedContext<T>(name: string, defaultValue: T) {
  const context = createContext<T>(defaultValue);
  context.displayName = name;
  return context;
}

export type RouterContextValue = {
  history: History;
  location: Location;
  match: Matched | null;
};

const RouterContext = createNamedContext<RouterContextValue>('Router', {} as any);

export default RouterContext;