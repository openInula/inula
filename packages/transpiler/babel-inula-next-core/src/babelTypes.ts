import { type types as t } from '@babel/core';
import type babel from '@babel/core';
let _t: null | typeof types = null;
let babelApi: typeof babel | null = null;
export const register = (api: typeof babel) => {
  babelApi = api;
  _t = api.types;
};

export const getBabelApi = (): typeof babel => {
  if (!babelApi) {
    throw new Error('Please call register() before using the babel api');
  }
  return babelApi;
};

export const types = new Proxy(
  {},
  {
    get: (_, p, receiver) => {
      if (!_t) {
        throw new Error('Please call register() before using the babel types');
      }

      if (p in _t) {
        return Reflect.get(_t, p, receiver);
      }
      return undefined;
    },
  }
) as typeof t;
