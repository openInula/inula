import type {ContextType} from '../../Types';
import {TYPE_PROVIDER, TYPE_CONTEXT} from '../../utils/elementType';

export function createContext<T>(val: T): ContextType<T> {
  const context: ContextType<T> = {
    vtype: TYPE_CONTEXT,
    value: val,
    Provider: null,
    Consumer: null,
  };

  context.Provider = {
    vtype: TYPE_PROVIDER,
    _context: context,
  };

  context.Consumer = context;

  return context;
}
